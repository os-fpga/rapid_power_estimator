#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from .rs_device_resources import RsDeviceResources, ModuleType
from .clock import Clock_SubModule, Clock
from .fabric_logic_element import Fabric_LE_SubModule, Fabric_LE
from .dsp import DSP_SubModule, DSP
from .bram import BRAM_SubModule, BRAM, BRAM_Type, PortProperties
from .io import IO_SubModule, IO
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

    def get_power_consumption(self):
        return self.output

    def update_spec(self, data):
        return update_attributes(self.specification, data['specification'])
