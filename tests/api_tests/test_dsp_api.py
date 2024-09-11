#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import pytest
from api.dsp import dsp_api  

class MockDspModule:
    def get_all(self):
        return [{"name": "DSP1", "enable": True, "number_of_multipliers": 4}]

    def get(self, rownum):
        return {"name": "DSP1", "enable": True, "number_of_multipliers": 4}

    def get_power_consumption(self):
        return (100, 50)

    def get_resources(self):
        return (2, 4)

    def get_all_messages(self):
        return [{"message": "All OK"}]

class MockDevice:
    def get_module(self, module_type):
        return MockDspModule()

class MockRsDeviceManager:
    @staticmethod
    def get_instance():
        return MockRsDeviceManager()

    def get_device(self, device_id):
        return MockDevice()

@pytest.fixture
def client():
    from flask import Flask
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.register_blueprint(dsp_api, url_prefix='/api')
    with app.test_client() as client:
        yield client

# Patch the RsDeviceManager in the test cases to use the mock implementation
@pytest.fixture(autouse=True)
def mock_device_manager():
    from unittest.mock import patch
    with patch('api.dsp.RsDeviceManager', new=MockRsDeviceManager):
        yield

# Test for the GET /devices/<device_id>/dsp endpoint
def test_get_dsps(client):
    response = client.get('/api/devices/device123/dsp')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)

# Test for the GET /devices/<device_id>/dsp/<rownum> endpoint
def test_get_dsp_by_rownum(client):
    response = client.get('/api/devices/device123/dsp/0')
    assert response.status_code == 200
    data = response.get_json()
    assert 'name' in data

# Test for the GET /devices/<device_id>/dsp/consumption endpoint
def test_get_dsp_consumption(client):
    response = client.get('/api/devices/device123/dsp/consumption')
    assert response.status_code == 200
    data = response.get_json()
    assert 'total_dsp_blocks_used' in data
    assert 'total_dsp_block_power' in data
