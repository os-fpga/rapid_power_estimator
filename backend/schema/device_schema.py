#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from marshmallow import Schema, fields

class DeviceSchema(Schema):
    id = fields.Str()
    series = fields.Str()
    logic_density = fields.Str()
    package = fields.Str()
    speedgrade = fields.Str()
    temperature_grade = fields.Str()
    