#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
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
