#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from enum import Enum

class ModuleType(Enum):
    CLOCKING = 0
    FABRIC_LE = 1
    DSP = 2
    BRAM = 3
    IO = 4
    PERIPHERAL_PROCESSING = 5
    REGULATOR = 6

def update_attributes(target, props):
    for key, value in props.items():
            if hasattr(target, key):
                setattr(target, key, value)
    return target
