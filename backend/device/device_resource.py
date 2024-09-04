#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class ResourceAttributes:
    type: str = None
    num: int = None
    label: str = None

@dataclass
class InternalAttributes:
    type: str = None
    name: str = None
    file: str = None
    num: str = None

@dataclass
class Device:
    name: str
    series: str
    family: str
    package: str
    pin_count: str
    speedgrade: str
    core_voltage: str
    filepath: str
    resources: Dict[str, ResourceAttributes]
    internals: Dict[str, InternalAttributes]

@dataclass
class DeviceList:
    devices: List[Device]


