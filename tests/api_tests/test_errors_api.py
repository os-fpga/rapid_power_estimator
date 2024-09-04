import pytest
from api.errors import (
    InternalServerError, DeviceNotExistsError, ClockNotExistsError, SchemaValidationError,
    ClockDescriptionPortValidationError, ClockMaxCountReachedError, DspNotExistsError,
    FabricLeNotExistsError, FabricLeDescriptionAlreadyExistsError, BramNotExistsError,
    IONotExistsError, IOFeatureNotExistsError, IOFeatureTypeMismatchError,
    IOFeatureOdtBankNotExistsError, PeripheralNotExistsError, InvalidPeripheralTypeError,
    PeripheralEndpointNotExistsError, PeripheralChannelNotExistsError,
    CreateProjectPermissionError, ProjectNotLoadedError, ProjectFileNotFoundError, errors
)

def test_internal_server_error():
    with pytest.raises(InternalServerError):
        raise InternalServerError()

def test_device_not_exists_error():
    with pytest.raises(DeviceNotExistsError):
        raise DeviceNotExistsError()

def test_clock_not_exists_error():
    with pytest.raises(ClockNotExistsError):
        raise ClockNotExistsError()

def test_schema_validation_error():
    with pytest.raises(SchemaValidationError):
        raise SchemaValidationError()

def test_clock_description_port_validation_error():
    with pytest.raises(ClockDescriptionPortValidationError):
        raise ClockDescriptionPortValidationError()

def test_clock_max_count_reached_error():
    with pytest.raises(ClockMaxCountReachedError):
        raise ClockMaxCountReachedError()

def test_dsp_not_exists_error():
    with pytest.raises(DspNotExistsError):
        raise DspNotExistsError()

def test_fabric_le_not_exists_error():
    with pytest.raises(FabricLeNotExistsError):
        raise FabricLeNotExistsError()

def test_fabric_le_description_already_exists_error():
    with pytest.raises(FabricLeDescriptionAlreadyExistsError):
        raise FabricLeDescriptionAlreadyExistsError()

def test_bram_not_exists_error():
    with pytest.raises(BramNotExistsError):
        raise BramNotExistsError()

def test_io_not_exists_error():
    with pytest.raises(IONotExistsError):
        raise IONotExistsError()

def test_io_feature_not_exists_error():
    with pytest.raises(IOFeatureNotExistsError):
        raise IOFeatureNotExistsError()

def test_io_feature_type_mismatch_error():
    with pytest.raises(IOFeatureTypeMismatchError):
        raise IOFeatureTypeMismatchError()

def test_io_feature_odt_bank_not_exists_error():
    with pytest.raises(IOFeatureOdtBankNotExistsError):
        raise IOFeatureOdtBankNotExistsError()

def test_peripheral_not_exists_error():
    with pytest.raises(PeripheralNotExistsError):
        raise PeripheralNotExistsError()

def test_invalid_peripheral_type_error():
    with pytest.raises(InvalidPeripheralTypeError):
        raise InvalidPeripheralTypeError()

def test_peripheral_endpoint_not_exists_error():
    with pytest.raises(PeripheralEndpointNotExistsError):
        raise PeripheralEndpointNotExistsError()

def test_peripheral_channel_not_exists_error():
    with pytest.raises(PeripheralChannelNotExistsError):
        raise PeripheralChannelNotExistsError()

def test_create_project_permission_error():
    with pytest.raises(CreateProjectPermissionError):
        raise CreateProjectPermissionError()

def test_project_not_loaded_error():
    with pytest.raises(ProjectNotLoadedError):
        raise ProjectNotLoadedError()

def test_project_file_not_found_error():
    with pytest.raises(ProjectFileNotFoundError):
        raise ProjectFileNotFoundError()

def test_errors_dictionary():
    assert errors["DeviceNotExistsError"]["message"] == "Device with given id doesn't exists"
    assert errors["ClockNotExistsError"]["status"] == 400
    assert errors["InternalServerError"]["message"] == "Something went wrong"
    assert errors["SchemaValidationError"]["status"] == 403
    assert errors["ClockDescriptionPortValidationError"]["message"] == "Clock description or port already exists in the list of clocks"
    assert errors["ClockMaxCountReachedError"]["status"] == 403
    assert errors["DspNotExistsError"]["message"] == "Dsp with given index doesn't exists"
    assert errors["FabricLeNotExistsError"]["message"] == "Fabric logic element with given index doesn't exists"
    assert errors["FabricLeDescriptionAlreadyExistsError"]["message"] == "Fabric logic element with same description already exists"
    assert errors["BramNotExistsError"]["message"] == "Block RAM with given index doesn't exists"
    assert errors["IONotExistsError"]["message"] == "IO with given index doesn't exists"
    assert errors["IOFeatureNotExistsError"]["message"] == "IO feature with given index doesn't exists"
    assert errors["IOFeatureOdtBankNotExistsError"]["message"] == "IO ODT feature with given bank no doesn't exists"
    assert errors["IOFeatureTypeMismatchError"]["message"] == "IO feature type mismatch"
    assert errors["PeripheralNotExistsError"]["message"] == "Peripheral with given index doesn't exists"
    assert errors["InvalidPeripheralTypeError"]["message"] == "Invalid peripheral type"
    assert errors["PeripheralEndpointNotExistsError"]["message"] == "Peripheral endpoint with given index doesn't exists"
    assert errors["PeripheralChannelNotExistsError"]["message"] == "Peripheral channel with given index doesn't exists"
    assert errors["CreateProjectPermissionError"]["message"] == "Failed to create project file. Permission error"
    assert errors["ProjectNotLoadedError"]["message"] == "Project not loaded"
    assert errors["ProjectFileNotFoundError"]["message"] == "Project file not found"
    
