import pytest
from unittest.mock import patch, mock_open, Mock
from datetime import datetime
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import ModuleType
from submodule.rs_project import RsProject, RsProjectState, RsProjectSchema, DeviceNotFoundException, RsProjectManager



def test_singleton_behavior():
    instance1 = RsProjectManager.get_instance()
    instance2 = RsProjectManager.get_instance()
    assert instance1 is instance2, "RsProjectManager should be a singleton."

def test_project_initialization():
    project_manager = RsProjectManager()
    project = project_manager.get()
    assert isinstance(project, RsProject), "Project should be an instance of RsProject."
    assert project.state == RsProjectState.NOTLOADED, "Initial project state should be NOTLOADED."

from unittest.mock import patch, mock_open, Mock

@patch('submodule.rs_project.open', new_callable=mock_open, read_data='{"project": {"name": "Test Project", "version": "0.1", "device": "Test Device"}, "devices": [{"name": "Test Device", "configuration": {"clocking": [], "dsp": [], "fabric_le": [], "bram": [], "io": {"features": [], "items": []}, "peripherals": []}}]}')
@patch('submodule.rs_project.RsProjectSchema.load')
@patch('submodule.rs_project.RsDeviceManager.get_instance')
def test_open_project(mock_device_manager, mock_load, mock_open):
    # Mock the loaded data
    mock_device = Mock()
    mock_device_manager.return_value.get_device.return_value = mock_device
    mock_load.return_value = {
        'project': {
            'name': 'Test Project',
            'version': '0.1',
            'device': 'Test Device',
        },
        'devices': [
            {
                'name': 'Test Device',
                'configuration': {
                    'clocking': [],
                    'dsp': [],
                    'fabric_le': [],
                    'bram': [],
                    'io': {
                        'features': [],
                        'items': []
                    },
                    'peripherals': []
                }
            }
        ]
    }

    project_manager = RsProjectManager()
    result = project_manager.open('test_filepath.json')

    # Verify the open function was called correctly
    mock_open.assert_called_once_with('test_filepath.json', 'r')
    # Verify that the project name was set correctly
    assert project_manager.get().name == 'Test Project'

@patch('submodule.rs_project.open', new_callable=mock_open)
@patch('submodule.rs_project.RsProjectSchema.dump')
@patch('submodule.rs_project.RsDeviceManager.get_instance')
def test_save_project(mock_device_manager, mock_dump, mock_open):
    # Create an instance of RsProjectManager
    project_manager = RsProjectManager()
    project = project_manager.get()
    project.name = 'Test Project'
    project.state = RsProjectState.LOADED
    project.filepath = 'test_filepath.json'  # Ensure the filepath is set

    # Define a mock device with required attributes
    class MockDevice:
        id = 'Test Device'
        specification = {'cpu': 'arm'}

        def get_module(self, module_type):
            class MockModule:
                def get_all(self):
                    return []
                def get_features(self):
                    return []
                def get_peripherals(self):
                    return []
            return MockModule()

    mock_device_manager.return_value.get_device_all.return_value = [MockDevice()]

    # Mock the return value of dump to be a serializable dictionary
    mock_dump.return_value = {
        'project': {
            'name': 'Test Project',
            'version': '0.1',
        },
        'devices': [
            {
                'name': 'Test Device',
                'specification': {'cpu': 'arm'},
                'configuration': {
                    'clocking': [],
                    'dsp': [],
                    'fabric_le': [],
                    'bram': [],
                    'io': {
                        'features': [],
                        'items': []
                    },
                    'peripherals': []
                }
            }
        ]
    }

    # Call the save method
    project_manager.save()

    # Ensure open is called with the correct file path and mode
    mock_open.assert_called_once_with('test_filepath.json', 'w')  # Correct the file path here
    # Ensure dump is called once to generate JSON content
    mock_dump.assert_called_once()

def test_close_project():
    project_manager = RsProjectManager()
    project_manager.close()
    project = project_manager.get()
    assert project.state == RsProjectState.NOTLOADED, "Project state should be reset to NOTLOADED."
    assert project.name == '', "Project name should be reset."

@patch('submodule.rs_project.RsProjectManager.write_file')
def test_create_project(mock_write_file):
    project_manager = RsProjectManager()
    filepath = 'test_filepath.json'
    result = project_manager.create(filepath)

    assert result is True, "Creating a project should return True."
    project = project_manager.get()
    assert project.state == RsProjectState.LOADED, "Project state should be LOADED after creation."
    assert project.filepath == filepath, "Project filepath should be set."
    mock_write_file.assert_called_once_with(project, filepath)
