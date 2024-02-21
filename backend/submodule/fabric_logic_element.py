#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from dataclasses import dataclass, field
from enum import Enum
from backend.utilities.common_utils import update_attributes

class Glitch_Factor(Enum):
    TYPICAL = 0 
    HIGH = 1
    VERY_HIGH = 2

@dataclass
class Fabric_LE_output:
    clock_frequency : int = field(default=100000000)
    output_signal_rate : float = field(default=0.0)
    block_power : float = field(default=0.0)
    interconnect_power : float = field(default=0.0)
    percentage : float = field(default=100.0)
    message : str = field(default='')

    def __init__(self, clock_frequency=100000000, output_signal_rate=0.0, block_power=0.0, interconnect_power=0.0, percentage=100.0, message='') -> None:
        self.clock_frequency = clock_frequency
        self.output_signal_rate = output_signal_rate
        self.block_power = block_power
        self.interconnect_power = interconnect_power
        self.percentage = percentage
        self.message = message

@dataclass
class Fabric_LE:
    enable : bool = field(default=False)
    name : str = field(default='')
    lut6 : int = field(default=0)
    flip_flop : int = field(default=0)
    clock : str = field(default='')
    toggle_rate : float = field(default=12.5)
    glitch_factor : Glitch_Factor = field(default=Glitch_Factor.TYPICAL)
    percentage : float = field(default=100.0)
    output : Fabric_LE_output = field(default_factory=Fabric_LE_output())

    def __init__(self, enable=False, name='', lut6=0, flip_flop=0, clock='', toggle_rate=0.125, glitch_factor=Glitch_Factor.VERY_HIGH, clock_enable_rate=0.5) -> None:
        self.enable = enable
        self.name = name
        self.lut6 = lut6
        self.flip_flop = flip_flop
        self.clock = clock
        self.toggle_rate = toggle_rate
        self.glitch_factor = glitch_factor
        self.clock_enable_rate = clock_enable_rate
        self.output = Fabric_LE_output()

    def compute_percentage(self, total_power):
        if (total_power > 0):
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
        if clock == None:
            self.output.message = f"Invalid clock {self.clock}"
            return

        if self.enable:
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
            self.output.message = ''
        else:
            self.output.message = 'This logic is disabled'
        
class Fabric_LE_SubModule:

    def __init__(self, resources, itemlist):
        self.resources = resources
        self.total_lut6_available = resources.get_num_LUTs()
        self.total_flipflop_available = resources.get_num_FFs()
        self.total_block_power = 0.0
        self.total_interconnect_power = 0.0
        self.itemlist = itemlist

    def get_power_consumption(self):
        return self.total_block_power, self.total_interconnect_power

    def get_resources(self):
        total_lut6_used = 0
        total_flipflop_used = 0
        for item in self.itemlist:
            total_lut6_used += item.lut6
            total_flipflop_used += item.flip_flop
        return total_lut6_used, self.total_lut6_available, total_flipflop_used, self.total_flipflop_available
    
    def get_all(self):
        return self.itemlist
    
    def get(self, idx):
        if 0 <= idx < len(self.itemlist):
            return self.itemlist[idx]
        else:
            raise ValueError("Invalid index. Fabric LEs doesn't exist at the specified index.")
        
    def add(self, data):
        # check if the fabric_le already exists based on the description
        if any(item.name == data["name"] for item in self.itemlist):
            raise ValueError("Fabric LE with same description already exists.")
        item = update_attributes(Fabric_LE(), data)
        self.itemlist.append(item)
        return item
    
    def remove(self, idx):
        if 0 <= idx < len(self.itemlist):
            item = self.itemlist.pop(idx)
            return item
        else:
            raise ValueError("Invalid index. Fabric LE doesn't exist at the specified index.")
        
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
