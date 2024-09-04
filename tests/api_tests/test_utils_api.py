import pytest
from flask import Flask
from flask.testing import FlaskClient
from api.utils import attrs_api 

@pytest.fixture
def app() -> Flask:
    app = Flask(__name__)
    app.register_blueprint(attrs_api)
    app.config['TESTING'] = True
    return app

@pytest.fixture
def client(app: Flask) -> FlaskClient:
    return app.test_client()

def test_get_attributes(client: FlaskClient):
    response = client.get('/attributes')
    assert response.status_code == 200
    assert isinstance(response.json, list)
    
    for attribute in response.json:
        assert 'id' in attribute
        assert 'options' in attribute
        assert isinstance(attribute['options'], list)
        
        for option in attribute['options']:
            assert 'text' in option
            assert 'id' in option

def test_attribute_ids(client: FlaskClient):
    response = client.get('/attributes')
    assert response.status_code == 200

    expected_ids = [
        # Clock
        "Clock_State", "Source",
        # Fabric LE
        "Glitch_Factor",
        # DSP
        "Pipelining", "DSP_Mode",
        # BRAM
        "BRAM_Type",
        # IO
        "IO_BankType", "IO_Standard", "IO_Direction", "IO_Drive_Strength", "IO_Slew_Rate",
        "IO_differential_termination", "IO_Data_Type", "IO_Synchronization",
        "IO_Pull_up_down",
        # Peripherals
        "Peripherals_Usage", "Qspi_Performance_Mbps", "Jtag_Clock_Frequency",
        "Baud_Rate", "I2c_Speed", "Usb_Speed", "Gige_Speed", "GpioStandard",
        "N22_RISC_V_Clock", "Port_Activity", "A45_Load",
        "Memory_Type"
    ]
    
    attribute_ids = [attribute['id'] for attribute in response.json]
    
    for expected_id in expected_ids:
        assert expected_id in attribute_ids
