#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from marshmallow import Schema, fields
from submodule.rs_message import RsMessageType

class MessageSchema(Schema):
    type = fields.Enum(RsMessageType, by_value=True)
    text = fields.Str()

class DeviceSchema(Schema):
    id = fields.Str()
    series = fields.Str()
    logic_density = fields.Str()
    package = fields.Str()
    speedgrade = fields.Str()
    temperature_grade = fields.Str()

class DevicePowerThermalSchema(Schema):
    total_power = fields.Number()
    thermal = fields.Number()

class DeviceConsumptionSchema(Schema):
    typical = fields.Nested(DevicePowerThermalSchema)
    worsecase = fields.Nested(DevicePowerThermalSchema)
