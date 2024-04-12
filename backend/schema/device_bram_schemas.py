#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from marshmallow import Schema, fields
from submodule.bram import BRAM_Type
from .device_schemas import MessageSchema

class BramResourcesConsumptionSchema(Schema):
    total_18k_bram_available = fields.Int()
    total_18k_bram_used = fields.Int()
    total_36k_bram_available = fields.Int()
    total_36k_bram_used = fields.Int()
    total_bram_block_power = fields.Number()
    total_bram_interconnect_power = fields.Number()

class BramPortPropertiesOutputSchema(Schema):
    clock_frequency = fields.Int()
    output_signal_rate = fields.Number()
    ram_depth = fields.Int()

class BramOutputSchema(Schema):
    port_a = fields.Nested(BramPortPropertiesOutputSchema)
    port_b = fields.Nested(BramPortPropertiesOutputSchema)
    block_power = fields.Number()
    interconnect_power = fields.Number()
    percentage = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class BramPortPropertiesSchema(Schema):
    clock = fields.Str()
    width = fields.Int()
    write_enable_rate = fields.Number()
    read_enable_rate = fields.Number()
    toggle_rate = fields.Number()

class BramSchema(Schema):
    enable = fields.Bool()
    name = fields.Str()
    type = fields.Enum(BRAM_Type, by_value=True)
    bram_used = fields.Int()
    port_a = fields.Nested(BramPortPropertiesSchema)
    port_b = fields.Nested(BramPortPropertiesSchema)
    output = fields.Nested(BramOutputSchema, data_key="consumption")
