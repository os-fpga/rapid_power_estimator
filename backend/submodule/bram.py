#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from dataclasses import dataclass, field
from enum import Enum
from .clock import Clock
from utilities.common_utils import update_attributes
from .rs_device_resources import BramNotFoundException
from .rs_message import RsMessage, RsMessageManager

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
    clock_frequency: int = field(default=0)
    output_signal_rate: float = field(default=0.0)
    ram_depth: int = field(default=1024)

@dataclass
class BRAM_output:
    port_a: PortOutputProperties = field(default_factory=PortOutputProperties)
    port_b: PortOutputProperties = field(default_factory=PortOutputProperties)
    block_power : float = field(default=0.0)
    interconnect_power : float = field(default=0.0)
    percentage : float = field(default=0.0)
    messages : [RsMessage] = field(default_factory=list)

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
    output : BRAM_output = field(default_factory=BRAM_output)

    def __post_init__(self):
        self.set_default_write_read_bram_properties()

    def set_default_write_read_bram_properties(self):
        if "SDP" in self.type.name or "FIFO" in self.type.name:
            self.port_a.read_enable_rate = 0
            self.port_b.write_enable_rate = 0
        elif "SP " in self.type.name:
            self.port_b.write_enable_rate = 0
            self.port_b.read_enable_rate = 0
            self.port_b.width = 0
            self.port_b.toggle_rate = 0
        elif "ROM " in self.type.name:
            self.port_a.write_enable_rate = 0
            self.port_b.write_enable_rate = 0
            self.port_b.read_enable_rate = 0
            self.port_b.width = 0
            self.port_b.toggle_rate = 0

    def get_bram_capacity(self):
        if self.type in (BRAM_Type.BRAM_18K_SDP, BRAM_Type.BRAM_18k_TDP, BRAM_Type.BRAM_18K_SP, \
            BRAM_Type.BRAM_18K_FIFO, BRAM_Type.BRAM_18K_ROM):
            return 1024
        else:
            return 2048

    def compute_port_a_properties(self):
        self.output.port_a.ram_depth = self.get_bram_capacity()
        # signal rate = read enable rate * toggle rate * frequency
        self.output.port_a.output_signal_rate = \
            self.port_a.write_enable_rate * self.port_a.toggle_rate * (self.output.port_a.clock_frequency/1000000.0)

    def compute_port_b_properties(self):
        self.output.port_b.ram_depth = self.get_bram_capacity()
        # signal rate = read enable rate * toggle rate * frequency
        self.output.port_b.output_signal_rate = \
            self.port_b.write_enable_rate * self.port_b.toggle_rate * (self.output.port_b.clock_frequency/1000000.0)

    def compute_percentage(self, total_power):
        if total_power > 0:
            self.output.percentage = (self.output.block_power + self.output.interconnect_power) / total_power * 100
        else:
            self.output.percentage = 0

    def compute_dynamic_power(self, clock_a, clock_b, WRITE_CAP, READ_CAP, INT_CAP, FIFO_CAP):
        self.output.port_a.output_signal_rate = 0.0
        self.output.port_a.clock_frequency = 0
        self.output.port_b.output_signal_rate = 0.0
        self.output.port_b.clock_frequency = 0
        self.output.block_power = 0.0
        self.output.interconnect_power = 0.0
        self.output.messages.clear()
        clock_error = False

        if clock_a is None:
            self.output.messages.append(RsMessageManager.get_message(302))
            clock_error = True
        else:
            # Set clock freq for Port A
            self.output.port_a.clock_frequency = clock_a.frequency

        if clock_b is None:
            if self.type not in (BRAM_Type.BRAM_18K_SP, BRAM_Type.BRAM_36K_SP):
                self.output.messages.append(RsMessageManager.get_message(303))
                clock_error = True
        else:
            # Set clock freq for Port B
            self.output.port_b.clock_frequency = clock_b.frequency

        if clock_error:
            return

        if self.enable == False:
            self.output.messages.append(RsMessageManager.get_message(104))
        else:
            # Set default properties because each bram type has its own behavior
            # this function clear off the non supported read and write rates value
            self.set_default_write_read_bram_properties()
            self.compute_port_a_properties()
            self.compute_port_b_properties()
            # formula for BRAM Block power = A_Write + A_READ + B_Write + B_READ
            # formula for BRAM Interconnect power = A_INT + B_INT

            # same formula for port A and Port B
            # A_Write = width * write enable rate * toggle rate * clock frequency * BRAM_WRITE_CAP
            # A_READ = width * read enable rate * toggle rate * clock frequency * BRAM_READ_CAP
            # A_INT = width * read enable rate * toggle rate * clock frequency * BRAM_INT_CAP
            # FIFO = ((port_a write enable rate *  clock frequency) + (port_b write enable rate *  clock frequency)) * BRAM_FIFO_CAP
            a_write = self.port_a.width * self.port_a.write_enable_rate * self.port_a.toggle_rate * (self.output.port_a.clock_frequency/1000000.0) * WRITE_CAP
            a_read = self.port_a.width * self.port_a.read_enable_rate * self.port_a.toggle_rate * (self.output.port_a.clock_frequency/1000000.0) * READ_CAP
            a_int = self.port_a.width * self.port_a.read_enable_rate * self.port_a.toggle_rate * (self.output.port_a.clock_frequency/1000000.0) * INT_CAP

            b_write = self.port_b.width * self.port_b.write_enable_rate * self.port_b.toggle_rate * (self.output.port_b.clock_frequency/1000000.0) * WRITE_CAP
            b_read = self.port_b.width * self.port_b.read_enable_rate * self.port_b.toggle_rate * (self.output.port_b.clock_frequency/1000000.0) * READ_CAP
            b_int = self.port_b.width * self.port_b.read_enable_rate * self.port_b.toggle_rate * (self.output.port_b.clock_frequency/1000000.0) * INT_CAP
            
            fifo = ((self.output.port_a.clock_frequency/1000000.0) * self.port_a.write_enable_rate + 
                        (self.output.port_b.clock_frequency/1000000.0) * self.port_b.write_enable_rate) * FIFO_CAP

            if "ROM" in self.type.name:
                a_write = 0.0
                a_int = 0.0
                b_write = 0.0
                b_read = 0.0
                b_int = 0.0
                fifo = 0.0

            if "SDP" in self.type.name or "FIFO" in self.type.name:
                interconnect_power = (a_int + b_int) * self.bram_used
            else:
                interconnect_power = 0

            block_power = (a_write + a_read + b_write + b_read) * self.bram_used

            if "FIFO" in self.type.name:
                block_power = block_power + fifo

            self.output.block_power = block_power
            self.output.interconnect_power = interconnect_power

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
        return self.total_block_power, self.total_interconnect_power

    def get_all_messages(self):
        return [message for item in self.itemlist for message in item.output.messages]

    def get_all(self):
        return self.itemlist

    def get(self, idx):
        if 0 <= idx < len(self.itemlist):
            return self.itemlist[idx]
        raise BramNotFoundException

    def add(self, data):
        item = update_attributes(BRAM(), data)
        self.itemlist.append(item)
        return item

    def update(self, idx, data):
        item = update_attributes(self.get(idx), data)
        return item

    def remove(self, idx):
        if 0 <= idx < len(self.itemlist):
            return self.itemlist.pop(idx)
        raise BramNotFoundException

    def compute_output_power(self):
        # Get power calculation coefficients
        BRAM_WRITE_CAP = self.resources.get_BRAM_WRITE_CAP()
        BRAM_READ_CAP  = self.resources.get_BRAM_READ_CAP()
        BRAM_INT_CAP   = self.resources.get_BRAM_INT_CAP()
        BRAM_FIFO_CAP  = self.resources.get_BRAM_FIFO_CAP()

        # Compute the total power consumption of all clocks
        self.total_block_power = 0.0
        self.total_interconnect_power = 0.0

        # Compute the power consumption for each individual items
        for item in self.itemlist:
            item.compute_dynamic_power(self.resources.get_clock(item.port_a.clock), self.resources.get_clock(item.port_b.clock), \
                BRAM_WRITE_CAP, BRAM_READ_CAP, BRAM_INT_CAP, BRAM_FIFO_CAP)
            self.total_interconnect_power += item.output.interconnect_power
            self.total_block_power += item.output.block_power

        # update individual clock percentage
        total_power = self.total_block_power + self.total_interconnect_power
        for item in self.itemlist:
            item.compute_percentage(total_power)
