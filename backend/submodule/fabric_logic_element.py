#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from dataclasses import dataclass, field
from enum import Enum
from clock import Clock

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
    clock : Clock = field(default=None)
    toggle_rate : float = field(default=12.5)
    glitch_factor : Glitch_Factor = field(default=Glitch_Factor.TYPICAL)
    percentage : float = field(default=100.0)
    output : Fabric_LE_output = field(default=Fabric_LE_output())

    def __init__(self, enable=False, name='', lut6=0, flip_flop=0, clock=None, toggle_rate=12.5, glitch_factor=Glitch_Factor.TYPICAL) -> None:
        self.enable = enable
        self.name = name
        self.lut6 = lut6
        self.flip_flop = flip_flop
        self.clock = clock
        self.toggle_rate = toggle_rate
        self.glitch_factor = glitch_factor
        self.output = Fabric_LE_output()

    def compute_dynamic_power(self):
        if self.enable:
            pass
            # todo fill up the power estimation based on formula
            self.output.clock_frequency = self.clock.clock_frequency
            # self.output.output_signal_rate
            # self.output.block_power
            # self.output.interconnect_power
            # self.output.percentage
            self.output.message = ''
            return self.output
        else:
            self.output.message = 'This logic is disabled'
            return 0
        
class Fabric_LE_SubModule:
    fabric_les = []
    def __init__(self, fabric_les):
        self.fabric_les = fabric_les

    def get_fabric_le_resources(self, total_lut6_available, total_flipflop_available):
        total_lut6_used = 0
        total_flipflop_used = 0
        for fabric_le in self.fabric_les:
            total_lut6_used += fabric_le.lut6
            total_flipflop_used += fabric_le.flip_flop
        total_lut6_balance = total_lut6_available - total_lut6_used
        total_flipflop_balance = total_flipflop_available - total_flipflop_used
        lut6_balance_percentage = total_lut6_balance / total_lut6_available * 100
        flipflop_balance_percentage = total_flipflop_balance / total_flipflop_available * 100
        return total_lut6_used, total_lut6_balance, total_lut6_available, lut6_balance_percentage, \
            total_flipflop_used, total_flipflop_balance, total_flipflop_available, flipflop_balance_percentage
    
    def get_fabric_les(self):
        return self.fabric_les
    
    def get_fablic_le(self, idx):
        if 0 <= idx < len(self.fabric_les):
            return self.fabric_les[idx]
        else:
            raise ValueError("Invalid index. Fabric LEs doesn't exist at the specified index.")
        
    def add_fabric_le(self, fabric_le):
        # check if the fabric_le already exists based on the description
        if any(existing_fabric_le.name == fabric_le.name for existing_fabric_le in self.fabric_les):
            raise ValueError("Fabric LE with same description already exists.")
        self.fabric_les.append(fabric_le)
    
    def delete_fabric_le(self, idx):
        if 0 <= idx < len(self.fabric_les):
            del self.fabric_les[idx]
        else:
            raise ValueError("Invalid index. Fabric LEs doesn't exist at the specified index.")
        
    def update_fabric_le(self, idx, fabric_le_data):
        if 0 <= idx < len(self.fabric_les):
            self.fabric_les[idx].enable = fabric_le_data['enable']
            self.fabric_les[idx].name = fabric_le_data['name']
            self.fabric_les[idx].lut6 = fabric_le_data['lut6']
            self.fabric_les[idx].flip_flop = fabric_le_data['flip_flop']
            self.fabric_les[idx].clock = fabric_le_data['clock']
            self.fabric_les[idx].toggle_rate = fabric_le_data['toggle_rate']
            self.fabric_les[idx].glitch_factor = fabric_le_data['glitch_factor']
            self.fabric_les[idx].percentage = fabric_le_data['percentage']
        else:
            raise ValueError("Invalid index. Fabric LEs doesn't exist at the specified index.")

