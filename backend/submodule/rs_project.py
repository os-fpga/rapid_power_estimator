#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import numpy as np
import math
from typing import Any, Dict, List
from submodule.rs_message import RsMessage
from utilities.common_utils import RsEnum, update_attributes
from dataclasses import dataclass, field

class RsProjectState(RsEnum):
    UNLOADED = 0, 'Unloaded'
    LOADED = 1,  'Loaded'

@dataclass
class RsProject:
    autosave: bool = field(default=False)
    device: str = field(default='')
    filepath: str = field(default='')
    lang: str = field(default='')
    name: str = field(default='')
    notes: str = field(default='')
    version: str = field(default='0.0.1')
    state: RsProjectState = field(default=RsProjectState.UNLOADED)
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
        self.projects: List[RsProject] = [RsProject()]

    def get(self) -> RsProject:
        return self.projects[0]

    def close(self) -> bool:
        self.projects[0] = RsProject()
        return True

    def update(self, data: Dict[str, Any]) -> bool:
        update_attributes(self.projects[0], data, exclude=['filepath', 'version', 'state', 'messages'])
        return True

    def load(self, filepath: str) -> bool:
        pass

    def save(self) -> bool:
        pass
