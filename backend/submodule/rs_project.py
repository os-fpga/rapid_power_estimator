#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from marshmallow import Schema, fields
import numpy as np
import json
from typing import Any, Dict, List
from submodule.rs_device_resources import ProjectNotLoadedException
from submodule.rs_message import RsMessage
from utilities.common_utils import RsEnum, update_attributes
from dataclasses import dataclass, field

class RsProjectState(RsEnum):
    NOTLOADED = 0, 'Not Loaded'
    LOADED = 1,  'Loaded'

class RsProjectAttributesSchema(Schema):
    autosave = fields.Bool()
    device = fields.Str()
    lang = fields.Str()
    name = fields.Str()
    notes = fields.Str()

class RsProjectDeviceSchema(Schema):
    pass

class RsProjectSchema(Schema):
    project = fields.Nested(RsProjectAttributesSchema)
    devices = fields.Nested(RsProjectDeviceSchema, many=True)

@dataclass
class RsProject:
    autosave: bool = field(default=False)
    device: str = field(default='')
    filepath: str = field(default='')
    lang: str = field(default='')
    name: str = field(default='')
    notes: str = field(default='')
    version: str = field(default='0.0.1')
    state: RsProjectState = field(default=RsProjectState.NOTLOADED)
    modified: bool = field(default=False)
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

    def update(self, data: Dict[str, Any]) -> bool:
        update_attributes(self.projects[0], data, exclude=['filepath', 'version', 'state', 'modified', 'messages'])
        self.projects[0].modified = True
        return True

    def load(self, filepath: str) -> bool:
        pass

    def save(self) -> bool:
        if self.projects[0].state == RsProjectState.LOADED:
            with open(self.projects[0].filepath, 'w') as fd:
                json.dump(RsProjectSchema().dump({ 'project': self.projects[0] }), fd, indent=4)
            self.projects[0].modified = False
        else:
            raise ProjectNotLoadedException
        return True

    def close(self) -> bool:
        self.projects[0].state = RsProjectState.NOTLOADED
        self.projects[0].filepath = ""
        return True

    def reset(self) -> bool:
        if self.projects[0].state == RsProjectState.LOADED:
            self.projects[0] = RsProject(state=self.projects[0].state, filepath=self.projects[0].filepath, modified=True)
        else:
            self.projects[0] = RsProject()
        return True

    def create(self, filepath: str) -> bool:
        with open(filepath, 'w') as fd:
            json.dump(RsProjectSchema().dump({ 'project': self.projects[0] }), fd, indent=4)
        self.projects[0].state = RsProjectState.LOADED
        self.projects[0].filepath = filepath
        self.projects[0].modified = False
        return True
