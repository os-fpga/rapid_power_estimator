#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from dataclasses import dataclass, field
from enum import Enum
from utilities.common_utils import update_attributes
from .rs_device_resources import ModuleType
from .rs_message import RsMessage, RsMessageManager

class Clock_State(Enum):
    ACTIVE = 1
    GATED = 2

class Source(Enum):
    IO = 0
    RC_OSCILLATOR = 1
    BOOT_CLOCK = 2
    PLL0_FABRIC = 3
    PLL1_FABRIC = 4
    PLL1_SERDES = 5
    PLL2_SERDES = 6

@dataclass
class ClockOutput:
    fan_out : int = field(default=0)
    block_power : float = field(default=0.0)
    interconnect_power : float = field(default=0.0)
    percentage : float = field(default=0.0)
    messages : [RsMessage] = field(default_factory=list)

@dataclass
class Clock:
    enable : bool = field(default=False)
    description : str = field(default='')
    source : Source = field(default=Source.IO)
    port : str = field(default='')
    frequency : int = field(default=100000000)
    state : Clock_State = field(default=Clock_State.ACTIVE)
    output : ClockOutput = field(default_factory=ClockOutput)

    def compute_percentage(self, total_power):
        if total_power > 0:
            self.output.percentage = (self.output.block_power + self.output.interconnect_power) / total_power * 100.0
        else:
            self.output.percentage = 0.0

    def compute_dynamic_power(self, fan_out, CLK_CAP, CLK_INT_CAP):
        self.output.block_power = 0
        self.output.interconnect_power = 0
        self.output.fan_out = fan_out
        self.output.messages.clear()

        if self.enable == False:
            self.output.messages.append(RsMessageManager.get_message(101))
            return

        if self.state == Clock_State.ACTIVE:
            if fan_out == 0:
               self.output.messages.append(RsMessageManager.get_message(201))
            self.output.block_power = CLK_CAP * (self.frequency/1000000)
            self.output.interconnect_power = self.output.fan_out * CLK_INT_CAP * (self.frequency/1000000)

class Clock_SubModule:

    def __init__(self, resources, itemlist):
        self.resources = resources
        self.total_clock_available = resources.get_num_Clocks()
        self.total_pll_available = resources.get_num_PLLs()
        self.total_block_power = 0.0
        self.total_interconnect_power = 0.0
        self.total_pll_power = 0.0
        self.itemlist = itemlist

    def get_power_consumption(self):
        return self.total_block_power, self.total_interconnect_power, self.total_pll_power

    def get_resources(self):
        return self.total_clock_available, self.total_pll_available, self.get_total_clock_used(), self.get_total_pll_used()

    def get_all_messages(self):
        return [message for item in self.itemlist for message in item.output.messages]

    def get_all(self):
        return self.itemlist
    
    def get(self, idx):
        if 0 <= idx < len(self.itemlist):
            return self.itemlist[idx]
        else:
            raise ValueError("Invalid index. Clock doesn't exist at the specified index.")

    def add(self, data):
        # Check if the clock already exists based on the ID
        if any(item.description == data["description"]
                or item.port == data["port"]  for item in self.itemlist):
            raise ValueError("Clock description or port already exists in the list of clocks.")
        if len(self.itemlist) >= self.total_clock_available:
            raise ValueError("Maximum no. of clocks reached")
        item = update_attributes(Clock(), data)
        self.itemlist.append(item)
        return item

    def remove(self, idx):
        if 0 <= idx < len(self.itemlist):
            item = self.itemlist.pop(idx)
            return item
        else:
            raise ValueError("Invalid index. Clock doesn't exist at the specified index.")

    def update(self, idx, data):
        item = update_attributes(self.get(idx), data)
        return item

    def get_total_clock_used(self):
        total_clock_used = 0
        for clock in self.itemlist:
            if clock.enable == True and clock.state == Clock_State.ACTIVE:
                total_clock_used += 1
        return total_clock_used

    def get_total_pll_used(self):
        total_pll_used = 0
        for clock in self.itemlist:
            if clock.source in (Source.PLL0_FABRIC, Source.PLL1_FABRIC):
                total_pll_used += 1
        return total_pll_used

    def get_clock_fanout(self, clock):
        # calculate total fanout from other modules
        total_fanout = 0

        # fabric logic element
        if (mod := self.resources.get_module(ModuleType.FABRIC_LE)) is not None:
            total_fanout += sum(item.flip_flop for item in mod.get_all() \
                if item.clock == clock)

        # bram
        if (mod := self.resources.get_module(ModuleType.BRAM)) is not None:
            total_fanout += sum(item.bram_used for item in mod.get_all() \
                if item.port_a.clock == clock)
            total_fanout += sum(item.bram_used for item in mod.get_all() \
                if item.port_b.clock == clock)

        # dsp
        if (mod := self.resources.get_module(ModuleType.DSP)) is not None:
            total_fanout += sum(item.number_of_multipliers for item in mod.get_all() \
                if item.clock == clock)

        # io
        # todo: There is an excel formula logical error to calculate the fanout.
        #       The condition will never satisfy
        #       Futher discussion needed.

        # peripheral
        # todo: There seems to be an excel logical error that double the fanout.
        #       This could be due to merged cell
        #       Futher discussion needed.

        return total_fanout

    def compute_output_power(self):
        # Get device power coefficients
        VCC_CORE    = self.resources.get_VCC_CORE()
        VCC_AUX     = self.resources.get_VCC_AUX()
        CLK_CAP     = self.resources.get_CLK_CAP()
        CLK_INT_CAP = self.resources.get_CLK_INT_CAP()
        PLL_INT     = self.resources.get_PLL_INT()
        PLL_AUX     = self.resources.get_PLL_AUX()

        # Compute the total power consumption of all clocks
        self.total_block_power = 0.0
        self.total_interconnect_power = 0.0

        # Compute the total power consumption of all PLLs 
        self.total_pll_power = self.get_total_pll_used() * ((PLL_INT * VCC_CORE ** 2) + (PLL_AUX * VCC_AUX ** 2))
        
        # Compute the power consumption for each individual clocks
        for item in self.itemlist:
            item.compute_dynamic_power(self.get_clock_fanout(item.port), CLK_CAP, CLK_INT_CAP)
            self.total_interconnect_power += item.output.interconnect_power
            self.total_block_power += item.output.block_power

        # update individual clock percentage
        total_power = self.total_block_power + self.total_interconnect_power + self.total_pll_power
        for item in self.itemlist:
            item.compute_percentage(total_power)
