#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from backend.submodule.clock import Clock_SubModule, Clock
from backend.submodule.fabric_logic_element import Fabric_LE_SubModule, Fabric_LE
from backend.submodule.dsp import DSP_SubModule, DSP
from enum import Enum

class ModuleType(Enum):
    CLOCKING = 0
    FABRIC_LE = 1
    DSP = 2
    BRAM = 3
    IO = 4
    PERIPHERAL_PROCESSING = 5
    REGULATOR = 6

class RsDeviceResources:

    def __init__(self, device):
        self.device = device
        self.modules = [None, None, None, None, None, None, None]

    def get_attr(self, name) -> int:
        return int(self.device.resources[name].num)

    def get_num_Clocks(self):
        # NOTE:
        #   The no. of clock resource is not available in device.xml.
        #   Thus, hardcode here till this is available 
        return 16

    def get_num_PLLs(self) -> int:
        # NOTE:
        #   The no. of PLL resource is not available in device.xml.
        #   Thus, hardcode here till this is available 
        series = self.device.series
        if series in ('Gemini', 'Orion', 'Lyra', 'Vega'):
            return 4
        elif series == 'Virgo':
            return 2

    def get_num_DSP_BLOCKs(self) -> int:
        # return self.get_attr('dsp')
        return 200 # overwrite for test purpose

    def get_series(self):
        return self.device.series

    def get_device_name(self):
        return self.device.name

    def get_package(self):
        return self.device.package

    def get_speedgrade(self):
        return self.device.speedgrade

    def get_logic_density(self):
        return ''

    def get_temperature_grade(self):
        return "Industrial (-40 to 100 °C)"

    def get_num_LUTs(self) -> int:
        return self.get_attr('lut')

    def get_num_FFs(self) -> int:
        return self.get_attr('ff')

    def get_CLK_CAP(self) -> float:
        # todo: read from power data. Coeffient to calculate clock block power
        return 0.00001

    def get_CLK_INT_CAP(self) -> float:
        # todo: read from power data. Coeffient to calculate clock interconnect power
        return 0.00000003

    def get_PLL_INT(self) -> float:
        # todo: read from power data. Coeffient to calculate PLL power (VCC Core)
        return 0.0009

    def get_PLL_AUX(self) -> float:
        # todo: read from power data. Coeffient to calculate PLL power (Aux Int)
        return 0.01

    def get_LUT_CAP(self) -> float:
        # todo: read from power data. Coeffient to calculate FLE block power
        return 0.0000003

    def get_FF_CAP(self) -> float:
        # todo: read from power data. Coeffient to calculate FLE block power
        return 0.00000035

    def get_FF_CLK_CAP(self) -> float:
        # todo: read from power data. Coeffient to calculate FLE block power
        return 2.91375291375291E-09

    def get_LUT_INT_CAP(self) -> float:
        # todo: read from power data. Coeffient to calculate FLE interconnect power
        return 0.00000002

    def get_FF_INT_CAP(self) -> float:
        # todo: read from power data. Coeffient to calculate FLE interconnect power
        return 0.00000004

    def get_VCC_CORE(self) -> float:
        # todo: should read from regulator module
        return 0.8

    def get_VCC_AUX(self) -> float:
        # todo: should read from regulator module
        return 1.8

    def register_module(self, modtype, module):
        self.modules[modtype.value] = module
        return module

    def get_module(self, modtype):
        return self.modules[modtype.value]

    def get_clocking_fanout(self, clkname):
        total_fanout = 0

        # fabric logic element module
        fabric_le_module = self.get_module(ModuleType.FABRIC_LE)
        if fabric_le_module is not None:
            for fle in fabric_le_module.get_fabric_les():
                if fle.clock == clkname:
                    total_fanout += fle.flip_flop
        
        # todo: other modules
        
        return total_fanout

    def get_clock(self, clkname):
        clock_module = self.get_module(ModuleType.CLOCKING)
        if clock_module != None:
            for clock in clock_module.get_clocks():
                if clock.port == clkname:
                    return clock
        return None

class RsDevice:

    def __init__(self, device):

        self.resources : RsDeviceResources = RsDeviceResources(device)
        self.id = self.resources.get_device_name()
        self.series = self.resources.get_series()
        self.logic_density = self.resources.get_logic_density()
        self.package = self.resources.get_package()
        self.speedgrade = self.resources.get_speedgrade()
        self.temperature_grade = self.resources.get_temperature_grade()

        # fabric logic element module
        self.fabric_le_module = self.resources.register_module(ModuleType.FABRIC_LE, Fabric_LE_SubModule(self.resources, [
            Fabric_LE(enable=True, clock='CLK_100', name='Test 1', lut6=20, flip_flop=50),
            Fabric_LE(enable=True, clock='CLK_233', name='Test 2', lut6=10, flip_flop=30)
        ]))

        # dsp module
        self.dsp_module = self.resources.register_module(ModuleType.DSP, DSP_SubModule(self.resources, [
            DSP(),
            DSP()
        ]))

        # clocking module
        self.clock_module = self.resources.register_module(ModuleType.CLOCKING, Clock_SubModule(self.resources, [
            Clock(True, "Default Clock", port="CLK_100", frequency=100000000),
            Clock(True, "PLL Clock", port="CLK_233", frequency=233000000)
        ]))

        # perform initial calculation
        self.fabric_le_module.compute_fabric_le_output_power()
        self.clock_module.compute_clocks_output_power()
        self.dsp_module.compute_ouput_power()
