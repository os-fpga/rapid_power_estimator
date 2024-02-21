#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from device.device_xml_parser import parse_device_xml, DeviceList
from submodule.rs_device import RsDevice

class RsDeviceManager:

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

    def get_all(self, modtype, device_id):
        return self.get_device(device_id).get_module(modtype).get_all()

    def add(self, modtype, device_id, data):
        module = self.get_device(device_id).get_module(modtype)
        item = module.add(data)
        module.compute_output_power()
        return item

    def get(self, modtype, device_id, row_number):
        return self.get_device(device_id).get_module(modtype).get(row_number)

    def update(self, modtype, device_id, row_number, data):
        module = self.get_device(device_id).get_module(modtype)
        updated_item = module.update(row_number, data)
        module.compute_output_power()
        return updated_item

    def remove(self, modtype, device_id, row_number):
        module = self.get_device(device_id).get_module(modtype)
        removed_item = module.remove(row_number)
        module.compute_output_power()
        return removed_item

    def get_power_consumption(self, modtype, device_id):
        return self.get_device(device_id).get_module(modtype).get_power_consumption()

    def get_resources(self, modtype, device_id):
        return self.get_device(device_id).get_module(modtype).get_resources()
