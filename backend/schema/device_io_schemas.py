#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from marshmallow import Schema, fields
from submodule.io import IO_Direction, IO_Drive_Strength, IO_Slew_Rate, IO_differential_termination, \
    IO_Data_Type, IO_STANDARD, IO_Synchronization, IO_Pull_up_down, IO_Bank_Type

class IoResourcesConsumptionSchema(Schema):
    # todo
    total_block_power = fields.Number()
    total_interconnect_power = fields.Number()

class IoOutputSchema(Schema):
    bank_type = fields.Enum(IO_Bank_Type, by_value=True)
    bank_number = fields.Int()
    vccio_voltage = fields.Number()
    signal_rate = fields.Number()
    block_power = fields.Number()
    interconnect_power = fields.Number()
    percentage = fields.Number()
    message = fields.Str()

class IoSchema(Schema):
    enable = fields.Bool()
    name = fields.Str()
    bus_width = fields.Int()
    direction = fields.Enum(IO_Direction, by_value=True)
    io_standard = fields.Enum(IO_STANDARD, by_value=True)
    drive_strength = fields.Enum(IO_Drive_Strength, by_value=True)
    slew_rate = fields.Enum(IO_Slew_Rate, by_value=True)
    differential_termination = fields.Enum(IO_differential_termination, by_value=True)
    io_data_type = fields.Enum(IO_Data_Type, by_value=True)
    clock = fields.Str()
    toggle_rate = fields.Number()
    duty_cycle = fields.Number()
    synchronization = fields.Enum(IO_Synchronization, by_value=True)
    input_enable_rate = fields.Number()
    output_enable_rate = fields.Number()
    io_pull_up_down = fields.Enum(IO_Pull_up_down, by_value=True)
    output = fields.Nested(IoOutputSchema, data_key="consumption")
