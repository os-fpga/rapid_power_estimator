#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from abc import ABC, abstractmethod
from enum import Enum
import math
from dataclasses import dataclass, field
from typing import Any, Dict, List
from utilities.common_utils import RsEnum, update_attributes
from .rs_device_resources import IO_Standard_Coeff, IOStandardCoeffNotFoundException, \
    IONotFoundException, IO_BankType, IO_Standard, RsDeviceResources
from .rs_message import RsMessage, RsMessageManager

class IO_Direction(RsEnum):
    INPUT = 0, "Input"
    OUTPUT = 1, "Output"
    OPEN_DRAIN = 2, "Open-Drain"
    BI_DIRECTION = 3, "Bi-dir"

class IO_Drive_Strength(RsEnum):
    two = 2, "2 mA"
    four = 4, "4 mA"
    six = 6, "6 mA"
    eight = 8, "8 mA"
    ten = 12, "12 mA"
    sixteen = 16, "16 mA"

class IO_Slew_Rate(RsEnum):
    fast = 0, "Fast"
    slow = 1, "Slow"

class IO_differential_termination(RsEnum):
    OFF = 0, "Off"
    ON = 1, "On"

class IO_Data_Type(RsEnum):
    SDR = 0, "SDR"
    DDR = 1, "DDR"
    Clock = 2, "Clock"
    Async = 3, "Async"

class IO_Synchronization(RsEnum):
    NONE = 0, "None"
    Register = 1, "Register"
    DDR_Register = 2, "DDR Register"
    SERDES_1_to_3 = 3, "1 to 3 SERDES"
    SERDES_1_to_4 = 4, "1 to 4 SERDES"
    SERDES_1_to_5 = 5, "1 to 5 SERDES"
    SERDES_1_to_6 = 6, "1 to 6 SERDES"
    SERDES_1_to_7 = 7, "1 to 7 SERDES"
    SERDES_1_to_8 = 8, "1 to 8 SERDES"
    SERDES_1_to_9 = 9, "1 to 9 SERDES"
    SERDES_1_to_10 = 10, "1 to 10 SERDES"

class IO_Pull_up_down(RsEnum):
    NONE = 0, "None"
    PULL_UP = 1, "Pullup"
    PULL_DOWN = 2, "Pulldown"

class IO_FeatureType(Enum):
    NONE = 'none'
    ODT = 'odt'

class IO_OdtType(RsEnum):
    OFF = 0, "Off"
    ON = 1, "On"
    CASCADE = 2, "Cascade"

@dataclass
class IO_output:
    bank_type : IO_BankType = field(default=IO_BankType.HP)
    bank_number : int = field(default=0)
    frequency : int = field(default=0)
    vccio_voltage : float = field(default=1.8)
    io_signal_rate : float = field(default=0.0)
    block_power : float = field(default=0.0)
    interconnect_power : float = field(default=0.0)
    percentage : float = field(default=0.0)
    messages : List[RsMessage] = field(default_factory=list)

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
        return self.output.io_coeff.voltage

    def get_bank_type(self) -> IO_BankType:
        return self.output.io_coeff.bank_type

    def get_input_ac_coeff(self) -> float:
        return self.output.io_coeff.input_ac

    def get_input_dc_coeff(self) -> float:
        return self.output.io_coeff.input_dc

    def get_output_ac_coeff(self) -> float:
        return self.output.io_coeff.output_ac

    def get_output_dc_coeff(self) -> float:
        return self.output.io_coeff.output_dc

    def get_interconnect_inner_coeff(self) -> float:
        return self.output.io_coeff.int_inner

    def get_interconnect_outer_coeff(self) -> float:
        return self.output.io_coeff.int_outer

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
        vccaux_io_power = vcco_power * 0.1 if self.output.bank_type == IO_BankType.HR else 0
        vccint_power = 0.0000004 * self.get_io_sync_value() * (self.output.frequency / 1000000.0)
        block_power = vcco_power + vccaux_io_power + vccint_power
        if self.differential_termination == IO_differential_termination.ON and self.bus_width > 0:
            block_power += (0.35 ** 2) / 100.0
        return block_power

    def compute_interconnect_power(self) -> float:
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

    def compute_dynamic_power(self, clock, IO_STD_COEFF : IO_Standard_Coeff):
        # save io std coeffs
        self.output.io_coeff = IO_STD_COEFF

        # set defaults
        self.output.bank_type = self.get_bank_type()
        self.output.bank_number = 0
        self.output.vccio_voltage = 0
        self.output.io_signal_rate = 0.0
        self.output.block_power = 0.0
        self.output.interconnect_power = 0.0
        self.output.messages.clear()

        # verify input paramters
        if clock is None:
            self.output.messages.append(RsMessageManager.get_message(301, { 'clock': self.clock }))
            return

        if self.enable == False:
            self.output.messages.append(RsMessageManager.get_message(105))
            return

        # io power calculation
        self.output.frequency = self.compute_frequency(clock)
        self.output.io_signal_rate = self.compute_signal_rate(self.output.frequency / 1000000.0)
        self.output.bank_number = self.get_bank_number()
        self.output.vccio_voltage = self.get_voltage()
        self.output.block_power = self.compute_block_power()
        self.output.interconnect_power = self.compute_interconnect_power()

@dataclass
class IO_Usage_Allocation:
    voltage : float = field(default=0.0)
    banks_used : int = field(default=0)
    io_used : int = field(default=0)
    io_available : int = field(default=0)
    error : bool = field(default=False)

@dataclass
class IO_Usage:
    type : IO_BankType = field(default=IO_BankType.HP)
    total_banks_available : int = field(default=0)
    total_banks_used : int = field(default=0)
    total_io_available : int = field(default=0)
    percentage : float = field(default=0.0)
    usage : List[IO_Usage_Allocation] = field(default_factory=list)

@dataclass
class IO_Feature(ABC):
    type: IO_FeatureType = field(default=IO_FeatureType.NONE)
    index: int = field(default=0)
    context: 'IO_SubModule' = field(default=None)

    @abstractmethod
    def compute(self) -> bool:
        pass

    @abstractmethod
    def get_power(self) -> float:
        pass

    @abstractmethod
    def set_properties(self, props: Dict[str, Any]) -> None:
        pass

@dataclass
class IO_Hp_Bank_Output:
    block_power: float = field(default=0.0)
    messages: List[RsMessage] = field(default_factory=list)

@dataclass
class IO_Hp_Bank:
    bank: int = field(default=0)
    odt_type: bool = field(default=IO_OdtType.OFF)
    output: IO_Hp_Bank_Output = field(default_factory=IO_Hp_Bank_Output)

@dataclass
class IO_Feature_ODT(IO_Feature):
    banks: List[IO_Hp_Bank] = field(default_factory=list)

    def __post_init__(self) -> None:
        for i in range(self.context.resources.get_num_HP_Banks()):
            self.banks.append(IO_Hp_Bank(bank=i+1))
        self.type = IO_FeatureType.ODT

    def get_power(self) -> float:
        return sum([bank.output.block_power for bank in self.banks])

    def set_properties(self, props: Dict[str, Any]) -> None:
        # todo: update banks' property
        pass

    def is_odt_io(self, io_std: IO_Standard) -> bool:
        if io_std in [IO_Standard.HSTL_1_2V_Class_I_with_ODT, IO_Standard.HSTL_1_2V_Class_II_with_ODT, IO_Standard.HSTL_1_5V_Class_I_with_ODT, \
                      IO_Standard.HSTL_1_5V_Class_II_with_ODT]:
            return True
        return False

    def is_all_banks(self, odt_type: IO_OdtType) -> bool:
        for bank in self.banks:
            if bank.odt_type != odt_type:
                return False
        return True

    def get_odt_io_row_count(self) -> int:
        return sum([1 for io in self.context.itemlist if self.is_odt_io(io.io_standard) == True])

    def compute(self) -> bool:
        odt_row_count = self.get_odt_io_row_count()
        odt_banks_all_off = self.is_all_banks(IO_OdtType.OFF)
        previous_odt_type = IO_OdtType.OFF
        for bank in self.banks:
            bank.output.messages.clear()
            if odt_row_count == 0 and bank.odt_type != IO_OdtType.OFF:
                bank.output.messages.append(RsMessageManager.get_message(207))
            elif odt_row_count > 0 and odt_banks_all_off:
                bank.output.messages.append(RsMessageManager.get_message(309))
            if bank.odt_type == IO_OdtType.CASCADE and previous_odt_type == IO_OdtType.OFF:
                bank.output.messages.append(RsMessageManager.get_message(310))
            if bank.odt_type == IO_OdtType.ON:
                bank.output.block_power = 0.004
            elif bank.odt_type == IO_OdtType.CASCADE:
                bank.output.block_power = 0.001
            else:
                bank.output.block_power = 0.0
            previous_odt_type = bank.odt_type
        return True

class IO_SubModule:

    def __init__(self, resources: RsDeviceResources, itemlist: List[IO] = None):
        self.resources = resources
        self.total_block_power = 0.0
        self.total_interconnect_power = 0.0
        self.total_on_die_termination_power = 0.0
        self.io_usage = [
            IO_Usage(
                type = IO_BankType.HP,
                total_banks_available = self.resources.get_num_HP_Banks(),
                total_io_available =self.resources.get_num_HP_IOs(),
                usage = [
                    IO_Usage_Allocation(voltage=1.2, banks_used=0),
                    IO_Usage_Allocation(voltage=1.5, banks_used=0),
                    IO_Usage_Allocation(voltage=1.8, banks_used=0)
                ]
            ),
            IO_Usage(
                type = IO_BankType.HR,
                total_banks_available = self.resources.get_num_HR_Banks(),
                total_io_available =self.resources.get_num_HR_IOs(),
                usage = [
                    IO_Usage_Allocation(voltage=1.8, banks_used=0),
                    IO_Usage_Allocation(voltage=2.5, banks_used=0),
                    IO_Usage_Allocation(voltage=3.3, banks_used=0)
                ]
            )
        ]
        self.io_features: List[IO_Feature] = self.create_features()
        self.itemlist: List[IO] = itemlist or []

    def create_features(self) -> List[IO_Feature]:
        return [IO_Feature_ODT(context=self)]

    def get_features(self) -> List[IO_Feature]:
        return self.io_features

    def get_resources(self):
        return self.io_usage, 0

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

    def clear(self) -> None:
        self.itemlist.clear()

    def find_coeff(self, io_std_coeff_list : List[IO_Standard_Coeff], io_std : IO_Standard) -> IO_Standard_Coeff:
        result : List[IO_Standard_Coeff] = [x for x in io_std_coeff_list if x.io_standard == io_std]
        if result:
            return result[0]
        else:
            raise IOStandardCoeffNotFoundException

    def get_num_ios_by_banktype_voltage(self, bank_type : IO_BankType, voltage : float) -> int:
        return sum([io.bus_width for io in self.itemlist if io.output.bank_type == bank_type \
                    and io.output.vccio_voltage == voltage \
                        and io.enable == True])

    def set_io_error_msg(self, bank_type : IO_BankType, voltage : float) -> None:
        for io in self.itemlist:
            if io.output.bank_type == bank_type and io.output.vccio_voltage == voltage:
                io.output.messages.append(RsMessageManager.get_message(202, { 'bank_type': bank_type.name, 'voltage': voltage }))

    def compute_output_power(self):
        # Get IO power calculation coefficients
        IO_STD_COEFF_LIST = self.resources.get_IO_standard_coeff()

        # Compute the total power consumption of all clocks
        self.total_block_power = 0.0
        self.total_interconnect_power = 0.0
        self.total_on_die_termination_power = 0.0

        # Compute the power consumption for each individual items
        for item in self.itemlist:
            item.compute_dynamic_power(self.resources.get_clock(item.clock), self.find_coeff(IO_STD_COEFF_LIST, item.io_standard))
            self.total_interconnect_power += item.output.interconnect_power
            self.total_block_power += item.output.block_power

        # Compute io features power consumption e.g. ODT
        for feature in self.io_features:
            feature.compute()
            if feature.type == IO_FeatureType.ODT:
                self.total_on_die_termination_power += feature.get_power()

        # update individual clock percentage
        total_power = self.total_block_power + self.total_interconnect_power
        for item in self.itemlist:
            item.compute_percentage(total_power)

        # compute io resource utilization
        for io_bank in self.io_usage:
            io_bank.total_banks_used = 0
            for io_alloc in io_bank.usage:
                io_alloc.io_used = self.get_num_ios_by_banktype_voltage(io_bank.type, io_alloc.voltage)
                banks_needed = math.ceil(io_alloc.io_used / 40)
                banks_available = io_bank.total_banks_available - io_bank.total_banks_used
                io_alloc.error = False
                if banks_needed > banks_available:
                    # run out of banks
                    io_alloc.banks_used = banks_available
                    io_alloc.error = True
                    # assign an warning message to all IO entries of banktype and voltage that are causing
                    # over assignment
                    self.set_io_error_msg(io_bank.type, io_alloc.voltage)
                else:
                    io_alloc.banks_used = banks_needed
                io_alloc.io_available = (io_alloc.banks_used * 40) - io_alloc.io_used
                io_bank.total_banks_used += io_alloc.banks_used

        # add total io count from the free banks to io_available field
        for io_bank in self.io_usage:
            total_io_used = 0
            for io_alloc in io_bank.usage:
                io_alloc.io_available += (io_bank.total_banks_available - io_bank.total_banks_used) * 40
                total_io_used += io_alloc.io_used
            # compute io usage in percentage
            if io_bank.total_io_available > 0:
                io_bank.percentage = (total_io_used / io_bank.total_io_available) * 100
            else:
                io_bank.percentage = 0.0
