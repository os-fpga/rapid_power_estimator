#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from device.device_xml_parser import parse_device_xml, DeviceList
from submodule.rs_device import RsDevice

class DeviceManager:

    def __init__(self, device_xml):
        self.devices = []
        self.device_list = parse_device_xml(device_xml)
        for res in self.device_list.devices:
            self.devices.append(RsDevice(res))

    def get_device_all(self):
        return self.devices

    def get_device(self, device_id):
        for device in self.devices:
            if device.id == device_id:
                return device
        raise ValueError(f"Device Id '{device_id}' not found")

    def get_device_clocking_all(self, device_id):
        device = self.get_device(device_id)
        return device.get_clocks()

    def add_device_clocking(self, device_id, data):
        device = self.get_device(device_id)
        return device.add_clock(data)

    def get_device_clocking(self, device_id, row_number):
        device = self.get_device(device_id)
        return device.get_clock(row_number)

    def update_device_clocking(self, device_id, row_number, data):
        device = self.get_device(device_id)
        return device.update_clock(row_number, data)

    def delete_device_clocking(self, device_id, row_number):
        device = self.get_device(device_id)
        return device.delete_clock(row_number)
