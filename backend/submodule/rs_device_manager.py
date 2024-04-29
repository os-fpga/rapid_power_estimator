#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from device.device_xml_parser import parse_device_xml, DeviceList
from .rs_device_resources import ModuleType
from .rs_device import RsDevice

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
        item = self.get_device(device_id).get_module(modtype).add(data)
        self.get_device(device_id).compute_output_power()
        return item

    def get(self, modtype, device_id, row_number):
        return self.get_device(device_id).get_module(modtype).get(row_number)

    def update(self, modtype, device_id, row_number, data):
        item = self.get_device(device_id).get_module(modtype).update(row_number, data)
        self.get_device(device_id).compute_output_power()
        return item

    def remove(self, modtype, device_id, row_number):
        item = self.get_device(device_id).get_module(modtype).remove(row_number)
        self.get_device(device_id).compute_output_power()
        return item

    def get_power_consumption(self, modtype, device_id):
        return self.get_device(device_id).get_module(modtype).get_power_consumption()

    def get_resources(self, modtype, device_id):
        return self.get_device(device_id).get_module(modtype).get_resources()

    def get_all_messages(self, modtype, device_id):
        return self.get_device(device_id).get_module(modtype).get_all_messages()

    def get_peripheral(self, device_id, peripheral_type, row_number):
        return self.get_device(device_id).get_module(ModuleType.SOC_PERIPHERALS).get_peripheral(peripheral_type, row_number)

    def update_peripheral(self, device_id, peripheral_type, row_number, data):
        peripheral = self.get_device(device_id).get_module(ModuleType.SOC_PERIPHERALS).update_peripheral(peripheral_type, row_number, data)
        self.get_device(device_id).compute_output_power()
        return peripheral

    def get_endpoint(self, device_id, peripheral_type, row_number, endpoint_idx):
        module = self.get_device(device_id).get_module(ModuleType.SOC_PERIPHERALS)
        return module.get_endpoint(peripheral_type, row_number, endpoint_idx)

    def update_endpoint(self, device_id, peripheral_type, row_number, endpoint_idx, data):
        ep = self.get_device(device_id).get_module(ModuleType.SOC_PERIPHERALS).update_endpoint(peripheral_type, row_number, endpoint_idx, data)
        self.get_device(device_id).compute_output_power()
        return ep
