#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from marshmallow import Schema, fields
from submodule.clock import Clock_State, Source

class ClockingResourcesConsumptionSchema(Schema):
    total_clocks_available = fields.Int()
    total_clocks_used = fields.Int()
    total_plls_available = fields.Int()
    total_plls_used = fields.Int()
    total_clock_block_power = fields.Number()
    total_clock_interconnect_power = fields.Number()
    total_pll_power = fields.Number()

class ClockingOutputSchema(Schema):
    fan_out = fields.Int()
    block_power = fields.Number()
    interconnect_power = fields.Number()
    percentage = fields.Number()
    message = fields.Str()

class ClockingSchema(Schema):
    enable = fields.Bool()
    description = fields.Str()
    port = fields.Str()
    source = fields.Enum(Source, by_value=True)
    frequency = fields.Int()
    state = fields.Enum(Clock_State, by_value=True)
    output = fields.Nested(ClockingOutputSchema, data_key="consumption")
