#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from datetime import datetime
from marshmallow import Schema, fields
import numpy as np
import json
from typing import Any, Dict, List
from api.clock import ClockSchema
from api.dsp import DspSchema
from api.fabric_le import FabricLogicElementSchema
from api.bram import BramSchema
from api.io import IoSchema
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import ModuleType, ProjectNotLoadedException
from submodule.rs_message import RsMessage
from utilities.common_utils import RsEnum, update_attributes
from dataclasses import dataclass, field

class RsProjectState(RsEnum):
    NOTLOADED = 0, 'Not Loaded'
    LOADED = 1,  'Loaded'

class RsProjectAttributesSchema(Schema):
    device = fields.Str()
    lang = fields.Str()
    name = fields.Str()
    notes = fields.Str()
    version = fields.Str()
    last_edited = fields.DateTime()

class RsDeviceConfig(Schema):
    clocking = fields.Nested(ClockSchema, many=True, exclude=['output'])
    dsp = fields.Nested(DspSchema, many=True, exclude=['output'])
    fabric_le = fields.Nested(FabricLogicElementSchema, many=True, exclude=['output'])
    bram = fields.Nested(BramSchema, many=True, exclude=['output'])
    io = fields.Nested(IoSchema, many=True, exclude=['output'])

class RsProjectDeviceSchema(Schema):
    name = fields.Str()
    configuration = fields.Nested(RsDeviceConfig)

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
    last_edited: datetime = field(default=None)
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

    def get_excluded_fields(self) -> List[str]:
        return ['filepath', 'version', 'state', 'modified', 'messages', 'autosave']

    def __init__(self) -> None:
        self.projects: List[RsProject] = [RsProject()]

    def get(self) -> RsProject:
        return self.projects[0]

    def update(self, data: Dict[str, Any]) -> bool:
        update_attributes(self.projects[0], data, exclude=self.get_excluded_fields())
        self.projects[0].modified = True
        return True

    def clear_devices(self) -> None:
        # clear all devices inputs
        devmgr = RsDeviceManager.get_instance()
        devmgr.clear_all_device_inputs()

    def load(self, filepath: str) -> bool:
        with open(filepath, 'r') as fd:
            data = RsProjectSchema().load(json.load(fd))
            self.clear_devices()
            update_attributes(self.projects[0], data['project'], exclude=self.get_excluded_fields())
        self.projects[0].state = RsProjectState.LOADED
        self.projects[0].filepath = filepath
        self.projects[0].modified = False
        return True

    def write_file(self, project: RsProject, filepath: str) -> None:
        with open(filepath, 'w') as fd:
            # collect inputs from all devices
            devices = []
            for device in RsDeviceManager.get_instance().get_device_all():
                data = {
                    'name': device.id,
                    'configuration': {
                        'clocking': device.get_module(ModuleType.CLOCKING).get_all(),
                        'dsp': device.get_module(ModuleType.DSP).get_all(),
                        'fabric_le': device.get_module(ModuleType.FABRIC_LE).get_all(),
                        'bram': device.get_module(ModuleType.BRAM).get_all(),
                        'io': device.get_module(ModuleType.IO).get_all(),
                        'peripherals': []
                    }
                }
                devices.append(data)
            json.dump(RsProjectSchema().dump({ 'project': project, 'devices': devices }), fd, indent=2)

    def save(self) -> bool:
        if self.projects[0].state == RsProjectState.LOADED:
            self.projects[0].last_edited = datetime.now()
            self.write_file(self.projects[0], self.projects[0].filepath)
            self.projects[0].modified = False
        else:
            raise ProjectNotLoadedException
        return True

    def close(self) -> bool:
        self.projects[0] = RsProject()
        self.clear_devices()
        return True

    def create(self, filepath: str) -> bool:
        self.projects[0].last_edited = datetime.now()
        self.write_file(self.projects[0], filepath)
        self.projects[0].state = RsProjectState.LOADED
        self.projects[0].filepath = filepath
        self.projects[0].modified = False
        return True
