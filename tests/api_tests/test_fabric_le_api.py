import pytest
from unittest.mock import MagicMock, patch
from flask import Flask, request
from backend.api.fabric_le import Fabric_LesApi, Fabric_LeApi, Fabric_LeConsumptionApi
from backend.api.errors import DeviceNotExistsError, InternalServerError, FabricLeNotExistsError, SchemaValidationError

# Initialize Flask app for request context
app = Flask(__name__)

# Testing the GET method of Fabric_LesApi
@patch('backend.api.fabric_le.RsDeviceManager.get_instance')
def test_get_fabric_logic_elements(mock_rs_manager):
    # Mocking the device manager and device
    mock_device_manager = MagicMock()
    mock_rs_manager.return_value = mock_device_manager

    mock_device = MagicMock()
    mock_device_manager.get_device.return_value = mock_device

    mock_fle_module = MagicMock()
    mock_device.get_module.return_value = mock_fle_module
    mock_fle_module.get_all.return_value = [{
        "enable": True,
        "name": "LE1",
        "lut6": 100,
        "flip_flop": 50,
        "clock": "100MHz",
        "toggle_rate": 0.1,
        "glitch_factor": 1,
        "clock_enable_rate": 0.8
    }]

    schema_mock = patch('backend.api.fabric_le.FabricLogicElementSchema')
    schema_mock_instance = schema_mock.start()
    schema_mock_instance().dump.return_value = [{
        "enable": True,
        "name": "LE1",
        "lut6": 100,
        "flip_flop": 50,
        "clock": "100MHz",
        "toggle_rate": 0.1
    }]

    # Creating an instance of the class
    api_instance = Fabric_LesApi()

    # Calling the get method
    response = api_instance.get(device_id="1234")

    # Assert the correct behavior
    assert response == schema_mock_instance().dump.return_value
    schema_mock.stop()

# Testing the POST method of Fabric_LesApi with request context
@patch('backend.api.fabric_le.RsDeviceManager.get_instance')
@patch('backend.api.fabric_le.FabricLogicElementSchema')
def test_post_fabric_logic_element(mock_schema, mock_rs_manager):
    mock_device_manager = MagicMock()
    mock_rs_manager.return_value = mock_device_manager

    mock_device = MagicMock()
    mock_device_manager.get_device.return_value = mock_device

    mock_fle_module = MagicMock()
    mock_device.get_module.return_value = mock_fle_module

    # Mocking schema load and dump methods
    mock_schema_instance = mock_schema.return_value
    mock_schema_instance.load.return_value = {
        "enable": True,
        "name": "LE2",
        "lut6": 200,
        "flip_flop": 100,
        "clock": "200MHz"
    }
    mock_fle_module.add.return_value = mock_schema_instance.load.return_value
    mock_schema_instance.dump.return_value = mock_schema_instance.load.return_value

    # Mocking request data
    mock_request_data = {
        "enable": True,
        "name": "LE2",
        "lut6": 200,
        "flip_flop": 100,
        "clock": "200MHz"
    }

    # Manually creating a request context
    with app.test_request_context(json=mock_request_data):
        # Creating an instance of the class
        api_instance = Fabric_LesApi()

        # Calling the post method
        response, status_code = api_instance.post(device_id="1234")

        # Assert the correct behavior
        assert status_code == 201
        assert response == mock_schema_instance.dump.return_value


# Testing PATCH method of Fabric_LeApi with request context
@patch('backend.api.fabric_le.RsDeviceManager.get_instance')
@patch('backend.api.fabric_le.FabricLogicElementSchema')
def test_patch_fabric_logic_element(mock_schema, mock_rs_manager):
    mock_device_manager = MagicMock()
    mock_rs_manager.return_value = mock_device_manager

    mock_device = MagicMock()
    mock_device_manager.get_device.return_value = mock_device

    mock_fle_module = MagicMock()
    mock_device.get_module.return_value = mock_fle_module

    mock_schema_instance = mock_schema.return_value
    mock_schema_instance.load.return_value = {
        "enable": False,
        "name": "LE3_updated",
        "lut6": 180,
        "flip_flop": 90,
        "clock": "180MHz"
    }
    mock_fle_module.update.return_value = mock_schema_instance.load.return_value
    mock_schema_instance.dump.return_value = mock_schema_instance.load.return_value

    # Mocking request data
    mock_request_data = {
        "enable": False,
        "name": "LE3_updated",
        "lut6": 180,
        "flip_flop": 90,
        "clock": "180MHz"
    }

    # Manually creating a request context
    with app.test_request_context(json=mock_request_data):
        # Creating an instance of the class
        api_instance = Fabric_LeApi()

        # Calling the patch method
        response, status_code = api_instance.patch(device_id="1234", rownum=3)

        # Assert the correct behavior
        assert status_code == 200
        assert response == mock_schema_instance.dump.return_value


# Testing DELETE method of Fabric_LeApi
@patch('backend.api.fabric_le.RsDeviceManager.get_instance')
def test_delete_fabric_logic_element(mock_rs_manager):
    mock_device_manager = MagicMock()
    mock_rs_manager.return_value = mock_device_manager

    mock_device = MagicMock()
    mock_device_manager.get_device.return_value = mock_device

    mock_fle_module = MagicMock()
    mock_device.get_module.return_value = mock_fle_module

    # Creating an instance of the class
    api_instance = Fabric_LeApi()

    # Calling the delete method
    response, status_code = api_instance.delete(device_id="1234", rownum=3)

    # Assert the correct behavior
    assert status_code == 204
    assert response == ''


# Testing GET method of Fabric_LeConsumptionApi
@patch('backend.api.fabric_le.RsDeviceManager.get_instance')
@patch('backend.api.fabric_le.FabricLogicElementResourcesConsumptionSchema')
def test_get_fabric_le_consumption(mock_schema, mock_rs_manager):
    mock_device_manager = MagicMock()
    mock_rs_manager.return_value = mock_device_manager

    mock_device = MagicMock()
    mock_device_manager.get_device.return_value = mock_device

    mock_fle_module = MagicMock()
    mock_device.get_module.return_value = mock_fle_module
    mock_fle_module.get_power_consumption.return_value = (100, 50)
    mock_fle_module.get_resources.return_value = (80, 100, 50, 75)
    mock_fle_module.get_all_messages.return_value = []

    mock_schema_instance = mock_schema.return_value
    mock_schema_instance.dump.return_value = {
        'total_lut6_available': 100,
        'total_lut6_used': 80,
        'total_flip_flop_available': 100,
        'total_flip_flop_used': 50,
        'total_block_power': 100,
        'total_interconnect_power': 50,
        'messages': []
    }

    # Creating an instance of the class
    api_instance = Fabric_LeConsumptionApi()

    # Calling the get method
    response = api_instance.get(device_id="1234")

    # Assert the correct behavior
    assert response == mock_schema_instance.dump.return_value
