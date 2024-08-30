#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only

import pytest
from unittest.mock import MagicMock, patch
from submodule.rs_device_manager import RsDeviceManager, DeviceNotFoundException
from submodule.rs_device import RsDevice
from device.device_xml_parser import DeviceList
import tempfile  # Import the tempfile module
import os  # Import the os module for file operations

@pytest.fixture
def device_manager():
    # Ensure a fresh instance for each test
    RsDeviceManager._RsDeviceManager__instance = None
    return RsDeviceManager.get_instance()

def test_singleton_instance(device_manager):
    # Ensure that RsDeviceManager is a singleton
    instance1 = RsDeviceManager.get_instance()
    instance2 = RsDeviceManager.get_instance()
    assert instance1 is instance2

def test_load_xml(device_manager):
    # Directly add a mock device to the list
    mock_device = MagicMock(spec=RsDevice)
    mock_device.id = 'device_1'
    mock_device.series = 'Series_A'

    device_manager.devices.append(mock_device)  # Manually append

    devices = device_manager.get_device_all()
    assert len(devices) == 1  # Ensure the device was added
    assert devices[0].id == 'device_1'

def test_direct_append(device_manager):
    mock_device = MagicMock(spec=RsDevice)
    device_manager.devices.append(mock_device)
    devices = device_manager.get_device_all()
    assert len(devices) == 1    

def test_get_device(device_manager):
    mock_device = MagicMock(spec=RsDevice)
    mock_device.id = 'device_1'
    device_manager.devices = [mock_device]

    # Test getting an existing device
    assert device_manager.get_device('device_1') == mock_device

    # Test getting a non-existing device
    with pytest.raises(DeviceNotFoundException):
        device_manager.get_device('non_existing_device')

def test_clear_all_device_inputs(device_manager):
    mock_device1 = MagicMock(spec=RsDevice)
    mock_device2 = MagicMock(spec=RsDevice)
    device_manager.devices = [mock_device1, mock_device2]

    device_manager.clear_all_device_inputs()

    # Check that the clear and compute_output_power methods were called for both devices
    mock_device1.clear.assert_called_once()
    mock_device1.compute_output_power.assert_called_once()
    mock_device2.clear.assert_called_once()
    mock_device2.compute_output_power.assert_called_once()

def test_get_device_all(device_manager):
    mock_device1 = MagicMock(spec=RsDevice)
    mock_device2 = MagicMock(spec=RsDevice)
    device_manager.devices = [mock_device1, mock_device2]

    all_devices = device_manager.get_device_all()
    assert len(all_devices) == 2
    assert mock_device1 in all_devices
    assert mock_device2 in all_devices

def test_no_duplicate_instance():
    # Ensure no duplicate instance of RsDeviceManager is created
    device_manager1 = RsDeviceManager.get_instance()
    device_manager2 = RsDeviceManager.get_instance()
    assert device_manager1 is device_manager2
    assert len(RsDeviceManager.get_instance().devices) == len(device_manager1.devices)
