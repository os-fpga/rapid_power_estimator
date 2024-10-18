#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import numpy as np
from dataclasses import dataclass, field
from typing import List
from utilities.common_utils import RsEnum, update_attributes
from .rs_device_resources import DspNotFoundException, RsDeviceResources
from .rs_message import RsMessage, RsMessageManager
from .rs_power_config import ElementType, PowerValue, ScenarioType
from .rs_logger import RsLogLevel, log

class Pipelining(RsEnum):
    INPUT_AND_OUTPUT = 0, "Input and Output"
    INPUT_ONLY = 1, "Input only"
    OUTPUT_ONLY = 2, "Output only"
    NONE = 3, "None"

class DSP_Mode(RsEnum):
    MULTIPLY_ACCUMULATE = 0, "Multiply Accumulate"
    MULTIPLY_ADD_SUB = 1, "Multiply Add Sub"
    MULTIPLY = 2, "Multiply"

@dataclass
class DSP_output:
    dsp_blocks_used : float = field(default=0.0)
    clock_frequency : int = field(default=0)
    output_signal_rate : float = field(default=0.0)
    block_power : float = field(default=0.0)
    interconnect_power : float = field(default=0.0)
    percentage : float = field(default=0.0)
    messages : List[RsMessage] = field(default_factory=list)

@dataclass
class DSP:
    enable : bool = field(default=False)
    name : str = field(default='')
    number_of_multipliers : int = field(default=0)
    dsp_mode : DSP_Mode = field(default=DSP_Mode.MULTIPLY_ACCUMULATE)
    a_input_width : int = field(default=16)
    b_input_width : int = field(default=16)
    clock : str = field(default='')
    pipelining : Pipelining = field(default=Pipelining.INPUT_AND_OUTPUT)
    toggle_rate : float = field(default=0.125)
    output : DSP_output = field(default_factory=DSP_output)

    def compute_percentage(self, total_power):
        if total_power > 0:
            self.output.percentage = (self.output.block_power + self.output.interconnect_power) / total_power * 100.0
        else:
            self.output.percentage = 0.0

    def compute_dynamic_power(self, clock, VCC_CORE, DSP_MULT_CAP, DSP_MULT_CAP2, DSP_INT_CAP):
        self.output.dsp_blocks_used = 0.0
        self.output.clock_frequency = 0
        self.output.output_signal_rate = 0.0
        self.output.block_power = 0.0
        self.output.interconnect_power = 0.0
        self.output.messages.clear()

        if clock == None:
            self.output.messages.append(RsMessageManager.get_message(301, { 'clock': self.clock }))
            return

        if self.enable == False:
            self.output.messages.append(RsMessageManager.get_message(102))
        else:
            # Calculate DSP blocks used
            if self.a_input_width < 10 and self.b_input_width < 11:
                self.output.dsp_blocks_used = self.number_of_multipliers * 0.5
            else:
                self.output.dsp_blocks_used = self.number_of_multipliers * 1.0

            # Set clock frequency
            self.output.clock_frequency = clock.frequency

            # Calculate output signal rate
            if self.pipelining in (Pipelining.INPUT_AND_OUTPUT, Pipelining.OUTPUT_ONLY) or self.dsp_mode == DSP_Mode.MULTIPLY_ACCUMULATE:
                self.output.output_signal_rate = (self.output.clock_frequency / 1000000.0) * self.toggle_rate
            elif self.pipelining == Pipelining.INPUT_ONLY:
                self.output.output_signal_rate = (self.output.clock_frequency / 1000000.0) * self.toggle_rate * 1.15
            else:
                self.output.output_signal_rate = (self.output.clock_frequency / 1000000.0) * self.toggle_rate * 1.25

            # Calculate intermediate values used in the power calculations below
            multiplier_signal_rate = (self.output.clock_frequency / 1000000.0) * self.toggle_rate * (1.0 if self.pipelining in (Pipelining.INPUT_AND_OUTPUT, Pipelining.INPUT_ONLY) else 1.2)
            block_factor = 2.0 if self.a_input_width <= 9 and self.b_input_width <= 10 else 1.0
            factor = 1.15 if self.pipelining in (Pipelining.OUTPUT_ONLY, Pipelining.NONE) else 1.0

            # Calculate block power
            if self.dsp_mode == DSP_Mode.MULTIPLY:
                # block power = VCC_CORE^2 * multiplier_signal_rate * DSP_MULT_CAP * no. of multipliers * (a-input width + b-input width) * factor / block_factor
                self.output.block_power = VCC_CORE ** 2 * multiplier_signal_rate * DSP_MULT_CAP * self.number_of_multipliers * (self.a_input_width + self.b_input_width) * factor / block_factor
            else:
                # p1 = VCC_CORE^2 * multiplier_signal_rate * DSP_MULT_CAP * no. of multipliers * (a-input width + b-input width)
                # p2 = no. of multipliers * clock_frequency * DSP_MULT_CAP2 * factor / block_factor
                # block_power = p1 + p2
                p1 = VCC_CORE ** 2 * multiplier_signal_rate * DSP_MULT_CAP * self.number_of_multipliers * (self.a_input_width + self.b_input_width)
                p2 = self.number_of_multipliers * (self.output.clock_frequency / 1000000.0) * DSP_MULT_CAP2 * factor / block_factor
                self.output.block_power = p1 + p2

            # Calculate interconnect power
            # interconnect_power = VCC_CORE^2 * output_signal_rate * no. of multipliers * (a-input width + b-input width) * DSP_INT_CAP
            self.output.interconnect_power = VCC_CORE ** 2 * self.output.output_signal_rate * self.number_of_multipliers * (self.a_input_width + self.b_input_width) * DSP_INT_CAP

class DSP_SubModule:

    def __init__(self, resources: RsDeviceResources, itemlist: List[DSP] = None):
        self.resources = resources
        self.total_dsp_blocks_available = resources.get_num_DSP_BLOCKs()
        self.total_interconnect_power = 0.0
        self.total_block_power = 0.0
        self.itemlist: List[DSP] = itemlist or []

    def get_resources(self):
        total_dsp_blocks_used = 0
        for item in self.itemlist:
            if item.enable:
                total_dsp_blocks_used += item.number_of_multipliers
        return total_dsp_blocks_used, self.total_dsp_blocks_available

    def get_total_output_power(self) -> float:
        return sum(self.get_power_consumption())

    def get_power_consumption(self):
        return self.total_block_power, self.total_interconnect_power

    def get_all_messages(self):
        return [message for item in self.itemlist for message in item.output.messages]

    def get_all(self):
        return self.itemlist

    def get(self, idx):
        if 0 <= idx < len(self.itemlist):
            return self.itemlist[idx]
        raise DspNotFoundException

    def add(self, data):
        item = update_attributes(DSP(), data)
        self.itemlist.append(item)
        return item

    def update(self, idx, data):
        item = update_attributes(self.get(idx), data)
        return item

    def remove(self, idx):
        if 0 <= idx < len(self.itemlist):
            item = self.itemlist.pop(idx)
            return item
        raise DspNotFoundException

    def clear(self) -> None:
        self.itemlist.clear()

    def compute_output_power(self):
        # Get power calculation coefficients
        VCC_CORE      = self.resources.get_VCC_CORE()
        DSP_MULT_CAP  = self.resources.get_DSP_MULT_CAP()
        DSP_MULT_CAP2 = self.resources.get_DSP_MULT_CAP2()
        DSP_INT_CAP   = self.resources.get_DSP_INT_CAP()

        # Compute the total power consumption of all clocks
        self.total_block_power = 0.0
        self.total_interconnect_power = 0.0

        # Compute the power consumption for each individual items
        for item in self.itemlist:
            item.compute_dynamic_power(self.resources.get_clock(item.clock), VCC_CORE, DSP_MULT_CAP, DSP_MULT_CAP2, DSP_INT_CAP)
            self.total_interconnect_power += item.output.interconnect_power
            self.total_block_power += item.output.block_power

        # update individual clock percentage
        total_power = self.total_block_power + self.total_interconnect_power
        for item in self.itemlist:
            item.compute_percentage(total_power)

    def compute_static_power(self, temperature: float, scenario: ScenarioType) ->  List[PowerValue]:
        DSP_BlOCKS = self.resources.get_num_DSP_BLOCKs()
        mylist = []

        for rail_type, scene_list in self.resources.powercfg.get_polynomial(ElementType.DSP, scenario):
            total_power = 0.0
            for s in scene_list:
                power = np.polyval(s.coeffs, temperature) * s.factor
                power = power * DSP_BlOCKS
                total_power += power
                # debug info
                log(f'[DSP] {rail_type = }', RsLogLevel.DEBUG)
                log(f'[DSP]   {temperature = }', RsLogLevel.DEBUG)
                log(f'[DSP]   {scenario = }', RsLogLevel.DEBUG)
                log(f'[DSP]   {s.coeffs = }', RsLogLevel.DEBUG)
                log(f'[DSP]   {s.factor = }', RsLogLevel.DEBUG)
                log(f'[DSP]   {DSP_BlOCKS = }', RsLogLevel.DEBUG)
                log(f'[DSP]   {power = }', RsLogLevel.DEBUG)
                log(f'[DSP]   {total_power = }', RsLogLevel.DEBUG)
            mylist.append(PowerValue(type=rail_type, value=total_power))

        return mylist
