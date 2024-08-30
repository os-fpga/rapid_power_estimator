#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from enum import Enum

class RsCustomException(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class RsEnum(Enum):
    def __init__(self, value, description = '(empty)'):
        self._value_ = value
        self.description = description

    def __new__(cls, value, description = '(empty)'):
        member = object.__new__(cls)
        member._value_ = value
        member.description = description
        return member

def update_attributes(target, props, *, exclude = ['ports', 'output']):
    for key, value in props.items():
        if key not in exclude:
            if hasattr(target, key):
                if type(value) is dict:
                    update_attributes(getattr(target, key), value)
                else:
                    setattr(target, key, value)
    return target

def get_enum_by_value(enum_class, value):
    for enum_member in enum_class:
        if enum_member.value == value:
            return enum_member
    return None
