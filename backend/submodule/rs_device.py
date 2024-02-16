#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from submodule.clock import Clock_SubModule, Clock
from submodule.fabric_logic_element import Fabric_LE_SubModule, Fabric_LE
from utilities.common_utils import ModuleType

# each rs_device contains a rs_device_resource class object:
# - *LE
# - CLB columns	
# - CLB Rows	
# - BRAM columns	
# - DSP Columns	
# - *CLBs	
# - *LUTs	
# - *FFs
# - *Actual BRAMs	
# - BRAMs	
# - *Actual DSPs	
# - *DSP	
# - char level	
# - Clocks	
# - PLLs

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

    def get_clock_cap(self) -> float:
        return 0.00001

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
            Fabric_LE(enable=True, clock='CLK_100', name='testing', flip_flop=100),
            Fabric_LE(enable=True, clock='CLK_233', name='testing', flip_flop=50)
        ]))

        # clocking module
        self.clock_module = self.resources.register_module(ModuleType.CLOCKING, Clock_SubModule(self.resources, [
            Clock(True, "Default clock", port="CLK_100", frequency=100000000)
        ]))

