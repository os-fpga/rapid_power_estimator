#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from dataclasses import dataclass, field
from enum import Enum
#from clock import Clock
from utilities.common_utils import update_attributes

class BRAM_Type(Enum):
    BRAM_18K_SDP = 0
    BRAM_36K_SDP = 1
    BRAM_18k_TDP = 2
    BRAM_36k_TDP = 3
    BRAM_18K_SP = 4
    BRAM_36K_SP = 5
    BRAM_18K_FIFO = 6
    BRAM_36K_FIFO = 7
    BRAM_18K_ROM = 8
    BRAM_36K_ROM = 9

@dataclass
class PortOutputProperties:
    clock_frequency: int = field(default=100000000)
    output_signal_rate: float = field(default=0.0)
    ram_depth: int = field(default=1024)

    def __init__(self, clock_frequency: int = 100000000, output_signal_rate: float = 0.0, ram_depth: int = 1024):
        self.clock_frequency = clock_frequency
        self.output_signal_rate = output_signal_rate
        self.ram_depth = ram_depth

@dataclass
class BRAM_output:
    port_a: PortOutputProperties = field(default_factory=PortOutputProperties)
    port_b: PortOutputProperties = field(default_factory=PortOutputProperties)
    block_power : float = field(default=0.0)
    interconnect_power : float = field(default=0.0)
    percentage : float = field(default=0.0)
    message : str = field(default='')

@dataclass
class PortProperties:
    clock: str = field(default='')
    width: int = field(default=16)
    write_enable_rate: float = field(default=0.5)
    read_enable_rate: float = field(default=0.5)
    toggle_rate: float = field(default=0.125)

@dataclass
class BRAM:
    enable : bool = field(default=False)
    name : str = field(default='')
    type : BRAM_Type = field(default=BRAM_Type.BRAM_18K_SDP)
    bram_used : int = field(default=0)
    port_a: PortProperties = field(default_factory=PortProperties)
    port_b: PortProperties = field(default_factory=PortProperties)
    output : BRAM_output = field(default_factory=BRAM_output())

    def __init__(
        self,
        enable: bool = False,
        name: str = '',
        type: BRAM_Type = BRAM_Type.BRAM_18K_SDP,
        bram_used: int = 0,
    ):
        self.enable = enable
        self.name = name
        self.type = type
        self.bram_used = bram_used
        self.port_a = PortProperties()
        self.port_b = PortProperties()
        self.output = BRAM_output()

    def compute_dynamic_power(self):
        if self.enable:
            # todo
            pass
        else:
            return 0

class BRAM_SubModule:

    def __init__(self, resources, itemlist):
        self.resources = resources
        self.total_18k_bram_available = resources.get_num_18K_BRAM()
        self.total_36k_bram_available = resources.get_num_36K_BRAM()
        self.itemlist = itemlist

    def get_resources(self):
        total_18k_bram_used = 0
        total_36k_bram_used = 0
        for item in self.itemlist:
            if (item.type.value & 1) == 0:
                total_18k_bram_used += item.bram_used
            else:
                total_36k_bram_used += item.bram_used
        return total_18k_bram_used, self.total_18k_bram_available, total_36k_bram_used, self.total_36k_bram_available

    def get_power_consumption(self):
        # todo
        return 0.123, 0.456

    def get_all(self):
        return self.itemlist

    def get(self, idx):
        if 0 <= idx < len(self.itemlist):
            return self.itemlist[idx]
        else:
            raise ValueError("Invalid index. BRAM doesn't exist at the specified index.")

    def add(self, data):
        item = update_attributes(BRAM(), data)
        self.itemlist.append(item)
        return item

    def update(self, idx, data):
        item = update_attributes(self.get(idx), data)
        return item

    def remove(self, idx):
        if 0 <= idx < len(self.itemlist):
            item = self.itemlist.pop(idx)
            return item
        else:
            raise ValueError("Invalid index. BRAM doesn't exist at the specified index.")

    def compute_output_power(self):
        pass
