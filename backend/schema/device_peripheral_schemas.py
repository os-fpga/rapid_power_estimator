#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from marshmallow import Schema, fields
from submodule.peripherals import PeripheralType, Peripherals_Usage

class PeripheralUrlSchema(Schema):
    spi = fields.List(fields.Str())
    jtag = fields.List(fields.Str())
    i2c = fields.List(fields.Str())
    uart = fields.List(fields.Str())
    usb2 = fields.List(fields.Str())
    gige = fields.List(fields.Str())
    gpio = fields.List(fields.Str())
    pwm = fields.List(fields.Str())

class PeripheralConsumptionSchema(Schema):
    total_memory_power = fields.Number()
    total_peripherals_power = fields.Number()
    total_acpu_power = fields.Number()
    total_dma_power = fields.Number()
    total_noc_interconnect_power = fields.Number()
    total_bcpu_power = fields.Number()
    total_soc_io_available = fields.Int()
    total_soc_io_used = fields.Int()

class PeripheralSchema(Schema):
    enable = fields.Bool()
    name = fields.Str()
    # todo
    usage = fields.Enum(Peripherals_Usage, by_value=True)
