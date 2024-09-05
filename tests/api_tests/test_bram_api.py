import pytest
from flask import Flask
from flask.testing import FlaskClient
from unittest.mock import patch
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import DeviceNotFoundException, BramNotFoundException
from api.bram import bram_api 

@pytest.fixture
def client() -> FlaskClient:
    app = Flask(__name__)
    app.register_blueprint(bram_api)  
    return app.test_client()

# Test for BramsApi GET
@patch('submodule.rs_device_manager.RsDeviceManager.get_instance')
def test_get_brams(mock_get_instance, client):
    mock_device = mock_get_instance.return_value.get_device.return_value
    mock_bram_module = mock_device.get_module.return_value
    mock_bram_module.get_all.return_value = []
    
    response = client.get('/devices/test-device/bram')
    
    assert response.status_code == 200
    assert response.json == []

# Test for BramApi GET
@patch('submodule.rs_device_manager.RsDeviceManager.get_instance')
def test_get_bram(mock_get_instance, client):
    mock_device = mock_get_instance.return_value.get_device.return_value
    mock_bram_module = mock_device.get_module.return_value
    mock_bram_module.get.return_value = {}

    response = client.get('/devices/test-device/bram/0')
    
    assert response.status_code == 200

# Test for BramApi DELETE
@patch('submodule.rs_device_manager.RsDeviceManager.get_instance')
@patch('submodule.rs_project.RsProjectManager.get_instance')
def test_delete_bram(mock_get_instance, mock_project_mgr, client):
    mock_device = mock_get_instance.return_value.get_device.return_value
    mock_bram_module = mock_device.get_module.return_value

    response = client.delete('/devices/test-device/bram/0')
    
    assert response.status_code == 204

# Test for BramConsumptionApi GET
@patch('submodule.rs_device_manager.RsDeviceManager.get_instance')
def test_get_bram_consumption(mock_get_instance, client):
    mock_device = mock_get_instance.return_value.get_device.return_value
    mock_bram_module = mock_device.get_module.return_value
    mock_bram_module.get_resources.return_value = (10, 20, 10, 20)
    mock_bram_module.get_power_consumption.return_value = (0.5, 0.5)

    response = client.get('/devices/test-device/bram/consumption')
    
    assert response.status_code == 200
