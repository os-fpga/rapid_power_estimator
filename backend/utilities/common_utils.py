#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
def update_attributes(target, props):
    for key, value in props.items():
            if hasattr(target, key):
                setattr(target, key, value)
    return target
