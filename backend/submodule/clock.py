#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from dataclasses import dataclass, field
from enum import Enum
from utilities.common_utils import update_attributes

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
    message : str = field(default='')

    def __init__(self, fan_out=0, block_power=0.0, interconnect_power=0.0, percentage=0.0, message=''):
        self.fan_out = fan_out
        self.block_power = block_power
        self.interconnect_power = interconnect_power
        self.percentage = percentage
        self.message = message

@dataclass
class Clock:
    enable : bool = field(default=False)
    description : str = field(default='')
    source : Source = field(default=Source.IO)
    port : str = field(default='')
    frequency : int = field(default=100000000)
    state : Clock_State = field(default=Clock_State.ACTIVE)
    output : ClockOutput = field(default_factory=ClockOutput())

    def __init__(self, enable=False, description='', source=Source.IO, port='', frequency=100000000, state=Clock_State.ACTIVE):
        self.enable = enable
        self.description = description
        self.source = source
        self.port = port
        self.frequency = frequency
        self.state = state
        self.output = ClockOutput()

    def compute_percentage(self, total_power):
        if (total_power > 0):
            self.output.percentage = (self.output.block_power + self.output.interconnect_power) / total_power * 100.0
        else:
            self.output.percentage = 0.0

    def compute_dynamic_power(self, fan_out, clock_cap_block, clock_cap_interconnect) -> float:
        if self.enable == True and self.state == Clock_State.ACTIVE:
            self.output.fan_out = fan_out # fan out calculate whether the clock is being used by other module
            self.output.block_power = clock_cap_block * (self.frequency/1000000)
            self.output.interconnect_power = self.output.fan_out * clock_cap_interconnect * (self.frequency/1000000)
            self.output.message = ''
        else:
            self.output.fan_out = fan_out
            self.output.block_power = 0
            self.output.interconnect_power = 0
            self.output.message = ''

class Clock_SubModule:

    def __init__(self, resources, clocks):
        self.resources = resources
        self.total_clock_available = resources.get_num_Clocks()
        self.total_pll_available = resources.get_num_PLLs()
        self.total_clock_power = 0.0
        self.total_interconnect_power = 0.0
        self.total_pll_power = 0.0
        self.clocks = clocks

    def get_power_consumption(self):
        return self.total_clock_power, self.total_interconnect_power, self.total_pll_power

    def get_resources(self):
        return self.total_clock_available, self.total_pll_available, self.get_total_clock_used(), self.get_total_pll_used()

    def get_all(self):
        return self.clocks
    
    def get(self, idx):
        if 0 <= idx < len(self.clocks):
            return self.clocks[idx]
        else:
            raise ValueError("Invalid index. Clock doesn't exist at the specified index.")

    def add(self, clock_data):
        # Check if the clock already exists based on the ID
        if any(existing_clock.description == clock_data["description"] 
                or existing_clock.port == clock_data["port"]  for existing_clock in self.clocks):
            raise ValueError("Clock description or port already exists in the list of clocks.")
        if len(self.clocks) >= self.total_clock_available:
            raise ValueError("Maximum no. of clocks reached")
        clock = update_attributes(Clock(), clock_data)
        self.clocks.append(clock)
        return clock

    def remove(self, idx):
        if 0 <= idx < len(self.clocks):
            removed_dsp = self.clocks.pop(idx)
            return removed_dsp
        else:
            raise ValueError("Invalid index. Clock doesn't exist at the specified index.")

    def update(self, idx, clock_data):
        clock = update_attributes(self.get(idx), clock_data)
        return clock

    def get_total_clock_used(self):
        total_clock_used = 0
        for clock in self.clocks:
            if clock.enable == True and clock.state == Clock_State.ACTIVE:
                total_clock_used += 1
        return total_clock_used

    def get_total_pll_used(self):
        total_pll_used = 0
        for clock in self.clocks:
            if clock.source in (Source.PLL0_FABRIC, Source.PLL1_FABRIC):
                total_pll_used += 1
        return total_pll_used

    def compute_output_power(self):
        # Get device power coefficients
        VCC_CORE    = self.resources.get_VCC_CORE()
        VCC_AUX     = self.resources.get_VCC_AUX()
        CLK_CAP     = self.resources.get_CLK_CAP()
        CLK_INT_CAP = self.resources.get_CLK_INT_CAP()
        PLL_INT     = self.resources.get_PLL_INT()
        PLL_AUX     = self.resources.get_PLL_AUX()

        # Compute the total power consumption of all clocks
        self.total_clock_power = 0.0
        self.total_interconnect_power = 0.0

        # Compute the total power consumption of all PLLs 
        self.total_pll_power = self.get_total_pll_used() * ((PLL_INT * VCC_CORE ** 2) + (PLL_AUX * VCC_AUX ** 2))
        
        # Compute the power consumption for each individual clocks
        for clock in self.clocks:
            clock.compute_dynamic_power(self.resources.get_clocking_fanout(clock.port), CLK_CAP, CLK_INT_CAP)
            self.total_interconnect_power += clock.output.interconnect_power
            self.total_clock_power += clock.output.block_power

        # update individual clock percentage
        total_power = self.total_clock_power + self.total_interconnect_power + self.total_pll_power
        for clock in self.clocks:
            clock.compute_percentage(total_power)
