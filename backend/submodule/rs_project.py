#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import numpy as np
import math
from typing import List
from submodule.rs_message import RsMessage
from utilities.common_utils import RsEnum, update_attributes
from dataclasses import dataclass, field

class RsProjectStatus(RsEnum):
    UNLOADED = 0, 'Unloaded'
    LOADED = 1,  'Loaded'

@dataclass
class RsProject:
    autosave: bool = field(default=False)
    device: str = field(default='')
    filepath: str = field(default='')
    lang: str = field(default='')
    name: str = field(default='')
    version: str = field(default='')
    status: RsProjectStatus = field(default=RsProjectStatus.UNLOADED)
    messages: List[RsMessage] = field(default_factory=list)

class RsProjectManager:
    __instance = None
    def __new__(cls, *args, **kwargs):
        if not cls.__instance:
            cls.__instance = super().__new__(cls, *args, **kwargs)
        return cls.__instance

    @staticmethod
    def get_instance() -> 'RsProjectManager':
        if not RsProjectManager.__instance:
            RsProjectManager()
        return RsProjectManager.__instance

    def __init__(self) -> None:
        self.project = RsProject()

    def get(self) -> RsProject:
        return self.project

    def close(self) -> bool:
        pass

    def update(self) -> bool:
        pass

    def save(self) -> bool:
        pass
