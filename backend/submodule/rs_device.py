#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import numpy as np
import math
from typing import List
from .rs_power_config import PowerValue, ScenarioType
from .rs_device_resources import RsDeviceResources, ModuleType, IO_BankType
from .clock import Clock_SubModule
from .fabric_logic_element import Fabric_LE_SubModule
from .dsp import DSP_SubModule
from .bram import BRAM_SubModule
from .io import IO_SubModule
from .peripherals import Peripheral_SubModule
from utilities.common_utils import update_attributes
from dataclasses import dataclass, field

@dataclass
class TotalPowerTemperature:
    type: str = field(default='')
    power: float = field(default=0.0)
    temperature: float = field(default=0.0)

@dataclass
class DeviceComponent:
    type: str = field(default='')
    power: float = field(default=0.0)
    percentage: float = field(default=0.0)

@dataclass
class DeviceDynamic:
    components: List[DeviceComponent] = field(default_factory=list)
    power: float = field(default=0.0)
    percentage: float = field(default=0.0)

    def compute(self) -> None:
        self.power = sum(c.power for c in self.components)
        for c in self.components:
            if self.power != 0:
                c.percentage = c.power / self.power * 100.0
            else:
                c.percentage = 0.0

@dataclass
class DeviceStatic:
    components: List[DeviceComponent] = field(default_factory=list)
    power: float = field(default=0.0)
    percentage: float = field(default=0.0)

@dataclass
class DeviceComplex:
    dynamic: DeviceDynamic = field(default_factory=DeviceDynamic)
    static: DeviceStatic = field(default_factory=DeviceStatic)
    total_power: float = field(default=0.0)
    total_percentage: float = field(default=0.0)

    def compute(self) -> None:
        self.total_power = self.dynamic.power + self.static.power
        if self.total_power > 0:
            self.dynamic.percentage = self.dynamic.power / self.total_power * 100.0
            self.static.percentage = self.static.power / self.total_power * 100.0
        else:
            self.dynamic.percentage = 0.0
            self.static.percentage = 0.0

@dataclass
class RsDevice_output:
    total_power_temperature: List[TotalPowerTemperature] = field(default_factory=list)
    processing_complex: DeviceComplex = field(default_factory=DeviceComplex)
    fpga_complex: DeviceComplex = field(default_factory=DeviceComplex)

    def compute(self) -> None:
        overall_power = self.processing_complex.total_power + self.fpga_complex.total_power
        if overall_power > 0:
            self.processing_complex.total_percentage = self.processing_complex.total_power / overall_power * 100
            self.fpga_complex.total_percentage = self.fpga_complex.total_power / overall_power * 100
        else:
            self.processing_complex.total_percentage = 0.0
            self.fpga_complex.total_percentage = 0.0

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
    fpga_complex: float = field(default=0.25)
    processing_complex: float = field(default=0.25)

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
    powers: List[PowerValue] = field(default_factory=list)
    next_temperature: float = field(default=0.0)
    temperature: float = field(default=0.0)

    def add(self, powers: List[PowerValue]) -> None:
        self.powers.extend(powers)

    def get_total_power(self) -> float:
        return sum([x.value for x in self.powers])

    def get_processing_total_power(self) -> float:
        return sum([x.value for x in self.powers if x.type in [
            'Vcc_core (NOC)', 'Vcc_core (Mem_SS)', 'Vcc_core (A45)', 'Vcc_core (Config)', 'VCC_BOOT_IO', 'VCC_DDR_IO', 'VCC_SOC_IO',
            'VCC_GIGE_IO', 'VCC_USB_IO', 'VCC_BOOT_AUX', 'VCC_SOC_AUX', 'VCC_GIGE_AUX', 'VCC_USB_AUX', 'VCC_RC_OSC', 'VCC_PUF'
        ]])

    def get_fpga_total_power(self) -> float:
        return self.get_total_power() - self.get_processing_total_power()

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
        self.output = RsDevice_output(
            total_power_temperature=[TotalPowerTemperature('worsecase'), TotalPowerTemperature(type='typical')],
            fpga_complex=DeviceComplex(dynamic=DeviceDynamic(components=[
                DeviceComponent(type='clocking'),
                DeviceComponent(type='fabric_le'),
                DeviceComponent(type='bram'),
                DeviceComponent(type='dsp'),
                DeviceComponent(type='io')
            ])),
            processing_complex=DeviceComplex(dynamic=DeviceDynamic(components=[
                DeviceComponent(type='acpu'),
                DeviceComponent(type='peripherals'),
                DeviceComponent(type='bcpu'),
                DeviceComponent(type='memory'),
                DeviceComponent(type='dma'),
                DeviceComponent(type='noc')
            ]))
        )

        # static power output result for worse & typical cases
        self.static_power_output = [StaticPowerResult(), StaticPowerResult()]

        # fabric logic element module
        self.resources.register_module(ModuleType.FABRIC_LE, Fabric_LE_SubModule(self.resources, []))

        # dsp module
        self.resources.register_module(ModuleType.DSP, DSP_SubModule(self.resources, []))

        # bram module
        self.resources.register_module(ModuleType.BRAM, BRAM_SubModule(self.resources, []))

        # io module
        self.resources.register_module(ModuleType.IO, IO_SubModule(self.resources, []))

        # clocking module
        self.resources.register_module(ModuleType.CLOCKING, Clock_SubModule(self.resources, []))

        # soc peripherals module
        self.resources.register_module(ModuleType.SOC_PERIPHERALS, Peripheral_SubModule(self.resources))

        # skip compute output power and exit function if no power data available
        if not self.resources.powercfg.is_loaded():
            return

        # perform initial calculation
        self.compute_output_power()

    def get_module(self, modtype):
        return self.resources.get_module(modtype)

    def update_dynamic_power_output(self, cmplx : DeviceComplex, typ : str, power : float) -> None:
        for elem in cmplx.dynamic.components:
            if elem.type == typ:
                elem.power = power

    def get_module_name(self, module_type : ModuleType) -> str:
        switch = {
            ModuleType.CLOCKING  : "clocking",
            ModuleType.FABRIC_LE : "fabric_le",
            ModuleType.BRAM      : "bram",
            ModuleType.DSP       : "dsp",
            ModuleType.IO        : "io",
        }
        return switch.get(module_type, None)

    def get_processing_total_static_power(self, worsecase : bool) -> float:
        return self.static_power_output[0 if worsecase else 1].get_processing_total_power()

    def get_fpga_total_static_power(self, worsecase : bool) -> float:
        return self.static_power_output[0 if worsecase else 1].get_fpga_total_power()

    def get_total_static_power(self, worsecase : bool) -> float:
        return self.static_power_output[0 if worsecase else 1].get_total_power()

    def get_junction_temperature(self, worsecase : bool) -> float:
        return self.static_power_output[0 if worsecase else 1].next_temperature

    def get_processing_total_dynamic_power(self, worsecase : bool) -> float:
        total_power = self.output.processing_complex.dynamic.power
        if worsecase == False:
            total_power *= (1.0 - self.specification.power.typical_dynamic_scaling.processing_complex)
        return total_power

    def get_fpga_total_dynamic_power(self, worsecase : bool) -> float:
        total_power = self.output.fpga_complex.dynamic.power
        if worsecase == False:
            total_power *= (1.0 - self.specification.power.typical_dynamic_scaling.fpga_complex)
        return total_power

    def get_total_dynamic_power(self, worsecase : bool) -> float:
        return self.get_processing_total_dynamic_power(worsecase) + \
            self.get_fpga_total_dynamic_power(worsecase)

    def compute_output_power(self):
        # compute total dynamic power of each sub modules (exclude peripherals)
        for modtype in (ModuleType.CLOCKING, ModuleType.FABRIC_LE, ModuleType.BRAM, ModuleType.DSP, \
                ModuleType.IO):
            module = self.resources.get_module(modtype)
            module.compute_output_power()
            power = module.get_total_output_power()
            self.update_dynamic_power_output(self.output.fpga_complex, \
                self.get_module_name(modtype), power)

        # compute total dynamic power for each sub-components of the peripherals module
        periph_mod = self.resources.get_module(ModuleType.SOC_PERIPHERALS)
        periph_mod.compute_output_power()
        self.update_dynamic_power_output(self.output.processing_complex, 'acpu', periph_mod.get_processor_output_power())
        self.update_dynamic_power_output(self.output.processing_complex, 'peripherals', periph_mod.get_peripherals_output_power())
        self.update_dynamic_power_output(self.output.processing_complex, 'bcpu', periph_mod.get_bcpu_output_power())
        self.update_dynamic_power_output(self.output.processing_complex, 'memory', periph_mod.get_memory_output_power())
        self.update_dynamic_power_output(self.output.processing_complex, 'dma', periph_mod.get_dma_output_power())
        self.update_dynamic_power_output(self.output.processing_complex, 'noc', periph_mod.get_noc_output_power())

        # compute the percentage fields by the sum of the powers of the modules
        self.output.processing_complex.dynamic.compute()
        self.output.fpga_complex.dynamic.compute()

        # compute static power output and junction temperature
        self.compute_static_power()
        self.output.processing_complex.static.power = self.get_processing_total_static_power(True)
        self.output.fpga_complex.static.power = self.get_fpga_total_static_power(True)
        self.output.processing_complex.compute()
        self.output.fpga_complex.compute()
        self.output.compute()

        # update total power output and junction temperature for worse and typical cases
        self.output.total_power_temperature[0].temperature = self.get_junction_temperature(True)
        self.output.total_power_temperature[0].power = self.get_total_dynamic_power(True) + \
            self.get_total_static_power(True)
        self.output.total_power_temperature[1].temperature = self.get_junction_temperature(False)
        self.output.total_power_temperature[1].power = self.get_total_dynamic_power(False) + \
            self.get_total_static_power(False)

    def get_power_consumption(self):
        return self.output

    def update_spec(self, data):
        return update_attributes(self.specification, data)

    def get_io_banks_used(self, bank_type : IO_BankType, voltage : float = None) -> int:
        num_banks = 0
        iomod = self.get_module(ModuleType.IO)
        for elem in iomod.io_usage:
            if elem.type == bank_type:
                for item in elem.usage:
                    if voltage is None or item.voltage == voltage:
                        num_banks += item.banks_used
                break
        return num_banks

    def get_io_banks(self, bank_type : IO_BankType) -> int:
        if bank_type == IO_BankType.HP:
            return self.resources.get_num_HP_Banks()
        else:
            return self.resources.get_num_HR_Banks()

    def compute_IO_bank_type(self, temperature : float, bank_type : IO_BankType, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_IO_bank_type(bank_type.value, worsecase)
        power = self.calculate(temperature, coeff)
        num_banks = self.get_io_banks(bank_type)
        total_power = num_banks * power
        return total_power

    def compute_Aux_IO_bank_type(self, temperature : float, bank_type : IO_BankType, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_Aux_bank_type(bank_type.value, worsecase)
        power = self.calculate(temperature, coeff)
        num_io_banks_used = self.get_io_banks_used(bank_type)
        total_power = power * num_io_banks_used
        return total_power

    def compute_IO_bank_type_voltage(self, temperature : float, bank_type : IO_BankType, voltage : float, worsecase : bool) -> float:
        divfactor, coeff = self.resources.get_divfactor_coeff_IO_bank_type_voltage(bank_type.value, voltage, worsecase)
        power = self.calculate(temperature, coeff)
        num_io_banks_used = self.get_io_banks_used(bank_type, voltage)
        total_power = power * num_io_banks_used * 20 * voltage / divfactor
        return total_power

    def compute_OBSOLETE(self, temperature : float, worsecase : bool = True) -> StaticPowerResult:
        result = StaticPowerResult(
            temperature  = temperature,
            # NOC          = self.compute_NOC(temperature, worsecase),
            # Mem_SS       = self.compute_Mem_SS(temperature, worsecase),
            # A45          = self.compute_A45(temperature, worsecase),
            # Config       = self.compute_Config(temperature, worsecase),
            # CLB          = self.compute_CLB(temperature, worsecase),
            # BRAM         = self.compute_BRAM(temperature, worsecase),
            # DSP          = self.compute_DSP(temperature, worsecase),
            # Gearbox_HP   = self.compute_Gearbox_IO_bank_type(temperature, IO_BankType.HP, worsecase),
            Gearbox_HR   = self.compute_Gearbox_IO_bank_type(temperature, IO_BankType.HR, worsecase),
            HP_IO        = self.compute_IO_bank_type(temperature, IO_BankType.HP, worsecase),
            HR_IO        = self.compute_IO_bank_type(temperature, IO_BankType.HR, worsecase),
            # Aux          = self.compute_Aux(temperature, worsecase),
            HP_Aux       = self.compute_Aux_IO_bank_type(temperature, IO_BankType.HP, worsecase),
            HR_Aux       = self.compute_Aux_IO_bank_type(temperature, IO_BankType.HR, worsecase),
            HR_IO_1_8V   = self.compute_IO_bank_type_voltage(temperature, IO_BankType.HR, 1.8, worsecase),
            HR_IO_2_5V   = self.compute_IO_bank_type_voltage(temperature, IO_BankType.HR, 2.5, worsecase),
            HR_IO_3_3V   = self.compute_IO_bank_type_voltage(temperature, IO_BankType.HR, 3.3, worsecase),
            HP_IO_1_2V   = self.compute_IO_bank_type_voltage(temperature, IO_BankType.HP, 1.2, worsecase),
            HP_IO_1_5V   = self.compute_IO_bank_type_voltage(temperature, IO_BankType.HP, 1.5, worsecase),
            HP_IO_1_8V   = self.compute_IO_bank_type_voltage(temperature, IO_BankType.HP, 1.8, worsecase),
            # VCC_BOOT_IO  = self.compute_VCC_BOOT_IO(temperature, worsecase),
            # VCC_DDR_IO   = self.compute_VCC_DDR_IO(temperature, worsecase),
            # VCC_SOC_IO   = self.compute_VCC_SOC_IO(temperature, worsecase),
            # VCC_GIGE_IO  = self.compute_VCC_GIGE_IO(temperature, worsecase),
            # VCC_USB_IO   = self.compute_VCC_USB_IO(temperature, worsecase),
            # VCC_BOOT_AUX = self.compute_VCC_BOOT_AUX(temperature, worsecase),
            # VCC_SOC_AUX  = self.compute_VCC_SOC_AUX(temperature, worsecase),
            # VCC_GIGE_AUX = self.compute_VCC_GIGE_AUX(temperature, worsecase),
            # VCC_USB_AUX  = self.compute_VCC_USB_AUX(temperature, worsecase),
            # VCC_RC_OSC   = self.compute_VCC_RC_OSC(temperature, worsecase),
            # VCC_PUF      = self.compute_VCC_PUF(temperature, worsecase)
        )
        return result

    def compute(self, temperature: float, scenerio: ScenarioType) -> StaticPowerResult:
        # compute fabric/fpga static power
        power = StaticPowerResult()
        for modtype in (ModuleType.FABRIC_LE, ModuleType.BRAM, ModuleType.DSP, ModuleType.CLOCKING):
            power.add(self.get_module(modtype).compute_static_power(temperature, scenerio))

        # compute processin/peripheral static power
        for periph in self.get_module(ModuleType.SOC_PERIPHERALS).get_peripherals():
            power.add(periph.compute_static_power(temperature, scenerio))
        return power

    def compute_power_junction_temperature(self, temperature: float, theta_ja: float, dynamic_power: float, \
            scenario: ScenarioType, N: int = 4) -> StaticPowerResult:
        next_temperature = temperature
        res = None
        for i in range(N):
            res = self.compute(next_temperature, scenario)
            res.next_temperature = temperature + (theta_ja * (res.get_total_power() + dynamic_power))
            next_temperature = res.next_temperature
        return res

    def compute_static_power(self):
        # static power & junction temperature for worse case
        self.static_power_output[0] = self.compute_power_junction_temperature( \
            self.specification.thermal.ambient.worsecase, \
            self.specification.thermal.theta_ja, \
            self.get_total_dynamic_power(True),
            ScenarioType.WORSE)

        # static power & junction temperature for typical case
        self.static_power_output[1] = self.compute_power_junction_temperature( \
            self.specification.thermal.ambient.typical, \
            self.specification.thermal.theta_ja, \
            self.get_total_dynamic_power(False),
            ScenarioType.TYPICAL)

    def clear(self) -> None:
        # clear all device inputs by user
        for module in self.resources.get_modules():
            if module:
                module.clear()
