#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List
from utilities.common_utils import RsEnum, update_attributes
from .rs_device_resources import FabricLeNotFoundException, FabricLeDescriptionAlreadyExistsException, RsDeviceResources
from .rs_message import RsMessage, RsMessageManager
from .rs_power_config import ElementType, ScenarioType, PowerValue
from .rs_logger import RsLogLevel, log

class Glitch_Factor(RsEnum):
    TYPICAL = 0, "Typical"
    HIGH = 1, "High"
    VERY_HIGH = 2, "Very High"

@dataclass
class Fabric_LE_output:
    clock_frequency : int = field(default=0)
    output_signal_rate : float = field(default=0.0)
    block_power : float = field(default=0.0)
    interconnect_power : float = field(default=0.0)
    percentage : float = field(default=0.0)
    messages : List[RsMessage] = field(default_factory=list)

@dataclass
class Fabric_LE:
    enable : bool = field(default=False)
    name : str = field(default='')
    lut6 : int = field(default=0)
    flip_flop : int = field(default=0)
    clock : str = field(default='')
    toggle_rate : float = field(default=0.125)
    glitch_factor : Glitch_Factor = field(default=Glitch_Factor.TYPICAL)
    clock_enable_rate : float = field(default=0.5)
    output : Fabric_LE_output = field(default_factory=Fabric_LE_output)

    def compute_percentage(self, total_power):
        if total_power > 0:
            self.output.percentage = (self.output.block_power + self.output.interconnect_power) / total_power * 100.0
        else:
            self.output.percentage = 0.0

    def get_glitch_factor(self):
        if self.glitch_factor == Glitch_Factor.TYPICAL:
            return 1
        elif self.glitch_factor == Glitch_Factor.HIGH:
            return 2
        else:
            return 4 

    def compute_dynamic_power(self, clock, VCC_CORE, LUT_CAP, FF_CAP, FF_CLK_CAP, LUT_INT_CAP, FF_INT_CAP):
        self.output.clock_frequency = 0
        self.output.output_signal_rate = 0.0
        self.output.block_power = 0.0
        self.output.interconnect_power = 0.0
        self.output.messages.clear()

        if clock == None:
            self.output.messages.append(RsMessageManager.get_message(301, { 'clock': self.clock }))
            return

        if self.enable == False:
            self.output.messages.append(RsMessageManager.get_message(103))
        else:
            # set clock freq
            self.output.clock_frequency = clock.frequency

            # output signal rate = clock freq * toggle rate * clock enable rate
            if self.lut6 > 0:
                self.output.output_signal_rate = (clock.frequency / 1000000.0) * self.toggle_rate * self.clock_enable_rate
            elif self.flip_flop > 0:
                self.output.output_signal_rate = (clock.frequency / 1000000.0) * self.toggle_rate
            else:
                self.output.output_signal_rate = 0

            # p1 = VCC_CORE^2 * lut * output signal rate * LUT_CAP * glitch factor
            # p2 = VCC_CORE^2 * ff * output signal rate * FF_CAP 
            # p3 = VCC_CORE^2 * ff * clock freq * clock enable rate * FF_CLK_CAP
            # block power = p1 + p2 + p3
            p1 = VCC_CORE ** 2 * self.lut6 * self.output.output_signal_rate * LUT_CAP * self.get_glitch_factor()
            p2 = VCC_CORE ** 2 * self.flip_flop * self.output.output_signal_rate * FF_CAP
            p3 = VCC_CORE ** 2 * self.flip_flop * (clock.frequency / 1000000.0) * self.clock_enable_rate * FF_CLK_CAP
            self.output.block_power = p1 + p2 + p3

            # p1 = VCC_CORE^2 * lut * output signal rate * LUT_INT_CAP * glitch factor
            # p2 = VCC_CORE^2 * ff * output signal rate * FF_INT_CAP
            # interconnect power = p1 + p2 
            p1 = VCC_CORE ** 2 * self.lut6 * self.output.output_signal_rate * LUT_INT_CAP * self.get_glitch_factor()
            p2 = VCC_CORE ** 2 * self.flip_flop * self.output.output_signal_rate * FF_INT_CAP
            self.output.interconnect_power = p1 + p2
        
class Fabric_LE_SubModule:

    def __init__(self, resources: RsDeviceResources, itemlist: List[Fabric_LE] = None):
        self.resources = resources
        self.total_lut6_available = resources.get_num_LUTs()
        self.total_flipflop_available = resources.get_num_FFs()
        self.total_block_power = 0.0
        self.total_interconnect_power = 0.0
        self.itemlist: List[Fabric_LE] = itemlist or []

    def get_total_output_power(self) -> float:
        return sum(self.get_power_consumption())

    def get_power_consumption(self):
        return self.total_block_power, self.total_interconnect_power

    def get_resources(self):
        total_lut6_used = 0
        total_flipflop_used = 0
        for item in self.itemlist:
            total_lut6_used += item.lut6
            total_flipflop_used += item.flip_flop
        return total_lut6_used, self.total_lut6_available, total_flipflop_used, self.total_flipflop_available
    
    def get_all_messages(self):
        return [message for item in self.itemlist for message in item.output.messages]

    def get_all(self):
        return self.itemlist
    
    def get(self, idx):
        if 0 <= idx < len(self.itemlist):
            return self.itemlist[idx]
        raise FabricLeNotFoundException

    def add(self, data):
        # check if the fabric_le already exists based on the description
        if any(item.name == data["name"] for item in self.itemlist):
            raise FabricLeDescriptionAlreadyExistsException
        item = update_attributes(Fabric_LE(), data)
        self.itemlist.append(item)
        return item
    
    def remove(self, idx):
        if 0 <= idx < len(self.itemlist):
            item = self.itemlist.pop(idx)
            return item
        raise FabricLeNotFoundException

    def clear(self) -> None:
        self.itemlist.clear()

    def update(self, idx, data):
        item = update_attributes(self.get(idx), data)
        return item

    def compute_output_power(self):
        # Get device power coefficients
        VCC_CORE    = self.resources.get_VCC_CORE()
        LUT_CAP     = self.resources.get_LUT_CAP()
        LUT_INT_CAP = self.resources.get_LUT_INT_CAP()
        FF_CAP      = self.resources.get_FF_CAP()
        FF_CLK_CAP  = self.resources.get_FF_CLK_CAP()
        FF_INT_CAP  = self.resources.get_FF_INT_CAP()

        # Compute the total power consumption of all logic elements
        self.total_block_power = 0.0
        self.total_interconnect_power = 0.0

        # Compute the power consumption for each individual logic element
        for item in self.itemlist:
            item.compute_dynamic_power(self.resources.get_clock(item.clock), VCC_CORE, LUT_CAP, FF_CAP, FF_CLK_CAP, LUT_INT_CAP, FF_INT_CAP)
            self.total_block_power += item.output.block_power
            self.total_interconnect_power += item.output.interconnect_power

        # Update individual logic element percentage
        total_power = self.total_block_power + self.total_interconnect_power
        for item in self.itemlist:
            item.compute_percentage(total_power)

    def compute_static_power(self, temperature: float, scenario: ScenarioType) -> List[PowerValue]:
        NUM_CLB = self.resources.get_num_CLBs()
        mylist = []

        for rail_type, scene_list in self.resources.powercfg.get_polynomial(ElementType.FABRIC_LE, scenario):
            total_power = 0.0
            for s in scene_list:
                power = np.polyval(s.coeffs, temperature) * s.factor
                power = power * NUM_CLB
                total_power += power
                # debug info
                log(f'[FLE] {rail_type = }', RsLogLevel.DEBUG)
                log(f'[FLE]   {temperature = }', RsLogLevel.DEBUG)
                log(f'[FLE]   {scenario = }', RsLogLevel.DEBUG)
                log(f'[FLE]   {s.coeffs = }', RsLogLevel.DEBUG)
                log(f'[FLE]   {s.factor = }', RsLogLevel.DEBUG)
                log(f'[FLE]   {NUM_CLB = }', RsLogLevel.DEBUG)
                log(f'[FLE]   {power = }', RsLogLevel.DEBUG)
                log(f'[FLE]   {total_power = }', RsLogLevel.DEBUG)
            mylist.append(PowerValue(type=rail_type, value=total_power))

        return mylist
