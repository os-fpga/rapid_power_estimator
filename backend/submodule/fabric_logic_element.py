#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from dataclasses import dataclass, field
from enum import Enum
# from clock import Clock
from utilities.common_utils import update_attributes

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

    def __init__(self, enable=False, name='', lut6=0, flip_flop=0, clock='', toggle_rate=12.5, glitch_factor=Glitch_Factor.TYPICAL) -> None:
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
            # self.output.clock_frequency = self.clock.clock_frequency
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
    def __init__(self, resources, fabric_les):
        self.resources = resources
        self.total_lut6_available = resources.get_num_LUTs()
        self.total_flipflop_available = resources.get_num_FFs()
        self.fabric_les = fabric_les

    def get_fabric_le_resources(self):
        total_lut6_used = 0
        total_flipflop_used = 0
        for fabric_le in self.fabric_les:
            total_lut6_used += fabric_le.lut6
            total_flipflop_used += fabric_le.flip_flop
        total_lut6_balance = self.total_lut6_available - total_lut6_used
        total_flipflop_balance = self.total_flipflop_available - total_flipflop_used
        lut6_balance_percentage = total_lut6_balance / self.total_lut6_available * 100
        flipflop_balance_percentage = total_flipflop_balance / self.total_flipflop_available * 100
        return total_lut6_used, total_lut6_balance, self.total_lut6_available, lut6_balance_percentage, \
            total_flipflop_used, total_flipflop_balance, self.total_flipflop_available, flipflop_balance_percentage
    
    def get_fabric_les(self):
        return self.fabric_les
    
    def get_fabric_le(self, idx):
        if 0 <= idx < len(self.fabric_les):
            return self.fabric_les[idx]
        else:
            raise ValueError("Invalid index. Fabric LEs doesn't exist at the specified index.")
        
    def add_fabric_le(self, fabric_le_data):
        # check if the fabric_le already exists based on the description
        if any(existing_fabric_le.name == fabric_le_data["name"] for existing_fabric_le in self.fabric_les):
            raise ValueError("Fabric LE with same description already exists.")
        fabric_le = update_attributes(Fabric_LE(), fabric_le_data)
        fabric_le.compute_dynamic_power()
        self.fabric_les.append(fabric_le)
        return fabric_le
    
    def delete_fabric_le(self, idx):
        if 0 <= idx < len(self.fabric_les):
            deleted_fabric_le = self.fabric_les[idx]
            del self.fabric_les[idx]
            return deleted_fabric_le
        else:
            raise ValueError("Invalid index. Fabric LEs doesn't exist at the specified index.")
        
    def update_fabric_le(self, idx, fabric_le_data):
        updated_fabric_le = update_attributes(self.get_fabric_le(idx), fabric_le_data)
        updated_fabric_le.compute_dynamic_power()
        return updated_fabric_le

    def compute_output_power(self):
        # todo
        return 0, 0
