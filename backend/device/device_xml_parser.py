#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import xml.etree.ElementTree as ET
import sys
from device.device_resource import *

def parse_device_xml(file_path: str) -> DeviceList:
    tree = ET.parse(file_path)
    root = tree.getroot()

    devices = []
    for device_elem in root.findall('device'):

        resources = {res.get('type'): ResourceAttributes(**res.attrib) for res in device_elem.findall('resource')}
        internals = {int.get('type'): InternalAttributes(**int.attrib) for int in device_elem.findall('internal')}
 
        device = Device(
            **device_elem.attrib,
            resources=resources,
            internals=internals
        )
        devices.append(device)

    return DeviceList(devices=devices)

if __name__ == '__main__':
    # get current directory
    current_dir = sys.path[0]
    print(current_dir)
    # go up one level of current dir
    current_dir = current_dir[:current_dir.rfind('/')]
    # current_dir = current_dir[:current_dir.rfind('\\')]

    print("current dir: " + current_dir)
    device_path = current_dir + '/python/etc/device.xml'
    print(device_path)
    devicelist = parse_device_xml(device_path)
    for device in devicelist.devices:
        # debug code to look at the output
        print(device.name)
        print(device.resources['io'].num)


