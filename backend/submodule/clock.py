#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from dataclasses import dataclass, field
from enum import Enum

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
    
    def compute_dynamic_power(self, clock_cap) -> float:
        if self.enable == True:
            # todo
            self.output.fan_out = 0 # fan out calculate whether the clock is being used by other module
            self.output.block_power = clock_cap * (self.frequency/1000000)
            self.output.interconnect_power = self.output.fan_out * clock_cap * (self.frequency/1000000)
            self.output.percentage = 100.0 # todo
            self.output.message = ''
            return self.output
        else:
            return 0

class Clock_SubModule:
    clocks = []
    def __init__(self, clocks):
        self.clock_cap = 0.00001 # this is the clock_cap magic number should be pass into clock_submodule
        self.clocks = clocks

    def get_clocking_resources(self, total_clock_available, total_pll_available):
        total_clock_used = sum(1 for clock in self.clocks if clock.enable and clock.source == Source.IO)
        total_pll_used = sum(1 for clock in self.clocks if clock.enable and clock.source != Source.IO)

        used_clocks = total_clock_available - total_clock_used
        used_plls = total_pll_available - total_pll_used
        used_clocks_percentage = used_clocks / total_clock_available * 100
        used_plls_percentage = used_plls / total_pll_available * 100
        used_clocks_power = 0.0  # todo, figure out the formula to calculate the power
        used_plls_power = 0.0  # todo, figure out the formula to calculate the power
        return used_clocks, used_plls, used_clocks_percentage, used_plls_percentage, used_clocks_power, used_plls_power

    def get_clocks(self):
        return self.clocks
    
    def get_clock(self, idx):
        # Check if the index is within the valid range
        if 0 <= idx < len(self.clocks):
            # Return the clock at the specified index
            return self.clocks[idx]
        else:
            raise ValueError("Invalid index. Clock doesn't exist at the specified index.")

    def add_clock(self, clock):
        # Check if the clock already exists based on the ID
        if any(existing_clock.description == clock.description for existing_clock in self.clocks):
            raise ValueError("Clock description already exists in the list of clocks.")
        # Add the clock to the list
        self.clocks.append(clock)

    def delete_clock(self, idx):
        # Check if the index is within the valid range
        if 0 <= idx < len(self.clocks):
            # Remove the clock at the specified index
            deleted_clock = self.clocks[idx]
            del self.clocks[idx]
            return deleted_clock
        else:
            raise ValueError("Invalid index. Clock doesn't exist at the specified index.")

    def update_clock(self, idx, clock_data):
        # Check if the provided index is valid
        if 0 <= idx < len(self.clocks):
            self.clocks[idx].enable = clock_data['enable']
            self.clocks[idx].description = clock_data['description']
            self.clocks[idx].source = clock_data['source']
            self.clocks[idx].port = clock_data['port']
            self.clocks[idx].frequency = clock_data['frequency']
            self.clocks[idx].state = clock_data['state']
        else:
            raise ValueError("Invalid index provided for updating the clock.")
    
    def compute_clocks_output_power(self):
        # Compute the total power consumption of all clocks
        total_power = 0
        for clock in self.clocks:
            total_power += clock.compute_dynamic_power()
        return total_power

if __name__ == '__main__':
    pass

