import pytest
import os
import sys
from unittest import mock
from flask import Flask
from submodule.rs_device_manager import RsDeviceManager
from backend.restapi_server import main 
from api.device import device_api
from api.clock import clock_api
from api.dsp import dsp_api
from api.fabric_le import fabric_le_api
from api.bram import bram_api
from api.io import io_api
from api.peripherals import peripherals_api
from api.utils import attrs_api
from api.project import project_api

# Mock RsDeviceManager
@pytest.fixture
def mock_rs_device_manager():
    with mock.patch.object(RsDeviceManager, 'get_instance', return_value=mock.MagicMock()) as mock_manager:
        yield mock_manager

# Mock Flask app
@pytest.fixture
def client():
    app = Flask(__name__)
    app.testing = True
    with app.test_client() as client:
        yield client

# Test argument parsing
def test_argument_parsing():
    test_args = ["program", "device.xml", "--port", "5001", "--debug"]
    with mock.patch.object(sys, 'argv', test_args):
        from argparse import ArgumentParser
        parser = ArgumentParser(description='Rapid Power Estimator Rest API Server command-line arguments.')
        parser.add_argument('device_file', type=str, help='Path to the input device xml file')
        parser.add_argument('--port', type=int, default=5000, help='Specify TCP Port to use for REST server')
        parser.add_argument('--debug', default=False, action='store_true', help='Enable/Disable debug mode')
        args = parser.parse_args()
        assert args.device_file == "device.xml"
        assert args.port == 5001
        assert args.debug is True

# Test for file existence check
def test_device_file_exists(mock_rs_device_manager):
    test_args = ["program", "device.xml"]
    with mock.patch.object(sys, 'argv', test_args):
        with mock.patch('os.path.exists', return_value=True):
            mock_rs_device_manager.return_value.load_xml = mock.MagicMock()
            with mock.patch('flask.Flask.run') as mock_flask_run:
                main()
                mock_rs_device_manager.return_value.load_xml.assert_called_with('device.xml')
                mock_flask_run.assert_called()

# Test for file not existing
def test_device_file_not_exists():
    test_args = ["program", "device.xml"]
    with mock.patch.object(sys, 'argv', test_args):
        with mock.patch('os.path.exists', return_value=False):
            with pytest.raises(SystemExit):
                main()

# Test for Flask app initialization
def test_flask_app_initialization(client):
    response = client.get('/')
    assert response.status_code == 404  
