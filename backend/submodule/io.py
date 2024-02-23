#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from dataclasses import dataclass, field
from enum import Enum
# from clock import Clock
from utilities.common_utils import update_attributes
from typing import List

class IO_Direction(Enum):
    INPUT = 0
    OUTPUT = 1
    OPEN_DRAIN = 2
    BI_DIRECTIOM = 3

class IO_Drive_Strength(Enum):
    two = 2
    four = 4
    six = 6
    eight = 8
    ten = 12
    sixteen = 16

class IO_Slew_Rate(Enum):
    fast = 0
    slow = 1

class IO_differential_termination(Enum):
    OFF = 0
    ON = 1

class IO_Data_Type(Enum):
    SDR = 0
    DDR = 1
    Clock = 2
    Async = 3

class IO_STANDARD(Enum):
    LVCMOS_1_2V = 0
    LVCMOS_1_5V = 1
    LVCMOS_1_8V_HP = 2
    LVCMOS_1_8V_HR = 3
    LVCMOS_2_5V = 4
    LVCMOS_3_3V = 5
    LVTTL = 6
    BLVDS_Diff = 7
    LVDS_Diff_HP = 8
    LVDS_Diff_HR = 9
    LVPECL_2_5V_Diff = 10
    LVPECL_3_3V_Diff = 11
    HSTL_1_2V_Class_I_with_ODT = 12
    HSTL_1_2V_Class_I_without_ODT = 13
    HSTL_1_2V_Class_II_with_ODT = 14
    HSTL_1_2V_Class_II_without_ODT = 15
    HSTL_1_2V_Diff = 16
    HSTL_1_5V_Class_I_with_ODT = 17
    HSTL_1_5V_Class_I_without_ODT = 18
    HSTL_1_5V_Class_II_with_ODT = 19
    HSTL_1_5V_Class_II_without_ODT = 20
    HSTL_1_5V_Diff = 21
    HSUL_1_2V = 22
    HSUL_1_2V_Diff = 23
    MIPI_Diff = 24
    PCI66 = 25
    PCIX133 = 26
    POD_1_2V = 27
    POD_1_2V_Diff = 28
    RSDS_Diff = 29
    SLVS_Diff = 30
    SSTL_1_5V_Class_I = 31
    SSTL_1_5V_Class_II = 32
    SSTL_1_5V_Diff = 33
    SSTL_1_8V_Class_I_HP = 34
    SSTL_1_8V_Class_II_HP = 35
    SSTL_1_8V_Diff_HP = 36
    SSTL_1_8V_Class_I_HR = 37
    SSTL_1_8V_Class_II_HR = 38
    SSTL_2_5V_Class_I = 39
    SSTL_2_5V_Class_II = 40
    SSTL_3_3V_Class_I = 41
    SSTL_3_3V_Class_II = 42

class IO_Synchronization(Enum):
    NONE = 0
    DDR_Register = 1
    SERDES_1_to_3 = 2
    SERDES_1_to_4 = 3
    SERDES_1_to_5 = 4
    SERDES_1_to_6 = 5
    SERDES_1_to_7 = 6
    SERDES_1_to_8 = 7
    SERDES_1_to_9 = 8
    SERDES_1_to_10 = 9

class IO_Pull_up_down(Enum):
    NONE = 0
    PULL_UP = 1
    PULL_DOWN = 2

class IO_Bank_Type(Enum):
    HP = 0
    HR = 1

@dataclass
class IO_output:

    bank_type : IO_Bank_Type = field(default=IO_Bank_Type.HP)
    bank_number : int = field(default=0)
    vccio_voltage : float = field(default=1.8)
    io_signal_rate : float = field(default=0.0)
    block_power : float = field(default=0.0)
    interconnect_power : float = field(default=0.0)
    percentage : float = field(default=100.0)
    message : str = field(default='')

    def __init__(
        self,
        bank_type: IO_Bank_Type = IO_Bank_Type.HP,
        bank_number: int = 0,
        vccio_voltage: float = 1.8,
        io_signal_rate: float = 0.0,
        block_power: float = 0.0,
        interconnect_power: float = 0.0,
        percentage: float = 100.0,
        message: str = '',
    ):
        self.bank_type = bank_type
        self.bank_number = bank_number
        self.vccio_voltage = vccio_voltage
        self.io_signal_rate = io_signal_rate
        self.block_power = block_power
        self.interconnect_power = interconnect_power
        self.percentage = percentage
        self.message = message

@dataclass
class IO:
    enable : bool = field(default=False)
    name : str = field(default='')
    bus_width : int = field(default=1)
    direction : IO_Direction = field(default=IO_Direction.INPUT)
    clock : str = field(default='')
    io_standard : IO_STANDARD = field(default=IO_STANDARD.LVCMOS_1_8V_HR)
    drive_strength : IO_Drive_Strength = field(default=IO_Drive_Strength.six)
    slew_rate : IO_Slew_Rate = field(default=IO_Slew_Rate.slow)
    diffrential_termination : IO_differential_termination = field(default=IO_differential_termination.OFF)
    io_data_type : IO_Data_Type = field(default=IO_Data_Type.Clock)
    toggle_rate : float = field(default=0.125)
    duty_cycle : float = field(default=0.5)
    synchronization : IO_Synchronization = field(default=IO_Synchronization.DDR_Register)
    input_enable_rate : float = field(default=1.0)
    output_enable_rate : float = field(default=0.0)
    io_pull_up_down : IO_Pull_up_down = field(default=IO_Pull_up_down.NONE)
    output : IO_output = field(default_factory=IO_output())

    def __init__(self, enable: bool = False, name: str = '', bus_width: int = 1, direction: IO_Direction = IO_Direction.INPUT,
                 clock: str = '', io_standard: IO_STANDARD = IO_STANDARD.LVCMOS_1_8V_HR,
                 drive_strength: IO_Drive_Strength = IO_Drive_Strength.six, slew_rate: IO_Slew_Rate = IO_Slew_Rate.slow,
                 differential_termination: IO_differential_termination = IO_differential_termination.OFF,
                 io_data_type: IO_Data_Type = IO_Data_Type.Clock, toggle_rate: float = 0.125, duty_cycle: float = 0.5,
                 synchronization: IO_Synchronization = IO_Synchronization.DDR_Register, input_enable_rate: float = 1.0,
                 output_enable_rate: float = 0.0, io_pull_up_down: IO_Pull_up_down = IO_Pull_up_down.NONE):
        self.enable = enable
        self.name = name
        self.bus_width = bus_width
        self.direction = direction
        self.clock = clock
        self.io_standard = io_standard
        self.drive_strength = drive_strength
        self.slew_rate = slew_rate
        self.differential_termination = differential_termination
        self.io_data_type = io_data_type
        self.toggle_rate = toggle_rate
        self.duty_cycle = duty_cycle
        self.synchronization = synchronization
        self.input_enable_rate = input_enable_rate
        self.output_enable_rate = output_enable_rate
        self.io_pull_up_down = io_pull_up_down
        self.output = IO_output()

    def compute_dynamic_power(self):
        if self.enable:
            # todo
            pass
        else:
            return 0

@dataclass
class IO_Usage_Allocation:
    voltage : float = field(default=0.0)
    banks_used : int = field(default=0)
    io_used : int = field(default=0)
    io_available : int = field(default=0)

@dataclass
class IO_Usage:
    type : str = field(default='')
    total_banks_available : int = field(default=0)
    total_io_available : int = field(default=0)
    usage : List[IO_Usage_Allocation] = field(default_factory=list)

@dataclass
class IO_On_Die_Termination:
    bank_number : int = field(default=0)
    odt : bool = field(default=False)
    power : float = field(default=0.0)

class IO_SubModule:

    def __init__(self, resources, itemlist):
        self.resources = resources
        self.total_block_power = 0.0
        self.total_interconnect_power = 0.0
        self.total_on_die_termination_power = 0.0
        self.io_usage = [
            IO_Usage(type="HP", usage=[IO_Usage_Allocation(voltage=1.2), IO_Usage_Allocation(voltage=1.5), IO_Usage_Allocation(voltage=1.8)]),
            IO_Usage(type="HR", usage=[IO_Usage_Allocation(voltage=1.8), IO_Usage_Allocation(voltage=2.5), IO_Usage_Allocation(voltage=3.3)])
        ]
        self.io_on_die_termination = [
            IO_On_Die_Termination(bank_number=1),
            IO_On_Die_Termination(bank_number=2),
            IO_On_Die_Termination(bank_number=3)
        ]
        self.itemlist = itemlist

    def get_resources(self):
        return self.io_usage, self.io_on_die_termination

    def get_power_consumption(self):
        return self.total_block_power, self.total_interconnect_power, self.total_on_die_termination_power

    def get_all(self):
        return self.itemlist

    def get(self, idx):
        if 0 <= idx < len(self.itemlist):
            return self.itemlist[idx]
        else:
            raise ValueError("Invalid index. Item doesn't exist at the specified index.")

    def add(self, data):
        item = update_attributes(IO(), data)
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
            raise ValueError("Invalid index. Item doesn't exist at the specified index.")

    def compute_output_power(self):
        pass
