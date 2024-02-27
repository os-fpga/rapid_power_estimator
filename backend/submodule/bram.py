#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from dataclasses import dataclass, field
from enum import Enum
from submodule.clock import Clock
from utilities.common_utils import update_attributes

class BRAM_IO_DIRECTION(Enum):
    INPUT_ONLY = 0
    OUTPUT_ONLY = 1
    INPUT_AND_OUTPUT = 2

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


def get_bram_capacity(bram_type):
    # Iterate over enum members
    for member in BRAM_Type:
        if "18K" in member.name:
            if member == bram_type:
                return 1024
        elif "36K" in member.name:
            if member == bram_type:
                return 2048
    return None  # If no match is found

@dataclass
class PortOutputProperties:
    clock_frequency: int = field(default=0)
    output_signal_rate: float = field(default=0.0)
    ram_depth: int = field(default=1024)

    def __init__(self, clock_frequency: int = 0, output_signal_rate: float = 0.0, ram_depth: int = 1024):
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
    clock_frequency : int = field(default=0)
    width: int = field(default=16)
    write_enable_rate: float = field(default=0.5)
    read_enable_rate: float = field(default=0.5)
    toggle_rate: float = field(default=0.125)

def set_default_write_read_bram_properties(
        bram_type, port_a_properties: PortProperties, port_b_properties: PortProperties):
    if "SDP" in bram_type.name or "FIFO" in bram_type.name:
        port_a_properties.read_enable_rate = 0
        port_b_properties.write_enable_rate = 0
    elif "SP " in bram_type.name:
        port_b_properties.write_enable_rate = 0
        port_b_properties.read_enable_rate = 0
        port_b_properties.width = 0
        port_b_properties.toggle_rate = 0
        port_b_properties.clock = None
    elif "ROM " in bram_type.name:
        port_a_properties.write_enable_rate = 0
        port_b_properties.write_enable_rate = 0
        port_b_properties.read_enable_rate = 0
        port_b_properties.width = 0
        port_b_properties.toggle_rate = 0
        port_b_properties.clock = None

@dataclass
class BRAM:
    enable : bool = field(default=False)
    name : str = field(default='')
    type : BRAM_Type = field(default=BRAM_Type.BRAM_18K_SDP)
    bram_used : int = field(default=0)
    clock : str = field(default='')
    port_a: PortProperties = field(default_factory=PortProperties)
    port_b: PortProperties = field(default_factory=PortProperties)
    output : BRAM_output = field(default_factory=BRAM_output())

    def __init__(
        self,
        enable: bool = False,
        name: str = '',
        type: BRAM_Type = BRAM_Type.BRAM_18K_SDP,
        clock: Clock = None,
        bram_used: int = 0,
    ):
        self.enable = enable
        self.name = name
        self.type = type
        self.bram_used = bram_used
        self.clock = clock
        self.port_a = PortProperties()
        self.port_b = PortProperties()
        set_default_write_read_bram_properties(self.type, self.port_a, self.port_b)
        self.output = BRAM_output()

    def compute_port_a_properties(self):
        # Set default properties because each bram type has its own behavior
        # this function clear off the non supported read and write rates value
        set_default_write_read_bram_properties(self.type, self.port_a, self.port_b)

        self.output.port_a.ram_depth = get_bram_capacity(self.type)
        self.output.port_a.clock_frequency = self.clock.frequency
        # signal rate = read enable rate * toggle rate * frequency
        self.output.port_a.output_signal_rate = \
            self.port_a.write_enable_rate * self.port_a.toggle_rate * self.output.port_a.clock_frequency
        return self.port_a_properties
    
    def compute_port_b_properties(self):
        # Set default properties because each bram type has its own behavior
        # this function clear off the non supported read and write rates value
        set_default_write_read_bram_properties(self.type, self.port_a, self.port_b)

        self.output.port_b.ram_depth = get_bram_capacity(self.type)
        self.output.port_b.clock_frequency = self.clock.frequency
        # signal rate = read enable rate * toggle rate * frequency
        self.output.port_b.output_signal_rate = \
            self.port_b.write_enable_rate * self.port_b.toggle_rate * self.output.port_b.clock_frequency
        return self.port_b_properties

    def compute_percentage(self, total_power):
        if total_power > 0:
            self.output.percentage = (self.output.block_power + self.output.interconnect_power) / total_power * 100
        else:
            self.output.percentage = 0
        
        return self.output.percentage

    def compute_dynamic_power(self, clock, WRITE_CAP, READ_CAP, INT_CAP, FIFO_CAP):
        if clock == None:
            self.output.message = f"Invalid clock {self.clock}"
            return
        
        if self.enable:
            self.compute_port_a_properties()
            self.compute_port_b_properties()
            # formula for BRAM Block power = A_Write + A_READ + B_Write + B_READ
            # formula for BRAM Interconnect power = A_INT + B_INT

            # same formula for port A and Port B
            # A_Write = width * write enable rate * toggle rate * clock frequency * BRAM_WRITE_CAP
            # A_READ = width * read enable rate * toggle rate * clock frequency * BRAM_READ_CAP
            # A_INT = width * read enable rate * toggle rate * clock frequency * BRAM_INT_CAP
            # FIFO = ((port_a write enable rate *  clock frequency) + (port_b write enable rate *  clock frequency)) * BRAM_FIFO_CAP
            a_write = self.port_a.width * self.port_a.write_enable_rate * self.port_a.toggle_rate * self.output.port_a.clock_frequency * WRITE_CAP
            a_read = self.port_a.width * self.port_a.read_enable_rate * self.port_a.toggle_rate * self.output.port_a.clock_frequency * READ_CAP
            a_int = self.port_a.width * self.port_a.read_enable_rate * self.port_a.toggle_rate * self.output.port_a.clock_frequency * INT_CAP

            b_write = self.port_b.width * self.port_b.write_enable_rate * self.port_b.toggle_rate * self.output.port_b.clock_frequency * WRITE_CAP
            b_read = self.port_b.width * self.port_b.read_enable_rate * self.port_b.toggle_rate * self.output.port_b.clock_frequency * READ_CAP
            b_int = self.port_b.width * self.port_b.read_enable_rate * self.port_b.toggle_rate * self.output.port_b.clock_frequency * INT_CAP
            
            fifo = (self.port_a.clock_frequency * self.port_a.write_enable_rate + 
                        self.port_b.clock_frequency * self.port_b.write_enable_rate) * FIFO_CAP

            
            if "ROM" in self.type.name:
                a_write = 0.0
                a_int = 0.0
                b_write = 0.0
                b_read = 0.0
                b_int = 0.0
                fifo = 0.0

            block_power = (a_write + a_read + b_write + b_read) * self.bram_used
            interconnect_power = (a_int + b_int) * self.bram_used

            if "FIFO" in self.type.name:
                block_power = block_power + fifo

            self.output.block_power = block_power
            self.output.interconnect_power = interconnect_power
            self.output.message = ''
            return block_power, interconnect_power
        else:
            self.output.port_a.output_signal_rate = 0
            self.output.port_a.clock_frequency = 0
            self.output.port_b.output_signal_rate = 0
            self.output.port_b.clock_frequency = 0     
            self.output.block_power = 0.0
            self.output.interconnect_power = 0.0
            self.output.percentage = 0.0
            self.output.message = f"BRAM is disabled"
            return 0, 0

class BRAM_SubModule:

    def __init__(self, resources, itemlist):
        self.resources = resources
        self.total_18k_bram_available = resources.get_num_18K_BRAM()
        self.total_36k_bram_available = resources.get_num_36K_BRAM()
        self.total_interconnect_power = 0.0
        self.total_block_power = 0.0
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
        return self.total_block_power, self.total_interconnect_power

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
        # Get power calculation coefficients
        BRAM_WRITE_CAP  = self.resources.get_BRAM_WRITE_CAP()
        BRAM_READ_CAP = self.resources.get_BRAM_READ_CAP()
        BRAM_INT_CAP      = self.resources.get_BRAM_INT_CAP()
        BRAM_FIFO_CAP   = self.resources.get_BRAM_FIFO_CAP()

        # Compute the total power consumption of all clocks
        self.total_block_power = 0.0
        self.total_interconnect_power = 0.0

        # Compute the power consumption for each individual items
        for item in self.itemlist:
            item.compute_dynamic_power(self.resources.get_clock(item.clock), BRAM_WRITE_CAP, BRAM_READ_CAP, BRAM_INT_CAP, BRAM_FIFO_CAP)
            self.total_interconnect_power += item.output.interconnect_power
            self.total_block_power += item.output.block_power

        # update individual clock percentage
        total_power = self.total_block_power + self.total_interconnect_power
        for item in self.itemlist:
            item.compute_percentage(total_power)
