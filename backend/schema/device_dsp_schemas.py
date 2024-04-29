#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from marshmallow import Schema, fields
from submodule.dsp import DSP_Mode, Pipelining
from .device_schemas import MessageSchema

class DspResourcesConsumptionSchema(Schema):
    total_dsp_blocks_available = fields.Int()
    total_dsp_blocks_used = fields.Int()
    total_dsp_block_power = fields.Number()
    total_dsp_interconnect_power = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class DspOutputSchema(Schema):
    dsp_blocks_used = fields.Number()
    clock_frequency = fields.Int()
    output_signal_rate = fields.Number()
    block_power = fields.Number()
    interconnect_power = fields.Number()
    percentage = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class DspSchema(Schema):
    name = fields.Str()
    enable = fields.Bool()
    number_of_multipliers = fields.Int()
    dsp_mode = fields.Enum(DSP_Mode, by_value=True)
    a_input_width = fields.Int()
    b_input_width = fields.Int()
    clock = fields.Str()
    pipelining = fields.Enum(Pipelining, by_value=True)
    toggle_rate = fields.Number()
    output = fields.Nested(DspOutputSchema, data_key="consumption")
