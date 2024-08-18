import pytest
from unittest.mock import MagicMock
from submodule.rs_device_resources import (
    RsDeviceResources,
    IO_Standard_Coeff,
    Power_Factor,
    IO_Standard,
    IO_BankType,
    PeripheralType,
    ModuleType,
    DeviceNotFoundException,
)

@pytest.fixture
def mock_device():
    device = MagicMock()
    device.series = 'Gemini'
    device.name = 'TestDevice'
    device.package = 'TestPackage'
    device.speedgrade = 'Speed1'
    return device

@pytest.fixture
def device_resources(mock_device):
    return RsDeviceResources(mock_device)

def test_load_device_resources(device_resources):
    assert len(device_resources.io_standard_coeff_list) > 0
    assert len(device_resources.peripheral_noc_power_factor) > 0

def test_get_device_name(device_resources):
    assert device_resources.get_device_name() == 'TestDevice'

def test_get_series(device_resources):
    assert device_resources.get_series() == 'Gemini'

def test_get_package(device_resources):
    assert device_resources.get_package() == 'TestPackage'

def test_get_speedgrade(device_resources):
    assert device_resources.get_speedgrade() == 'Speed1'

def test_get_num_PLLs(device_resources):
    assert device_resources.get_num_PLLs() == 4  # Since series is 'Gemini'

def test_get_num_DSP_BLOCKs(device_resources):
    assert device_resources.get_num_DSP_BLOCKs() == 176

def test_get_num_18K_BRAM(device_resources):
    assert device_resources.get_num_18K_BRAM() == 352  # 176 * 2

def test_get_num_36K_BRAM(device_resources):
    assert device_resources.get_num_36K_BRAM() == 176

def test_get_num_LUTs(device_resources):
    mock_device = device_resources.device
    mock_device.resources = {'lut': MagicMock(num=100)}
    assert device_resources.get_num_LUTs() == 100

def test_get_num_FFs(device_resources):
    mock_device = device_resources.device
    mock_device.resources = {'ff': MagicMock(num=200)}
    assert device_resources.get_num_FFs() == 200

def test_get_num_CLBs(device_resources):
    assert device_resources.get_num_CLBs() == 5676

def test_register_module(device_resources):
    module = MagicMock()
    device_resources.register_module(ModuleType.CLOCKING, module)
    assert device_resources.get_module(ModuleType.CLOCKING) == module

def test_get_divfactor_coeff_CLB(device_resources):
    factor, coeffs = device_resources.get_divfactor_coeff_CLB(worsecase=True)
    assert factor == 0.8
    assert len(coeffs) > 0

def test_get_clock_not_found(device_resources):
    device_resources.register_module(ModuleType.CLOCKING, MagicMock(get_all=MagicMock(return_value=[])))
    assert device_resources.get_clock('non_existent_clock') is None
