
import pytest
from flask import Flask
from api.io import io_api
from unittest.mock import patch, MagicMock
from submodule.io import IO_Direction, IO_Standard  # Import the Enum classes


# Create a test app and configure it
@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(io_api)
    app.config['TESTING'] = True
    client = app.test_client()
    yield client


# -------------------------------
# Test: GET /devices/<device_id>/io
# -------------------------------
@patch('submodule.rs_device_manager.RsDeviceManager.get_instance')
def test_get_ios_success(mock_device_manager, client):
    # Mock setup
    mock_device = MagicMock()
    mock_io_module = MagicMock()
    mock_device.get_module.return_value = mock_io_module
    mock_io_module.get_all.return_value = [
        {"name": "IO1", "bus_width": 16, "enable": True, "direction": IO_Direction.INPUT}
    ]
    mock_device_manager.return_value.get_device.return_value = mock_device

    # Act
    response = client.get('/devices/123/io')

    # Assert
    assert response.status_code == 200
    assert response.json == [
        {"name": "IO1", "bus_width": 16, "enable": True, "direction": IO_Direction.INPUT.value}
    ]


# -------------------------------
# Test: GET /devices/<device_id>/io/<rownum>
# -------------------------------
@patch('submodule.rs_device_manager.RsDeviceManager.get_instance')
def test_get_io_success(mock_device_manager, client):
    # Mock setup
    mock_device = MagicMock()
    mock_io_module = MagicMock()
    mock_io = {
        "name": "IO1",
        "bus_width": 16,
        "enable": True,
        "direction": IO_Direction.INPUT,
        "io_standard": IO_Standard.LVTTL
    }
    mock_io_module.get.return_value = mock_io
    mock_device.get_module.return_value = mock_io_module
    mock_device_manager.return_value.get_device.return_value = mock_device

    # Act
    response = client.get('/devices/123/io/0')

    # Assert
    assert response.status_code == 200
    assert response.json['name'] == "IO1"
    assert response.json['direction'] == IO_Direction.INPUT.value
    assert response.json['io_standard'] == IO_Standard.LVTTL.value


# -------------------------------
# Test: POST /devices/<device_id>/io
# -------------------------------
@patch('submodule.rs_device_manager.RsDeviceManager.get_instance')
def test_post_io_success(mock_device_manager, client):
    # Mock setup
    mock_device = MagicMock()
    mock_io_module = MagicMock()
    mock_device.get_module.return_value = mock_io_module
    mock_device_manager.return_value.get_device.return_value = mock_device
    mock_io_module.add.return_value = {
        "name": "IO1", "bus_width": 16, "enable": True, "direction": IO_Direction.INPUT
    }

    data = {
        "name": "IO1",
        "bus_width": 16,
        "enable": True,
        "direction": IO_Direction.INPUT.value
    }

    # Act
    response = client.post('/devices/123/io', json=data)

    # Assert
    assert response.status_code == 201
    assert response.json['name'] == "IO1"


# -------------------------------
# Test: PATCH /devices/<device_id>/io/<rownum>
# -------------------------------
@patch('submodule.rs_device_manager.RsDeviceManager.get_instance')
def test_patch_io_success(mock_device_manager, client):
    # Mock setup
    mock_device = MagicMock()
    mock_io_module = MagicMock()
    mock_io = {"name": "IO1", "bus_width": 16, "enable": True, "direction": IO_Direction.INPUT}
    mock_io_module.update.return_value = mock_io
    mock_device.get_module.return_value = mock_io_module
    mock_device_manager.return_value.get_device.return_value = mock_device

    data = {
        "name": "IO1",
        "bus_width": 16,
        "enable": True,
        "direction": IO_Direction.INPUT.value
    }

    # Act
    response = client.patch('/devices/123/io/0', json=data)

    # Assert
    assert response.status_code == 200
    assert response.json['name'] == "IO1"


# -------------------------------
# Test: DELETE /devices/<device_id>/io/<rownum>
# -------------------------------
@patch('submodule.rs_device_manager.RsDeviceManager.get_instance')
def test_delete_io_success(mock_device_manager, client):
    # Mock setup
    mock_device = MagicMock()
    mock_io_module = MagicMock()
    mock_device.get_module.return_value = mock_io_module
    mock_device_manager.return_value.get_device.return_value = mock_device

    # Act
    response = client.delete('/devices/123/io/0')

    # Assert
    assert response.status_code == 204


# -------------------------------
# Test: GET /devices/<device_id>/io/consumption
# -------------------------------
@patch('submodule.rs_device_manager.RsDeviceManager.get_instance')
def test_io_consumption_success(mock_device_manager, client):
    # Mock setup
    mock_device = MagicMock()
    mock_io_module = MagicMock()
    mock_io_module.get_power_consumption.return_value = (1.0, 2.0, 0.5)
    mock_io_module.get_features.return_value = []
    mock_io_module.get_resources.return_value = [[]]
    mock_io_module.get_all_messages.return_value = []
    mock_device.get_module.return_value = mock_io_module
    mock_device_manager.return_value.get_device.return_value = mock_device

    # Act
    response = client.get('/devices/123/io/consumption')

    # Assert
    assert response.status_code == 200
    assert response.json['total_block_power'] == 1.0
    assert response.json['total_interconnect_power'] == 2.0
    assert response.json['total_on_die_termination_power'] == 0.5
    
