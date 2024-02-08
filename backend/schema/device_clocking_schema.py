#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from marshmallow import Schema, fields
from submodule.clock import Clock_State, Source

class DeviceClockingOutputSchema(Schema):
    fan_out = fields.Int()
    block_power = fields.Number()
    interconnect_power = fields.Number()
    percentage = fields.Number()
    message = fields.Str()

class DeviceClockingSchema(Schema):
    enable = fields.Bool()
    description = fields.Str()
    port = fields.Str()
    source = fields.Enum(Source, by_value=True)
    frequency = fields.Int()
    state = fields.Enum(Clock_State, by_value=True)
    output = fields.Nested(DeviceClockingOutputSchema, data_key="consumption")
