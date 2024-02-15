#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from marshmallow import Schema, fields
from submodule.clock import Clock_State, Source

class DeviceClockingResourcesConsumptionSchema(Schema):
    total_clocks = fields.Int()
    total_clocks_used = fields.Int()
    total_plls = fields.Int()
    total_plls_used = fields.Int()
    total_clock_block_power = fields.Number()
    total_clock_interconnect_power = fields.Number()
    total_pll_power = fields.Number()
