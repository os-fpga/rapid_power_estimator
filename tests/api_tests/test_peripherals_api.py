#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import pytest
from marshmallow import ValidationError
from submodule.peripherals import PeripheralType, PeripheralTarget, Peripheral, Jtag_Clock_Frequency, I2c_Speed
from api.peripherals import (
    get_peripheral_schema, get_type, PeripheralSchema, SpiSchema, JtagSchema, InvalidPeripheralTypeException
)

valid_target = list(PeripheralTarget.__members__.values())[0]

# ------------------- Test get_peripheral_schema ------------------- #

def test_get_peripheral_schema_spi():
    schema = get_peripheral_schema(PeripheralType.SPI)
    assert isinstance(schema, SpiSchema)

def test_get_peripheral_schema_jtag():
    schema = get_peripheral_schema(PeripheralType.JTAG)
    assert isinstance(schema, JtagSchema)

def test_get_peripheral_schema_default():
    schema = get_peripheral_schema(PeripheralType.SPI)
    assert isinstance(schema, PeripheralSchema)

# ------------------- Test get_type ------------------- #

def test_get_type_valid():
    periph_type = get_type(PeripheralType.SPI.value)
    assert periph_type == PeripheralType.SPI

def test_get_type_invalid():
    with pytest.raises(InvalidPeripheralTypeException):
        get_type("INVALID")

# ------------------- Test PeripheralSchema Class ------------------- #

def test_peripheral_schema_post_dump_ports():
    data = {'ports': [{'name': 'port1'}, {'name': 'port2'}]}
    schema = PeripheralSchema(expand=False)
    result = schema.post_dump(data)
    assert result['ports'][0]['href'] == 'ep/0'
    assert result['ports'][1]['href'] == 'ep/1'

def test_peripheral_schema_post_dump_no_ports():
    data = {'channels': [{'name': 'channel1'}, {'name': 'channel2'}]}
    schema = PeripheralSchema(expand=False)
    result = schema.post_dump(data)
    assert result['channels'][0]['href'] == 'channel/0'
    assert result['channels'][1]['href'] == 'channel/1'

def test_peripheral_schema_no_expand():
    data = {'name': 'Test Peripheral'}
    schema = PeripheralSchema(expand=False)
    result = schema.post_dump(data)
    assert result == {'name': 'Test Peripheral'}

def test_peripheral_schema_get_schema_spi():
    schema_type = PeripheralSchema.get_schema(PeripheralType.SPI)
    assert schema_type == SpiSchema

def test_peripheral_schema_get_schema_default():
    schema_type = PeripheralSchema.get_schema(PeripheralType.SPI)
    assert schema_type == SpiSchema

# ------------------- Test PeripheralUrlSchema Class ------------------- #

def test_peripheral_url_schema_add_href():
    obj = Peripheral(type=PeripheralType.SPI, name="TestPeripheral", index=1, targets=valid_target)
    schema = PeripheralSchema()
    data = schema.dump(obj)
    assert data['name'] == 'TestPeripheral'

# ------------------- Test Individual Schemas ------------------- #

def test_jtag_schema():
    valid_jtag_value = list(Jtag_Clock_Frequency.__members__.values())[0]

    data = {'enable': True, 'usage': valid_target, 'clock_frequency': valid_jtag_value}
    schema = JtagSchema()
    result = schema.dump(data)
    
    assert result['enable'] is True
    assert result['clock_frequency'] == 0  

def test_i2c_schema():
    valid_i2c_value = list(I2c_Speed.__members__.values())[0]

    data = {'enable': True, 'usage': valid_target, 'clock_frequency': valid_i2c_value}
    schema = PeripheralSchema.get_schema(PeripheralType.I2C)
    result = schema().dump(data)
    
    assert result['clock_frequency'] == 0 

# ------------------- Test Schema Validation Error ------------------- #

def test_peripheral_schema_validation_error():
    data = {'enable': 'not_boolean'}
    schema = SpiSchema()
    with pytest.raises(ValidationError):
        schema.load(data)

