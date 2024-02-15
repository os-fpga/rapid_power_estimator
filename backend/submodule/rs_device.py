#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from submodule.clock import Clock_SubModule, Clock
from submodule.fabric_logic_element import Fabric_LE_SubModule, Fabric_LE

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

    def get_num_LUTs(self) -> int:
        return self.get_attr('lut')

    def get_num_FFs(self) -> int:
        return self.get_attr('ff')

    def get_clock_cap(self) -> float:
        return 0.00001

class RsDevice:

    def __init__(self, device):

        self.resources : RsDeviceResources = RsDeviceResources(device)
        self.id = device.name
        self.series = device.series
        self.logic_density = ''
        self.package = device.package
        self.speedgrade = device.speedgrade
        self.temperature_grade = "Industrial (-40 to 100 °C)"

        # fabric logic element module
        self.fabric_le_module = Fabric_LE_SubModule(self.resources, [])

        # clocking module
        self.clock_module = Clock_SubModule(self.resources, [
            Clock(True, "Default clock", port="CLK_100", frequency=100000000)
        ])
