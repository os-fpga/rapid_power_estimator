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
        return device.clock_module.get_clocks()

    def add_device_clocking(self, device_id, data):
        device = self.get_device(device_id)
        return device.clock_module.add_clock(data)

    def get_device_clocking(self, device_id, row_number):
        device = self.get_device(device_id)
        return device.clock_module.get_clock(row_number)

    def update_device_clocking(self, device_id, row_number, data):
        device = self.get_device(device_id)
        return device.clock_module.update_clock(row_number, data)

    def delete_device_clocking(self, device_id, row_number):
        device = self.get_device(device_id)
        return device.clock_module.delete_clock(row_number)

    def get_device_clocking_power_consumption(self, device_id):
        device = self.get_device(device_id)
        return device.clock_module.compute_clocks_output_power()

    def get_device_clocking_resources(self, device_id):
        device = self.get_device(device_id)
        return device.clock_module.get_clocking_resources()

    def get_device_fabric_le_all(self, device_id):
        device = self.get_device(device_id)
        return device.fabric_le_module.get_fabric_les()

    def get_device_fabric_le(self, device_id, row_number):
        device = self.get_device(device_id)
        return device.fabric_le_module.get_fabric_le(row_number)

    def add_device_fabric_le(self, device_id, data):
        device = self.get_device(device_id)
        return device.fabric_le_module.add_fabric_le(data)

    def update_device_fabric_le(self, device_id, row_number, data):
        device = self.get_device(device_id)
        return device.fabric_le_module.update_fabric_le(row_number, data)

    def delete_device_fabric_le(self, device_id, row_number):
        device = self.get_device(device_id)
        return device.fabric_le_module.delete_fabric_le(row_number)

    def get_device_fabric_le_power_consumption(self, device_id):
        device = self.get_device(device_id)
        return device.fabric_le_module.compute_output_power()

    def get_device_fabric_le_resources(self, device_id):
        device = self.get_device(device_id)
        return device.fabric_le_module.get_fabric_le_resources()
