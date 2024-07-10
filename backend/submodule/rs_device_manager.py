#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from typing import List
from device.device_xml_parser import parse_device_xml, DeviceList
from .rs_device_resources import ModuleType, DeviceNotFoundException
from .rs_device import RsDevice

class RsDeviceManager:
    __instance = None
    def __new__(cls, *args, **kwargs):
        if not cls.__instance:
            cls.__instance = super().__new__(cls, *args, **kwargs)
        return cls.__instance

    def __init__(self) -> None:
        self.devices = []

    @staticmethod
    def get_instance() -> 'RsDeviceManager':
        if not RsDeviceManager.__instance:
            RsDeviceManager()
        return RsDeviceManager.__instance

    def load_xml(self, device_xml : str) -> None:
        self.device_list = parse_device_xml(device_xml)
        for res in self.device_list.devices:
            self.devices.append(RsDevice(res))

    def get_device_all(self) -> List[RsDevice]:
        return self.devices

    def get_device(self, device_id : str) -> RsDevice:
        devices = [device for device in self.devices if device.id == device_id]
        if devices:
            return devices[0]
        raise DeviceNotFoundException
