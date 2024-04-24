#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from marshmallow import Schema, fields
from submodule.fabric_logic_element import Glitch_Factor
from .device_schemas import MessageSchema

class FabricLogicElementResourcesConsumptionSchema(Schema):
    total_lut6_available = fields.Int()
    total_lut6_used = fields.Int()
    total_flip_flop_available = fields.Int()
    total_flip_flop_used = fields.Int()
    total_block_power = fields.Number()
    total_interconnect_power = fields.Number()

class FabricLogicElementOutputSchema(Schema):
    clock_frequency = fields.Int()
    output_signal_rate = fields.Number()
    block_power = fields.Number()
    interconnect_power = fields.Number()
    percentage = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class FabricLogicElementSchema(Schema):
    enable = fields.Bool()
    name = fields.Str()
    lut6 = fields.Int()
    flip_flop = fields.Int()
    clock = fields.Str()
    toggle_rate = fields.Number()
    glitch_factor = fields.Enum(Glitch_Factor, by_value=True)
    clock_enable_rate = fields.Number()
    output = fields.Nested(FabricLogicElementOutputSchema, data_key="consumption")
