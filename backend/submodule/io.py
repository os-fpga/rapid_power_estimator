#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import sys
from dataclasses import dataclass, field
from enum import Enum
from utilities.common_utils import update_attributes
from typing import List
from .rs_device_resources import IONotFoundException
from .rs_message import RsMessage, RsMessageManager

class IO_Direction(Enum):
    INPUT = 0
    OUTPUT = 1
    OPEN_DRAIN = 2
    BI_DIRECTION = 3

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

class IO_Standard(Enum):
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
    Register = 1
    DDR_Register = 2
    SERDES_1_to_3 = 3
    SERDES_1_to_4 = 4
    SERDES_1_to_5 = 5
    SERDES_1_to_6 = 6
    SERDES_1_to_7 = 7
    SERDES_1_to_8 = 8
    SERDES_1_to_9 = 9
    SERDES_1_to_10 = 10

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
    frequency: int = field(default=0)
    vccio_voltage : float = field(default=1.8)
    io_signal_rate : float = field(default=0.0)
    block_power : float = field(default=0.0)
    interconnect_power : float = field(default=0.0)
    percentage : float = field(default=0.0)
    messages : [RsMessage] = field(default_factory=list)

@dataclass
class IO_Standard_Spec:
    bank_type: IO_Bank_Type = field(default=IO_Bank_Type.HP)
    voltage: float = field(default=1.2)
    input_ac: float = field(default=0.0)
    output_ac: float = field(default=0.0)
    input_dc: float = field(default=0.0)
    output_dc: float = field(default=0.0)
    int_inner: float = field(default=0.0)
    int_outer: float = field(default=0.0)

io_standard_lkup_table = {
    IO_Standard.LVCMOS_1_2V: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.2, input_ac=0.0000002, output_ac=0.000025, input_dc=0.00001, output_dc=0.0003, int_inner=0.00000001, int_outer=0.0000004),
    IO_Standard.LVCMOS_1_5V: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.5, input_ac=0.0000002, output_ac=0.000025, input_dc=0.00001, output_dc=0.0003, int_inner=0.00000001, int_outer=0.0000006),
    IO_Standard.LVCMOS_1_8V_HP: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.8, input_ac=0.0000002, output_ac=0.000025, input_dc=0.00001, output_dc=0.0003, int_inner=0.00000001, int_outer=0.0000008),
    IO_Standard.LVCMOS_1_8V_HR: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=1.8, input_ac=0.0000003, output_ac=0.000025, input_dc=0.00001, output_dc=0.00001, int_inner=0.00000001, int_outer=0.00000005),
    IO_Standard.LVCMOS_2_5V: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=2.5, input_ac=0.0000012, output_ac=0.000025, input_dc=0.00001, output_dc=0.00001, int_inner=0.00000001, int_outer=0.00000275),
    IO_Standard.LVCMOS_3_3V: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=3.3, input_ac=0.0000012, output_ac=0.000025, input_dc=0.00001, output_dc=0.00001, int_inner=0.00000001, int_outer=0.00000275),
    IO_Standard.LVTTL: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=1.8, input_ac=0.0000012, output_ac=0.00003, input_dc=0.00001, output_dc=0.00001, int_inner=0.00000001, int_outer=0.000002),
    IO_Standard.BLVDS_Diff: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=1.8, input_ac=0.0000012, output_ac=0.000001, input_dc=0.001, output_dc=0.00002, int_inner=0.00000001, int_outer=0.00000004),
    IO_Standard.LVDS_Diff_HP: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.8, input_ac=0.000001, output_ac=0.000005, input_dc=0.002, output_dc=0.0011, int_inner=0.00000001, int_outer=0.00000005),
    IO_Standard.LVDS_Diff_HR: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=1.8, input_ac=0.000001, output_ac=0.000005, input_dc=0.002, output_dc=0.0011, int_inner=0.00000001, int_outer=0.00000005),
    IO_Standard.LVPECL_2_5V_Diff: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=2.5, input_ac=0.0000007, output_ac=0.000000001, input_dc=0.00105, output_dc=0.00001, int_inner=0.00000001, int_outer=0.00000004),
    IO_Standard.LVPECL_3_3V_Diff: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=3.3, input_ac=0.0000007, output_ac=0.000000001, input_dc=0.00105, output_dc=0.00001, int_inner=0.00000001, int_outer=0.00000004),
    IO_Standard.HSTL_1_2V_Class_I_with_ODT: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.2, input_ac=0.000002, output_ac=0.00005, input_dc=0.0102, output_dc=0.0025, int_inner=0.00000001, int_outer=0.0000004),
    IO_Standard.HSTL_1_2V_Class_I_without_ODT: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.2, input_ac=0.000002, output_ac=0.00005, input_dc=0.003, output_dc=0.0025, int_inner=0.00000001, int_outer=0.0000004),
    IO_Standard.HSTL_1_2V_Class_II_with_ODT: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.2, input_ac=0.000002, output_ac=0.00005, input_dc=0.0102, output_dc=0.0025, int_inner=0.00000001, int_outer=0.0000004),
    IO_Standard.HSTL_1_2V_Class_II_without_ODT: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.2, input_ac=0.000002, output_ac=0.00005, input_dc=0.003, output_dc=0.0025, int_inner=0.00000001, int_outer=0.0000004),
    IO_Standard.HSTL_1_2V_Diff: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.2, input_ac=0.000004, output_ac=0.0001, input_dc=0.006, output_dc=0.005, int_inner=0.00000002, int_outer=0.0000008),
    IO_Standard.HSTL_1_5V_Class_I_with_ODT: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.5, input_ac=0.000002, output_ac=0.00005, input_dc=0.01425, output_dc=0.0025, int_inner=0.00000001, int_outer=0.00000005),
    IO_Standard.HSTL_1_5V_Class_I_without_ODT: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.5, input_ac=0.000002, output_ac=0.00005, input_dc=0.003, output_dc=0.0025, int_inner=0.00000001, int_outer=0.00000005),
    IO_Standard.HSTL_1_5V_Class_II_with_ODT: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.5, input_ac=0.000002, output_ac=0.00005, input_dc=0.01425, output_dc=0.0025, int_inner=0.00000001, int_outer=0.00000005),
    IO_Standard.HSTL_1_5V_Class_II_without_ODT: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.5, input_ac=0.000002, output_ac=0.00005, input_dc=0.003, output_dc=0.0025, int_inner=0.00000001, int_outer=0.00000005),
    IO_Standard.HSTL_1_5V_Diff: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.5, input_ac=0.000004, output_ac=0.0001, input_dc=0.006, output_dc=0.005, int_inner=0.00000002, int_outer=0.0000001),
    IO_Standard.HSUL_1_2V: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.2, input_ac=0.000002, output_ac=0.000005, input_dc=0.003, output_dc=0.00025, int_inner=0.00000001, int_outer=0.000004),
    IO_Standard.HSUL_1_2V_Diff: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.2, input_ac=0.000001, output_ac=0.000009, input_dc=0.003, output_dc=0.0005, int_inner=0.00000001, int_outer=0.000004),
    IO_Standard.MIPI_Diff: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.2, input_ac=0.000001, output_ac=0.000007, input_dc=0.003, output_dc=0.006, int_inner=0.00000001, int_outer=0.000004),
    IO_Standard.PCI66: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=3.3, input_ac=0.0000013, output_ac=0.000075, input_dc=0.00001, output_dc=0.00001, int_inner=0.00000001, int_outer=0.000004),
    IO_Standard.PCIX133: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=2.5, input_ac=0.0000013, output_ac=0.00008, input_dc=0.00001, output_dc=0.00001, int_inner=0.00000001, int_outer=0.000004),
    IO_Standard.POD_1_2V: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.2, input_ac=0.0000005, output_ac=0.000007, input_dc=0.003, output_dc=0.006, int_inner=0.00000001, int_outer=0.000004),
    IO_Standard.POD_1_2V_Diff: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.2, input_ac=0.0000007, output_ac=0.00000007, input_dc=0.003, output_dc=0.006, int_inner=0.00000001, int_outer=0.000004),
    IO_Standard.RSDS_Diff: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=2.5, input_ac=0.0000007, output_ac=0.00000007, input_dc=0.002, output_dc=0.03, int_inner=0.00000001, int_outer=0.000004),
    IO_Standard.SLVS_Diff: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.2, input_ac=0.000001, output_ac=0.000005, input_dc=0.0023, output_dc=0.006, int_inner=0.00000001, int_outer=0.00000005),
    IO_Standard.SSTL_1_5V_Class_I: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.5, input_ac=0.000004, output_ac=0.00004, input_dc=0.002, output_dc=0.002, int_inner=0.00000001, int_outer=0.00000005),
    IO_Standard.SSTL_1_5V_Class_II: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.5, input_ac=0.000004, output_ac=0.00004, input_dc=0.002, output_dc=0.002, int_inner=0.00000001, int_outer=0.00000005),
    IO_Standard.SSTL_1_5V_Diff: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.5, input_ac=0.000004, output_ac=0.00004, input_dc=0.002, output_dc=0.002, int_inner=0.00000001, int_outer=0.00000005),
    IO_Standard.SSTL_1_8V_Class_I_HP: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.8, input_ac=0.000002, output_ac=0.00005, input_dc=0.003, output_dc=0.0025, int_inner=0.00000001, int_outer=0.00000005),
    IO_Standard.SSTL_1_8V_Class_II_HP: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.8, input_ac=0.000002, output_ac=0.00005, input_dc=0.003, output_dc=0.0025, int_inner=0.00000001, int_outer=0.00000005),
    IO_Standard.SSTL_1_8V_Diff_HP: IO_Standard_Spec(bank_type=IO_Bank_Type.HP, voltage=1.8, input_ac=0.000002, output_ac=0.00005, input_dc=0.003, output_dc=0.0025, int_inner=0.00000001, int_outer=0.00000005),
    IO_Standard.SSTL_1_8V_Class_I_HR: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=1.8, input_ac=0.000002, output_ac=0.00005, input_dc=0.003, output_dc=0.0025, int_inner=0.00000001, int_outer=0.00000005),
    IO_Standard.SSTL_1_8V_Class_II_HR: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=1.8, input_ac=0.000002, output_ac=0.00005, input_dc=0.003, output_dc=0.0025, int_inner=0.00000001, int_outer=0.00000005),
    IO_Standard.SSTL_2_5V_Class_I: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=2.5, input_ac=0.000003, output_ac=0.00006, input_dc=0.003, output_dc=0.003, int_inner=0.000000015, int_outer=0.000000075),
    IO_Standard.SSTL_2_5V_Class_II: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=2.5, input_ac=0.000003, output_ac=0.00006, input_dc=0.003, output_dc=0.003, int_inner=0.000000015, int_outer=0.000000075),
    IO_Standard.SSTL_3_3V_Class_I: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=3.3, input_ac=0.000004, output_ac=0.00006, input_dc=0.003, output_dc=0.0035, int_inner=0.00000002, int_outer=0.0000001),
    IO_Standard.SSTL_3_3V_Class_II: IO_Standard_Spec(bank_type=IO_Bank_Type.HR, voltage=3.3, input_ac=0.000004, output_ac=0.00006, input_dc=0.003, output_dc=0.0035, int_inner=0.00000002, int_outer=0.0000001),
}

@dataclass
class IO:
    enable : bool = field(default=False)
    name : str = field(default='')
    bus_width : int = field(default=1)
    direction : IO_Direction = field(default=IO_Direction.INPUT)
    clock : str = field(default='')
    io_standard : IO_Standard = field(default=IO_Standard.LVCMOS_1_8V_HR)
    drive_strength : IO_Drive_Strength = field(default=IO_Drive_Strength.six)
    slew_rate : IO_Slew_Rate = field(default=IO_Slew_Rate.slow)
    differential_termination : IO_differential_termination = field(default=IO_differential_termination.OFF)
    io_data_type : IO_Data_Type = field(default=IO_Data_Type.Clock)
    toggle_rate : float = field(default=0.125)
    duty_cycle : float = field(default=0.5)
    synchronization : IO_Synchronization = field(default=IO_Synchronization.DDR_Register)
    input_enable_rate : float = field(default=1.0)
    output_enable_rate : float = field(default=0.0)
    io_pull_up_down : IO_Pull_up_down = field(default=IO_Pull_up_down.NONE)
    output : IO_output = field(default_factory=IO_output)

    def get_voltage(self) -> float:
        return io_standard_lkup_table[self.io_standard].voltage

    def get_bank_type(self) -> IO_Bank_Type:
        return io_standard_lkup_table[self.io_standard].bank_type

    def get_input_ac_coeff(self) -> float:
        return io_standard_lkup_table[self.io_standard].input_ac

    def get_input_dc_coeff(self) -> float:
        return io_standard_lkup_table[self.io_standard].input_dc

    def get_output_ac_coeff(self) -> float:
        return io_standard_lkup_table[self.io_standard].output_ac

    def get_output_dc_coeff(self) -> float:
        return io_standard_lkup_table[self.io_standard].output_dc

    def get_interconnect_inner_coeff(self) -> float:
        return io_standard_lkup_table[self.io_standard].int_inner

    def get_interconnect_outer_coeff(self) -> float:
        return io_standard_lkup_table[self.io_standard].int_outer

    def get_io_sync_value(self) -> int:
        return self.synchronization.value

    def compute_percentage(self, total_power):
        if total_power > 0:
            self.output.percentage = (self.output.block_power + self.output.interconnect_power) / total_power * 100.0
        else:
            self.output.percentage = 0.0

    def is_SERDES(self) -> bool:
        # todo
        return False

    def compute_frequency(self, clock) -> float:
        if self.is_SERDES():
            m1 = 0.5
        else:
            m1 = 1
        if self.io_data_type == IO_Data_Type.DDR:
            m2 = 0.5
        else:
            m2 = 1
        return clock.frequency * m1 * m2

    def compute_signal_rate(self, frequency : float) -> float:
        if self.io_data_type == IO_Data_Type.Clock:
            return frequency * 2
        elif self.io_data_type == IO_Data_Type.DDR:
            return frequency * 2 * self.toggle_rate
        else:
            return frequency * self.toggle_rate

    def get_bank_number(self) -> int:
        # todo: need pinout module
        return 1

    def get_diff_or_single_ended(self, iostd : IO_Standard) -> int:
        if 'diff' in iostd.name.lower():
            return 2
        return 1

    def compute_input_io_count(self) -> int:
        if self.direction != IO_Direction.INPUT:
            return 0
        return self.bus_width * self.get_diff_or_single_ended(self.io_standard)

    def compute_output_io_count(self) -> int:
        if self.direction != IO_Direction.OUTPUT and self.direction != IO_Direction.OPEN_DRAIN:
            return 0
        return self.bus_width * self.get_diff_or_single_ended(self.io_standard)

    def compute_bidir_io_count(self) -> int:
        if self.direction != IO_Direction.BI_DIRECTION:
            return 0
        return self.bus_width * self.get_diff_or_single_ended(self.io_standard)

    def compute_io_count(self) -> int:
        return self.compute_input_io_count() + self.compute_output_io_count() + self.compute_bidir_io_count()

    def compute_input_ac(self) -> float:
        if self.direction == IO_Direction.OPEN_DRAIN or self.direction == IO_Direction.OUTPUT:
            return 0
        value = self.get_input_ac_coeff()
        value = value + (0 if self.synchronization == IO_Synchronization.NONE else 0.000001)
        value = value * self.input_enable_rate * self.compute_io_count()
        value = value * self.output.io_signal_rate
        return value

    def compute_output_ac(self) -> float:
        if self.direction == IO_Direction.INPUT:
            return 0
        value = self.get_output_ac_coeff()
        value = value + (0 if self.synchronization == IO_Synchronization.NONE else 0.000001)
        value = value * self.output_enable_rate * self.compute_io_count()
        value = value * self.output.io_signal_rate
        return value

    def compute_input_dc(self) -> float:
        if self.direction == IO_Direction.OPEN_DRAIN or self.direction == IO_Direction.OUTPUT:
            return 0
        value = self.get_input_dc_coeff()
        value = value * self.compute_io_count() * (1 if self.direction == IO_Direction.INPUT \
            else 1 - self.output_enable_rate)
        return value

    def compute_output_dc(self) -> float:
        if self.direction == IO_Direction.INPUT:
            return 0
        value = self.get_output_dc_coeff()
        value = value * self.output_enable_rate * self.compute_io_count()
        return value

    def compute_vcco_power(self) -> float:
        return self.compute_output_ac() + self.compute_output_dc() + self.compute_input_ac() + self.compute_input_dc()

    def compute_block_power(self) -> float:
        # VCCO Power
        vcco_power = self.compute_vcco_power()
        print("vcco_power", vcco_power, file=sys.stderr)
        # VCCAUX_IO Power
        #  =IF(R14=$F$9,AX14*0.1,0)
        #  AX14 = VCCO Power
        #  R14 = Bank Type (Output)
        #  $F$9 = 'HR'
        vccaux_io_power = vcco_power * 0.1 if self.output.bank_type == IO_Bank_Type.HR else 0
        print("vccaux_io_power", vccaux_io_power, file=sys.stderr)
        # VCCINT Power
        #  =IF(BA14=0,0,0.0000004*AS14*BA14)
        #  BA14 = Synchronization value
        #  AS14 = Clock Freq
        vccint_power = 0.0000004 * self.get_io_sync_value() * (self.output.frequency / 1000000.0)
        print("vccint_power", vccint_power, file=sys.stderr)
        print("self.get_io_sync_value()", self.get_io_sync_value(), file=sys.stderr)
        # =IF(OR(AJ14,B14="Disabled",K14=""),0,SUM(AX14:AZ14)+IF(AND(AL14,I14="On"),0.35^2/100,0))
        # AJ14 = Error
        # B14  = enable
        # K14  = Clock
        # SUM(AX14:AZ14) = vcco_power + vccaux_io_power + vccint_power
        # AL14 = I/O No Diff (bus width input)
        # I14  = Differential Termination (On/Off)
        block_power = vcco_power + vccaux_io_power + vccint_power
        if self.differential_termination == IO_differential_termination.ON and self.bus_width > 0:
            block_power += (0.35 ** 2) / 100.0
        return block_power

    def compute_interconnect_power(self) -> float:
        # E14  = Direction
        # F14  = I/O Standard
        # AO13 = 'Input'
        # AP13 = 'Output
        # AP12 = 'Open-Drain'
        # BC15:BC57 = IO Standard lookup table
        # BF15:BF57 = Input AC coeff
        # BG15:BG57 = Output AC coeff
        # BH15:BH57 = Input DC coeff
        # BI15:BI57 = Output DC coeff
        # O14  = Input Enable (rate)
        # P14  = Output Enable (rate)
        # N14  = Synchronization
        # U14  = Signal-Rate
        # J14  = Data Type
        # AR14 = I/O Count (Diff)
        # AH14 = Signal-Rate
        # B14  = enable
        # for input or bi-direction
        if self.direction == IO_Direction.OUTPUT or self.direction == IO_Direction.OPEN_DRAIN:
            input_value = 0
        else:
            input_value = self.get_interconnect_inner_coeff() * self.output.io_signal_rate * self.input_enable_rate

        # for output, open-drain or bi-direction
        if self.direction == IO_Direction.INPUT:
            output_value = 0
        else:
            output_value = self.get_interconnect_outer_coeff() * self.output.io_signal_rate * self.output_enable_rate

        value = (output_value + input_value) * self.compute_io_count()
        return value

    def compute_dynamic_power(self, clock):
        self.output.bank_type = IO_Bank_Type.HP
        self.output.bank_number = 0
        self.output.vccio_voltage = 0
        self.output.io_signal_rate = 0.0
        self.output.block_power = 0.0
        self.output.interconnect_power = 0.0
        self.output.messages.clear()

        if clock is None:
            self.output.messages.append(RsMessageManager.get_message(301))
            return

        if self.enable == False:
            self.output.messages.append(RsMessageManager.get_message(105))
            return

        # io power calculation
        self.output.frequency = self.compute_frequency(clock)
        self.output.io_signal_rate = self.compute_signal_rate(self.output.frequency / 1000000.0)
        self.output.bank_number = self.get_bank_number()
        self.output.bank_type = self.get_bank_type()
        self.output.vccio_voltage = self.get_voltage()
        self.output.block_power = self.compute_block_power()
        self.output.interconnect_power = self.compute_interconnect_power()

        # debug
        print("compute_bidir_io_count()", self.compute_bidir_io_count(), file=sys.stderr)
        print("compute_input_io_count()", self.compute_input_io_count(), file=sys.stderr)
        print("compute_output_io_count()", self.compute_output_io_count(), file=sys.stderr)
        print("compute_io_count()", self.compute_io_count(), file=sys.stderr)
        print("block_power", self.output.block_power, file=sys.stderr)
        print("interconnect_power", self.output.interconnect_power, file=sys.stderr)
        print("frequency", self.output.frequency, file=sys.stderr)

@dataclass
class IO_Usage_Allocation:
    voltage : float = field(default=0.0)
    banks_used : int = field(default=0)
    io_used : int = field(default=0)
    io_available : int = field(default=0)

@dataclass
class IO_Usage:
    type : IO_Bank_Type = field(default=IO_Bank_Type.HP)
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
            IO_Usage(type=IO_Bank_Type.HP, usage=[IO_Usage_Allocation(voltage=1.2, banks_used=1), IO_Usage_Allocation(voltage=1.5, banks_used=1), IO_Usage_Allocation(voltage=1.8, banks_used=1)]),
            IO_Usage(type=IO_Bank_Type.HR, usage=[IO_Usage_Allocation(voltage=1.8, banks_used=1), IO_Usage_Allocation(voltage=2.5, banks_used=1), IO_Usage_Allocation(voltage=3.3, banks_used=1)])
        ]
        self.io_on_die_termination = [
            IO_On_Die_Termination(bank_number=1),
            IO_On_Die_Termination(bank_number=2),
            IO_On_Die_Termination(bank_number=3)
        ]
        self.itemlist = itemlist

    def get_resources(self):
        return self.io_usage, self.io_on_die_termination

    def get_total_output_power(self) -> float:
        return sum(self.get_power_consumption())

    def get_power_consumption(self):
        return self.total_block_power, self.total_interconnect_power, self.total_on_die_termination_power

    def get_all_messages(self):
        return [message for item in self.itemlist for message in item.output.messages]

    def get_all(self):
        return self.itemlist

    def get(self, idx):
        if 0 <= idx < len(self.itemlist):
            return self.itemlist[idx]
        raise IONotFoundException

    def add(self, data):
        item = update_attributes(IO(), data)
        self.itemlist.append(item)
        return item

    def update(self, idx, data):
        item = update_attributes(self.get(idx), data)
        return item

    def remove(self, idx):
        if 0 <= idx < len(self.itemlist):
            return self.itemlist.pop(idx)
        raise IONotFoundException

    def compute_output_power(self):
        # todo: Get power calculation coefficients

        # Compute the total power consumption of all clocks
        self.total_block_power = 0.0
        self.total_interconnect_power = 0.0

        # Compute the power consumption for each individual items
        for item in self.itemlist:
            item.compute_dynamic_power(self.resources.get_clock(item.clock))
            self.total_interconnect_power += item.output.interconnect_power
            self.total_block_power += item.output.block_power

        # update individual clock percentage
        total_power = self.total_block_power + self.total_interconnect_power
        for item in self.itemlist:
            item.compute_percentage(total_power)
