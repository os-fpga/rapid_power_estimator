#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import numpy as np
import math
import sys
from .rs_device_resources import RsDeviceResources, ModuleType
from .clock import Clock_SubModule, Clock
from .fabric_logic_element import Fabric_LE_SubModule, Fabric_LE
from .dsp import DSP_SubModule, DSP
from .bram import BRAM_SubModule, BRAM, BRAM_Type, PortProperties
from .io import IO_SubModule, IO, IO_Bank_Type
from .peripherals import Peripheral_SubModule
from utilities.common_utils import update_attributes
from dataclasses import dataclass, field

@dataclass
class RsDevicePowerThermal:
    total_power: float = field(default=0.0)
    thermal: float = field(default=0.0)

@dataclass
class RsDevice_output:
    typical: RsDevicePowerThermal = field(default_factory=RsDevicePowerThermal)
    worsecase: RsDevicePowerThermal = field(default_factory=RsDevicePowerThermal)

@dataclass
class Ambient:
    typical: float = field(default=25.0)
    worsecase: float = field(default=80.0)

@dataclass
class ThermalSpec:
    theta_ja: float = field(default=10.0)
    ambient: Ambient = field(default_factory=Ambient)

@dataclass
class TypicalDynamicScaling:
    fpga_complex: float = field(default=25.0)
    processing_complex: float = field(default=25.0)

@dataclass
class PowerSpec:
    budget: float = field(default=0.5)
    typical_dynamic_scaling: TypicalDynamicScaling = field(default_factory=TypicalDynamicScaling)

@dataclass
class Specification:
    thermal: ThermalSpec = field(default_factory=ThermalSpec)
    power: PowerSpec = field(default_factory=PowerSpec)

@dataclass
class StaticPowerResult():
    NOC: float = field(default=0.0)
    Mem_SS: float = field(default=0.0)
    A45: float = field(default=0.0)
    Config: float = field(default=0.0)
    CLB: float = field(default=0.0)
    BRAM: float = field(default=0.0)
    DSP: float = field(default=0.0)
    Gearbox_HP: float = field(default=0.0)
    Gearbox_HR: float = field(default=0.0)
    HP_IO: float = field(default=0.0)
    HR_IO: float = field(default=0.0)
    Aux: float = field(default=0.0)
    HP_Aux: float = field(default=0.0)
    HR_Aux: float = field(default=0.0)
    HR_IO_1_8V: float = field(default=0.0)
    HR_IO_2_5V: float = field(default=0.0)
    HR_IO_3_3V: float = field(default=0.0)
    HP_IO_1_2V: float = field(default=0.0)
    HP_IO_1_5V: float = field(default=0.0)
    HP_IO_1_8V: float = field(default=0.0)
    VCC_BOOT_IO: float = field(default=0.0)
    VCC_DDR_IO: float = field(default=0.0)
    VCC_SOC_IO: float = field(default=0.0)
    VCC_GIGE_IO: float = field(default=0.0)
    VCC_USB_IO: float = field(default=0.0)
    VCC_BOOT_AUX: float = field(default=0.0)
    VCC_SOC_AUX: float = field(default=0.0)
    VCC_GIGE_AUX: float = field(default=0.0)
    VCC_USB_AUX: float = field(default=0.0)
    VCC_RC_OSC: float = field(default=0.0)
    VCC_PUF: float = field(default=0.0)
    temperature: float = field(default=0.0)
    next_temperature: float = field(default=0.0)

class RsDevice:

    def __init__(self, device):

        self.resources : RsDeviceResources = RsDeviceResources(device)
        self.id = self.resources.get_device_name()
        self.series = self.resources.get_series()
        self.logic_density = self.resources.get_logic_density()
        self.package = self.resources.get_package()
        self.speedgrade = self.resources.get_speedgrade()
        self.temperature_grade = self.resources.get_temperature_grade()
        self.specification = Specification()
        self.output = RsDevice_output()

        # fabric logic element module
        self.resources.register_module(ModuleType.FABRIC_LE, Fabric_LE_SubModule(self.resources, [
            Fabric_LE(enable=True, clock='CLK_100', name='Test 1', lut6=20, flip_flop=50),
            Fabric_LE(enable=True, clock='CLK_233', name='Test 2', lut6=10, flip_flop=30)
        ]))

        # dsp module
        self.resources.register_module(ModuleType.DSP, DSP_SubModule(self.resources, [
            DSP(number_of_multipliers=11, enable=True, name="test test 1", clock='CLK_100'),
            DSP(number_of_multipliers=12, enable=True, name="test test 2", clock='CLK_233')
        ]))

        # bram module
        self.resources.register_module(ModuleType.BRAM, BRAM_SubModule(self.resources, [
            BRAM(name="test 1", bram_used=16, enable=True, type=BRAM_Type.BRAM_18k_TDP, port_a=PortProperties(clock='CLK_100'), port_b=PortProperties(clock='CLK_233')),
            BRAM(name="test 2", bram_used=17, enable=True, type=BRAM_Type.BRAM_18k_TDP)
        ]))

        # io module
        self.resources.register_module(ModuleType.IO, IO_SubModule(self.resources, [
            IO(name="test 1", clock="CLK_100", enable=True),
            IO(name="test 2", clock="CLK_233")
        ]))

        # clocking module
        self.resources.register_module(ModuleType.CLOCKING, Clock_SubModule(self.resources, [
            Clock(True, "Default Clock", port="CLK_100", frequency=100000000),
            Clock(True, "PLL Clock", port="CLK_233", frequency=233000000)
        ]))

        # soc peripherals module
        self.resources.register_module(ModuleType.SOC_PERIPHERALS, Peripheral_SubModule(self.resources))

        # perform initial calculation
        self.compute_output_power()

    def get_module(self, modtype):
        return self.resources.get_module(modtype)

    def compute_output_power(self):
        self.output.typical.total_power = 0.0
        self.output.worsecase.total_power = 0.0
        for mod in self.resources.get_modules():
            if mod is not None:
                mod.compute_output_power()
                # todo: sum all module power consumption
                # todo: calculate static power
                self.output.typical.total_power += mod.total_block_power + mod.total_interconnect_power
                self.output.worsecase.total_power += mod.total_block_power + mod.total_interconnect_power
        self.compute_static_power()

    def get_power_consumption(self):
        return self.output

    def update_spec(self, data):
        return update_attributes(self.specification, data['specification'])

    def get_io_banks_used(self, bank_type : IO_Bank_Type, voltage : float = None) -> int:
        num_banks = 0
        iomod = self.get_module(ModuleType.IO)
        for elem in iomod.io_usage:
            if elem.type == bank_type:
                for item in elem.usage:
                    if voltage is None or item.voltage == voltage:
                        num_banks += item.banks_used
                break
        return num_banks

    def get_io_banks(self, bank_type : IO_Bank_Type) -> int:
        if bank_type == IO_Bank_Type.HP:
            return self.resources.get_num_HP_Banks()
        else:
            return self.resources.get_num_HR_Banks()

    def calculate(self, temperature : float, coeffs : [[float]], factor : float = 1.0) -> float:
        total = 0.0
        for co in coeffs:
            values = np.polyval(co, [temperature])
            total += values[0]
        return total * factor

    def compute_NOC(self, temperature : float, worsecase : bool) -> float:
        # todo: not all device has NOC
        divfactor, coeff = self.resources.get_divfactor_coeff_NOC(worsecase)
        power = self.calculate(temperature, coeff)
        return power

    def compute_Mem_SS(self, temperature : float, worsecase : bool) -> float:
        # todo: not all device has Mem
        divfactor, coeff = self.resources.get_divfactor_coeff_Mem_SS(worsecase)
        power = self.calculate(temperature, coeff)
        return power

    def compute_A45(self, temperature : float, worsecase : bool) -> float:
        # todo: not all device has ACPU
        divfactor, coeff = self.resources.get_divfactor_coeff_A45(worsecase)
        power = self.calculate(temperature, coeff)
        return power

    def compute_Config(self, temperature : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_Config(worsecase)
        power = self.calculate(temperature, coeff)
        return power

    def compute_CLB(self, temperature : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_CLB(worsecase)
        power = self.calculate(temperature, coeff)
        num_clbs = self.resources.get_num_CLBs()
        total_power = num_clbs * power
        return total_power

    def compute_BRAM(self, temperature : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_BRAM(worsecase)
        power = self.calculate(temperature, coeff)
        num_brams = self.resources.get_num_36K_BRAM()
        total_power = num_brams * power
        return total_power

    def compute_DSP(self, temperature : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_DSP(worsecase)
        power = self.calculate(temperature, coeff)
        num_dsps = self.resources.get_num_DSP_BLOCKs()
        total_power = num_dsps * power
        return total_power

    def compute_Gearbox_IO_bank_type(self, temperature : float, bank_type : IO_Bank_Type, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_GEARBOX_IO_bank_type(bank_type.value, worsecase)
        power = self.calculate(temperature, coeff)
        num_banks = self.get_io_banks(bank_type)
        total_power = num_banks * power
        return total_power

    def compute_IO_bank_type(self, temperature : float, bank_type : IO_Bank_Type, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_IO_bank_type(bank_type.value, worsecase)
        power = self.calculate(temperature, coeff)
        num_banks = self.get_io_banks(bank_type)
        total_power = num_banks * power
        return total_power

    def compute_Aux(self, temperature : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_AUX(worsecase)
        power = self.calculate(temperature, coeff, self.resources.get_VCC_AUX() / divfactor)
        return power

    def compute_Aux_IO_bank_type(self, temperature : float, bank_type : IO_Bank_Type, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_Aux_bank_type(bank_type.value, worsecase)
        power = self.calculate(temperature, coeff)
        num_io_banks_used = self.get_io_banks_used(bank_type)
        total_power = power * num_io_banks_used
        return total_power

    def compute_IO_bank_type_voltage(self, temperature : float, bank_type : IO_Bank_Type, voltage : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_IO_bank_type_voltage(bank_type.value, voltage, worsecase)
        power = self.calculate(temperature, coeff)
        num_io_banks_used = self.get_io_banks_used(bank_type, voltage)
        total_power = power * num_io_banks_used * 20 * voltage / divfactor
        return total_power

    def compute_VCC_BOOT_IO(self, temperature : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_VCC_BOOT_IO(worsecase)
        power = self.calculate(temperature, coeff, self.resources.get_VCC_BOOT_IO() / divfactor)
        num_boot_ios = self.resources.get_num_BOOT_IOs()
        total_power = power * math.ceil(num_boot_ios / 2)
        return total_power

    def compute_VCC_DDR_IO(self, temperature : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_VCC_DDR_IO(worsecase)
        power = self.calculate(temperature, coeff, self.resources.get_VCC_DDR_IO() / divfactor)
        num_ddr_ios = self.resources.get_num_DDR_IOs()
        total_power = power * (num_ddr_ios / 2)
        return total_power

    def compute_VCC_SOC_IO(self, temperature : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_VCC_SOC_IO(worsecase)
        power = self.calculate(temperature, coeff, self.resources.get_VCC_SOC_IO() / divfactor)
        num_soc_ios = self.resources.get_num_SOC_IOs()
        total_power = power * (num_soc_ios / 2)
        return total_power

    def compute_VCC_GIGE_IO(self, temperature : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_VCC_GIGE_IO(worsecase)
        power = self.calculate(temperature, coeff, self.resources.get_VCC_GBE_IO() / divfactor)
        num_gige_ios = self.resources.get_num_GIGE_IOs()
        total_power = power * (num_gige_ios / 2)
        return total_power

    def compute_VCC_USB_IO(self, temperature : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_VCC_USB_IO(worsecase)
        power = self.calculate(temperature, coeff, self.resources.get_VCC_USB_IO() / divfactor)
        num_usb_ios = self.resources.get_num_USB_IOs()
        total_power = power * math.ceil(num_usb_ios / 2)
        return total_power

    def compute_VCC_BOOT_AUX(self, temperature : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_VCC_BOOT_AUX(worsecase)
        power = self.calculate(temperature, coeff, self.resources.get_VCC_BOOT_AUX() / divfactor)
        num_boot_ios = self.resources.get_num_BOOT_IOs()
        total_power = power * (num_boot_ios / 40)
        if worsecase == False:
            total_power *= 0.8
        return total_power

    def compute_VCC_SOC_AUX(self, temperature : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_VCC_SOC_AUX(worsecase)
        power = self.calculate(temperature, coeff, self.resources.get_VCC_SOC_AUX() / divfactor)
        num_soc_ios = self.resources.get_num_SOC_IOs()
        total_power = power * (num_soc_ios / 40)
        if worsecase == False:
            total_power *= 0.8
        return total_power

    def compute_VCC_GIGE_AUX(self, temperature : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_VCC_GIGE_AUX(worsecase)
        power = self.calculate(temperature, coeff, self.resources.get_VCC_GBE_AUX() / divfactor)
        num_gige_ios = self.resources.get_num_GIGE_IOs()
        total_power = power * (num_gige_ios / 40)
        if worsecase == False:
            total_power *= 0.8
        return total_power

    def compute_VCC_USB_AUX(self, temperature : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_VCC_USB_AUX(worsecase)
        power = self.calculate(temperature, coeff, self.resources.get_VCC_USB_AUX() / divfactor)
        num_usb_ios = self.resources.get_num_USB_IOs()
        total_power = power * (num_usb_ios / 40)
        return total_power

    def compute_VCC_RC_OSC(self, temperature : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_VCC_RC_OSC(worsecase)
        power = self.calculate(temperature, coeff, self.resources.get_VCC_RC_OSC() / divfactor)
        return power

    def compute_VCC_PUF(self, temperature : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_VCC_PUF(worsecase)
        power = self.calculate(temperature, coeff, self.resources.get_VCC_PUF() / divfactor)
        return power

    def compute(self, temperature : float, worsecase : bool = True) -> StaticPowerResult:
        result = StaticPowerResult(
            temperature  = temperature,
            NOC          = self.compute_NOC(temperature, worsecase),
            Mem_SS       = self.compute_Mem_SS(temperature, worsecase),
            A45          = self.compute_A45(temperature, worsecase),
            Config       = self.compute_Config(temperature, worsecase),
            CLB          = self.compute_CLB(temperature, worsecase),
            BRAM         = self.compute_BRAM(temperature, worsecase),
            DSP          = self.compute_DSP(temperature, worsecase),
            Gearbox_HP   = self.compute_Gearbox_IO_bank_type(temperature, IO_Bank_Type.HP, worsecase),
            Gearbox_HR   = self.compute_Gearbox_IO_bank_type(temperature, IO_Bank_Type.HR, worsecase),
            HP_IO        = self.compute_IO_bank_type(temperature, IO_Bank_Type.HP, worsecase),
            HR_IO        = self.compute_IO_bank_type(temperature, IO_Bank_Type.HR, worsecase),
            Aux          = self.compute_Aux(temperature, worsecase),
            HP_Aux       = self.compute_Aux_IO_bank_type(temperature, IO_Bank_Type.HP, worsecase),
            HR_Aux       = self.compute_Aux_IO_bank_type(temperature, IO_Bank_Type.HR, worsecase),
            HR_IO_1_8V   = self.compute_IO_bank_type_voltage(temperature, IO_Bank_Type.HR, 1.8, worsecase),
            HR_IO_2_5V   = self.compute_IO_bank_type_voltage(temperature, IO_Bank_Type.HR, 2.5, worsecase),
            HR_IO_3_3V   = self.compute_IO_bank_type_voltage(temperature, IO_Bank_Type.HR, 3.3, worsecase),
            HP_IO_1_2V   = self.compute_IO_bank_type_voltage(temperature, IO_Bank_Type.HP, 1.2, worsecase),
            HP_IO_1_5V   = self.compute_IO_bank_type_voltage(temperature, IO_Bank_Type.HP, 1.5, worsecase),
            HP_IO_1_8V   = self.compute_IO_bank_type_voltage(temperature, IO_Bank_Type.HP, 1.8, worsecase),
            VCC_BOOT_IO  = self.compute_VCC_BOOT_IO(temperature, worsecase),
            VCC_DDR_IO   = self.compute_VCC_DDR_IO(temperature, worsecase),
            VCC_SOC_IO   = self.compute_VCC_SOC_IO(temperature, worsecase),
            VCC_GIGE_IO  = self.compute_VCC_GIGE_IO(temperature, worsecase),
            VCC_USB_IO   = self.compute_VCC_USB_IO(temperature, worsecase),
            VCC_BOOT_AUX = self.compute_VCC_BOOT_AUX(temperature, worsecase),
            VCC_SOC_AUX  = self.compute_VCC_SOC_AUX(temperature, worsecase),
            VCC_GIGE_AUX = self.compute_VCC_GIGE_AUX(temperature, worsecase),
            VCC_USB_AUX  = self.compute_VCC_USB_AUX(temperature, worsecase),
            VCC_RC_OSC   = self.compute_VCC_RC_OSC(temperature, worsecase),
            VCC_PUF      = self.compute_VCC_PUF(temperature, worsecase)
        )
        return result

    def compute_static_power(self):
        # todo: remove after testing
        wc_result = self.compute(self.specification.thermal.ambient.worsecase, True)
        typical_result = self.compute(self.specification.thermal.ambient.typical, False)
        print("[debug] wc", wc_result, file=sys.stderr)
        print("[debug] typical", typical_result, file=sys.stderr)
