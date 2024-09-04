import pytest
from unittest.mock import patch, MagicMock
from flask import Flask
from api.device import device_api 
from submodule.rs_device_resources import DeviceNotFoundException  

@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(device_api)
    client = app.test_client()
    yield client

def mock_device_manager(devices=None, device=None):
    mock_device_mgr = MagicMock()
    if devices is not None:
        mock_device_mgr.get_device_all.return_value = devices
    if device is not None:
        mock_device_mgr.get_device.return_value = device
    return mock_device_mgr

def test_get_devices(client):
    devices = [
        {"id": "device_1", "series": "series_1"},
        {"id": "device_2", "series": "series_2"}
    ]
    mock_device_mgr = mock_device_manager(devices=devices)
    
    with patch('api.device.RsDeviceManager.get_instance', return_value=mock_device_mgr):
        response = client.get('/devices')
        assert response.status_code == 200
        assert response.json == devices

def test_get_device_details(client):
    device = {
        "id": "device_1",
        "series": "series_1",
        "logic_density": "low",
        "package": "pkg_1",
        "speedgrade": "sg_1",
        "temperature_grade": "temp_1",
        "specification": {
            "thermal": {"theta_ja": 0.9, "ambient": {"typical": 20, "worsecase": 30}},
            "power": {"budget": 10, "typical_dynamic_scaling": {"fpga_complex": 2, "processing_complex": 3}}
        }
    }
    mock_device_mgr = mock_device_manager(device=device)

    with patch('api.device.RsDeviceManager.get_instance', return_value=mock_device_mgr):
        response = client.get('/devices/device_1')
        assert response.status_code == 200
        assert response.json["id"] == "device_1"
        assert response.json["series"] == "series_1"

def test_get_device_not_found(client):
    mock_device_mgr = MagicMock()
    mock_device_mgr.get_device.side_effect = DeviceNotFoundException

    with patch('api.device.RsDeviceManager.get_instance', return_value=mock_device_mgr):
        response = client.get('/devices/unknown_device')
        assert response.status_code == 400
        assert "Device with given id doesn't exists" in response.json['message']

def test_update_device_spec(client):
    mock_device = MagicMock()
    mock_device.update_spec.return_value = None
    mock_device_mgr = mock_device_manager(device=mock_device)

    with patch('api.device.RsDeviceManager.get_instance', return_value=mock_device_mgr):
        response = client.patch('/devices/device_1', json={
            "specification": {
                "thermal": {"theta_ja": 1.0, "ambient": {"typical": 25, "worsecase": 35}},
                "power": {"budget": 15, "typical_dynamic_scaling": {"fpga_complex": 5, "processing_complex": 6}}
            }
        })
        assert response.status_code == 200

def test_get_device_consumption(client):
    mock_device = MagicMock()
    mock_device.get_power_consumption.return_value = {
        "total_power_temperature": [
            {"type": "core", "power": 10, "temperature": 50},
            {"type": "peripheral", "power": 5, "temperature": 40}
        ],
        "processing_complex": {
            "dynamic": {"components": [{"type": "core", "power": 10, "percentage": 70}], "power": 10, "percentage": 70},
            "static": {"power": 2, "percentage": 30},
            "total_power": 12,
            "total_percentage": 100
        },
        "fpga_complex": {
            "dynamic": {"components": [{"type": "fpga", "power": 8, "percentage": 80}], "power": 8, "percentage": 80},
            "static": {"power": 2, "percentage": 20},
            "total_power": 10,
            "total_percentage": 100
        }
    }
    mock_device_mgr = mock_device_manager(device=mock_device)

    with patch('api.device.RsDeviceManager.get_instance', return_value=mock_device_mgr):
        response = client.get('/devices/device_1/consumption')
        assert response.status_code == 200
        assert len(response.json['total_power_temperature']) == 2
