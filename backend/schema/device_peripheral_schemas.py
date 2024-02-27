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

class PeripheralSchema(Schema):
    enable = fields.Bool()
    name = fields.Str()
    # peripheral_type = fields.Enum(PeripheralType)
    usage = fields.Enum(Peripherals_Usage, by_value=True)
