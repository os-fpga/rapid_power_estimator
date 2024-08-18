#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only

import pytest
import json  
from pathlib import Path
from unittest.mock import MagicMock, patch
from datetime import datetime
from submodule.rs_project import RsProjectManager, RsProject, RsProjectState, ProjectNotLoadedException
from submodule.rs_device_resources import DeviceNotFoundException
from submodule.rs_device_manager import RsDeviceManager

@pytest.fixture
def rs_project_manager():
    return RsProjectManager()

def test_rs_project_initialization(rs_project_manager):
    project = rs_project_manager.get()
    assert isinstance(project, RsProject)
    assert project.state == RsProjectState.NOTLOADED
    assert project.modified is False
    assert project.autosave is False

def test_update_project(rs_project_manager):
    update_data = {
        "name": "New Project",
        "version": "1.0.0",
        "lang": "en",
        "device": "DeviceA",
        "notes": "This is a test project."
    }
    rs_project_manager.update(update_data)
    project = rs_project_manager.get()
    assert project.name == "New Project"
    assert project.version == "0.0.1"  # Expect the default version
    assert project.lang == "en"
    assert project.device == "DeviceA"
    assert project.notes == "This is a test project."
    assert project.modified is True

def test_clear_devices(rs_project_manager):
    mock_device_manager = MagicMock(spec=RsDeviceManager)
    with patch('submodule.rs_device_manager.RsDeviceManager.get_instance', return_value=mock_device_manager):
        rs_project_manager.clear_devices()
        mock_device_manager.clear_all_device_inputs.assert_called_once()

def test_load_devices(rs_project_manager):
    mock_device_manager = MagicMock(spec=RsDeviceManager)
    mock_device = MagicMock()
    mock_device.update_spec = MagicMock()
    mock_device.get_module = MagicMock()
    mock_device_manager.get_device.return_value = mock_device

    with patch('submodule.rs_device_manager.RsDeviceManager.get_instance', return_value=mock_device_manager):
        devices_data = [
            {
                "name": "TestDevice",
                "specification": {},
                "configuration": {
                    "clocking": [],
                    "dsp": [],
                    "fabric_le": [],
                    "bram": [],
                    "io": {"features": [], "items": []},
                    "peripherals": []
                }
            }
        ]
        messages = []
        rs_project_manager.load_devices(devices_data, messages)

        mock_device_manager.get_device.assert_called_once_with("TestDevice")
        mock_device.update_spec.assert_called_once()
        mock_device.get_module.assert_called()

def test_load_devices_device_not_found(rs_project_manager):
    mock_device_manager = MagicMock(spec=RsDeviceManager)
    mock_device_manager.get_device.side_effect = DeviceNotFoundException
    
    mock_message = MagicMock()
    mock_message.message = "Device with given id doesn't exists"
    
    with patch('submodule.rs_device_manager.RsDeviceManager.get_instance', return_value=mock_device_manager):
        with patch('submodule.rs_project.RsMessageManager.get_message', return_value=mock_message):
            devices_data = [
                {
                    "name": "NonExistentDevice",
                    "specification": {},
                    "configuration": {
                        "clocking": [],
                        "dsp": [],
                        "fabric_le": [],
                        "bram": [],
                        "io": {"features": [], "items": []},
                        "peripherals": []
                    }
                }
            ]
            messages = []
            rs_project_manager.load_devices(devices_data, messages)

            # Verify that the correct error message was generated
            assert len(messages) == 1
            assert messages[0].message == "Device with given id doesn't exists"
            mock_device_manager.get_device.assert_called_once_with("NonExistentDevice")

def test_open_project(rs_project_manager, tmp_path):
    test_file = tmp_path / "project.json"
    project_data = {
        "project": {
            "name": "Test Project",
            "version": "1.0.0",
            "lang": "en",
            "device": "DeviceA",
            "notes": "Test project notes",
            "last_edited": datetime.now().isoformat()
        },
        "devices": []
    }

    with open(test_file, "w") as f:
        json.dump(project_data, f)

    with patch('submodule.rs_project.RsProjectSchema.load', return_value=project_data):
        success = rs_project_manager.open(test_file)
        assert success
        project = rs_project_manager.get()
        assert project.name == "Test Project"
        assert project.version == "0.0.1"  # Expect the default version
        assert project.lang == "en"
        assert project.device == "DeviceA"
        assert project.notes == "Test project notes"

def test_save_project_not_loaded(rs_project_manager):
    with pytest.raises(ProjectNotLoadedException):
        rs_project_manager.save()

def test_save_project(rs_project_manager, tmp_path):
    project = rs_project_manager.get()
    project.state = RsProjectState.LOADED
    project.filepath = tmp_path / "project_save.json"

    with patch('submodule.rs_project.RsProjectManager.write_file') as mock_write_file:
        rs_project_manager.save()

        # Ensure the call matches expected arguments
        expected_filepath = str(project.filepath)
        mock_write_file.assert_called_once_with(project, tmp_path / "project_save.json")

def test_close_project(rs_project_manager):
    rs_project_manager.close()
    project = rs_project_manager.get()
    assert project.state == RsProjectState.NOTLOADED
    assert project.modified is False

def test_create_project(rs_project_manager, tmp_path):
    new_project_file = tmp_path / "new_project.json"

    with patch('submodule.rs_project.RsProjectManager.write_file') as mock_write_file:
        rs_project_manager.create(new_project_file)

        # Ensure the call matches expected arguments
        project = rs_project_manager.get()
        mock_write_file.assert_called_once_with(project, tmp_path / "new_project.json")

