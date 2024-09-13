#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import pytest
from unittest.mock import MagicMock
from flask import Flask
from flask_restful import Api
from submodule.rs_device_manager import RsDeviceManager, DeviceNotFoundException
from submodule.rs_device_resources import ClockNotFoundException
from api.clock import ClocksApi, ClockApi, ClockConsumptionApi
from marshmallow import ValidationError

# Setting up Flask test application and the Api instance
@pytest.fixture
def app():
    app = Flask(__name__)
    api = Api(app)
    # Register the routes for clock APIs
    api.add_resource(ClocksApi, '/devices/<string:device_id>/clocking')
    api.add_resource(ClockApi, '/devices/<string:device_id>/clocking/<int:rownum>')
    api.add_resource(ClockConsumptionApi, '/devices/<string:device_id>/clocking/consumption')
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def mock_device_manager(mocker):
    mock_manager = MagicMock(spec=RsDeviceManager)
    mocker.patch('submodule.rs_device_manager.RsDeviceManager.get_instance', return_value=mock_manager)
    return mock_manager

# Test ClocksApi GET
def test_clocksapi_get(client, mock_device_manager):
    mock_device = MagicMock()
    mock_clock_module = MagicMock()
    mock_clock_module.get_all.return_value = []
    mock_device.get_module.return_value = mock_clock_module
    mock_device_manager.get_device.return_value = mock_device
    
    response = client.get('/devices/device123/clocking')
    assert response.status_code == 200
    assert response.json == []

# Test ClocksApi GET with DeviceNotFoundException
def test_clocksapi_get_device_not_found(client, mock_device_manager):
    mock_device_manager.get_device.side_effect = DeviceNotFoundException
    
    response = client.get('/devices/device123/clocking')
    assert response.status_code == 500  

# Test ClocksApi POST (create new clock)
def test_clocksapi_post(client, mock_device_manager, mocker):
    mock_device = MagicMock()
    mock_clock_module = MagicMock()
    mock_device.get_module.return_value = mock_clock_module
    mock_device_manager.get_device.return_value = mock_device

    # Mocking ClockSchema from the correct import path
    mock_clock_schema = mocker.patch('api.clock.ClockSchema.load')  
    mock_clock_schema.return_value = {}
    mock_clock_module.add.return_value = {}

    response = client.post('/devices/device123/clocking', json={})
    assert response.status_code == 201

# Test ClockApi GET
def test_clockapi_get(client, mock_device_manager):
    mock_device = MagicMock()
    mock_clock_module = MagicMock()
    mock_clock_module.get.return_value = {}
    mock_device.get_module.return_value = mock_clock_module
    mock_device_manager.get_device.return_value = mock_device

    response = client.get('/devices/device123/clocking/1') 
    assert response.status_code == 200
    assert response.json == {}

# Test ClockConsumptionApi GET
def test_clock_consumption_get(client, mock_device_manager):
    mock_device = MagicMock()
    mock_clock_module = MagicMock()
    mock_clock_module.get_power_consumption.return_value = [100, 50, 20]
    mock_clock_module.get_resources.return_value = [10, 5, 2, 1]
    mock_clock_module.get_all_messages.return_value = []
    mock_device.get_module.return_value = mock_clock_module
    mock_device_manager.get_device.return_value = mock_device

    response = client.get('/devices/device123/clocking/consumption')
    assert response.status_code == 200
    assert response.json == {
        'total_clocks_available': 10,
        'total_clocks_used': 2,
        'total_plls_available': 5,
        'total_plls_used': 1,
        'total_clock_block_power': 100,
        'total_clock_interconnect_power': 50,
        'total_pll_power': 20,
        'messages': []
    }

# Test ClockApi GET with ClockNotFoundException 
def test_clockapi_get_clock_not_found(client, mock_device_manager):
    mock_device = MagicMock()
    mock_clock_module = MagicMock()
    mock_clock_module.get.side_effect = ClockNotFoundException
    mock_device.get_module.return_value = mock_clock_module
    mock_device_manager.get_device.return_value = mock_device

    response = client.get('/devices/device123/clocking/1')
    assert response.status_code == 500  
