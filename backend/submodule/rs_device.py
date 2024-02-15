#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from submodule.clock import Clock_SubModule, Clock

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

    def __init__(self, res):
        self.resources = res

    def get_num_Clocks(self):
        # NOTE:
        #   The no. of clock resource is not available in device.xml.
        #   Thus, hardcode here till this is available 
        return 16

    def get_num_PLLs(self) -> int:
        # NOTE:
        #   The no. of PLL resource is not available in device.xml.
        #   Thus, hardcode here till this is available 
        series = self.resources.series
        if series in ('Gemini', 'Orion', 'Lyra', 'Vega'):
            return 4
        elif series == 'Virgo':
            return 2

    def get_clock_cap(self) -> float:
        return 0.00001

class RsDevice:

    def __init__(self, res):

        self.resources : RsDeviceResources = RsDeviceResources(res)
        self.id = res.name
        self.series = res.series
        self.logic_density = ''
        self.package = res.package
        self.speedgrade = res.speedgrade
        self.temperature_grade = "Industrial (-40 to 100 °C)"
        self.clock_module = Clock_SubModule(self.resources, [
            Clock(True, "Default clock", port="CLK_100"),
            Clock(True, "CPU clock", port="CLK_233"),
        ])
