#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from submodule.clock import Clock_SubModule, Clock

class RsDevice:

    def __init__(self, res):
        self.id = res.name
        self.series = res.series
        self.logic_density = ''
        self.package = res.package
        self.speedgrade = res.speedgrade
        self.temperature_grade = "Industrial (-40 to 100 °C)"
        self.resources = res
        self.clock_module = Clock_SubModule([
            Clock(True, "Default clock", port="CLK_100"),
            Clock(True, "CPU clock", port="CLK_233")
        ])

    #
    # CRUD for device's clocking configs
    #
    def add_clock(self, props):
        clock = Clock()
        for key, value in props.items():
            if hasattr(clock, key):
                setattr(clock, key, value)
                
        self.clock_module.add_clock(clock)
        return clock

    def get_clocks(self):
        return self.clock_module.get_clocks()

    def get_clock(self, idx):
        return self.clock_module.get_clock(idx)

    def update_clock(self, idx, props):
        clock = self.clock_module.get_clock(idx)
        for key, value in props.items():
            if hasattr(clock, key):
                setattr(clock, key, value)
        return clock

    def delete_clock(self, idx):
        return self.clock_module.delete_clock(idx)

    def get_clocking_resources(self, total_clock_available, total_pll_available):
        return self.clock_module.get_clocking_resources(total_clock_available, total_pll_available)

    def compute_clocks_output_power(self):
        return self.clock_module.compute_clocks_output_power()
