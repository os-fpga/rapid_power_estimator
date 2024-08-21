#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only

import pytest
from unittest.mock import Mock
from submodule.fabric_logic_element import Fabric_LE, Fabric_LE_SubModule, Glitch_Factor, Fabric_LE_output, FabricLeDescriptionAlreadyExistsException
from submodule.rs_message import RsMessage, RsMessageManager, RsMessageType

def test_fabric_le_initialization():
    fabric_le = Fabric_LE()
    assert fabric_le.enable == False
    assert fabric_le.name == ''
    assert fabric_le.lut6 == 0
    assert fabric_le.flip_flop == 0
    assert fabric_le.clock == ''
    assert fabric_le.toggle_rate == 0.125
    assert fabric_le.glitch_factor == Glitch_Factor.TYPICAL
    assert fabric_le.clock_enable_rate == 0.5
    assert isinstance(fabric_le.output, Fabric_LE_output)

@pytest.mark.parametrize("total_power, expected_percentage", [
    (100.0, 10.0),  # block_power = 10.0, interconnect_power = 0.0, total_power = 100.0, percentage = (10/100) * 100 = 10%
    (200.0, 5.0),   # block_power = 10.0, interconnect_power = 0.0, total_power = 200.0, percentage = (10/200) * 100 = 5%
    (0.0, 0.0)      # No total power, should return 0.0%
])
def test_compute_percentage(total_power, expected_percentage):
    fabric_le = Fabric_LE()
    fabric_le.output.block_power = 10.0
    fabric_le.output.interconnect_power = 0.0  # Add if needed
    fabric_le.compute_percentage(total_power)
    assert fabric_le.output.percentage == expected_percentage

@pytest.mark.parametrize("glitch_factor, expected_value", [
    (Glitch_Factor.TYPICAL, 1),
    (Glitch_Factor.HIGH, 2),
    (Glitch_Factor.VERY_HIGH, 4)
])
def test_get_glitch_factor(glitch_factor, expected_value):
    fabric_le = Fabric_LE(glitch_factor=glitch_factor)
    assert fabric_le.get_glitch_factor() == expected_value

def test_compute_dynamic_power_no_clock():
    fabric_le = Fabric_LE(enable=True, lut6=10, flip_flop=10)
    mock_message_manager = Mock()
    RsMessageManager.get_message = mock_message_manager
    fabric_le.compute_dynamic_power(None, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0)
    mock_message_manager.assert_called_with(301, {'clock': ''})
    assert fabric_le.output.block_power == 0.0
    assert fabric_le.output.interconnect_power == 0.0

def test_compute_dynamic_power_disabled():
    fabric_le = Fabric_LE(enable=False, lut6=10, flip_flop=10)
    mock_message_manager = Mock()
    RsMessageManager.get_message = mock_message_manager
    fabric_le.compute_dynamic_power(Mock(frequency=100), 1.0, 1.0, 1.0, 1.0, 1.0, 1.0)
    mock_message_manager.assert_called_with(103)
    assert fabric_le.output.block_power == 0.0
    assert fabric_le.output.interconnect_power == 0.0

def test_compute_dynamic_power_enabled():
    fabric_le = Fabric_LE(enable=True, lut6=10, flip_flop=5)
    clock = Mock(frequency=100000000)
    fabric_le.compute_dynamic_power(clock, 1.0, 0.1, 0.1, 0.1, 0.1, 0.1)
    assert fabric_le.output.block_power > 0.0
    assert fabric_le.output.interconnect_power > 0.0

def test_fabric_le_submodule_initialization():
    mock_resources = Mock()
    fabric_le_submodule = Fabric_LE_SubModule(mock_resources)
    assert fabric_le_submodule.total_lut6_available == mock_resources.get_num_LUTs()
    assert fabric_le_submodule.total_flipflop_available == mock_resources.get_num_FFs()
    assert fabric_le_submodule.itemlist == []

def test_add_fabric_le():
    mock_resources = Mock()
    fabric_le_submodule = Fabric_LE_SubModule(mock_resources)
    fabric_le_submodule.add({'name': 'LE1', 'lut6': 10, 'flip_flop': 5})
    assert len(fabric_le_submodule.itemlist) == 1
    assert fabric_le_submodule.itemlist[0].name == 'LE1'

def test_add_fabric_le_duplicate():
    mock_resources = Mock()
    fabric_le_submodule = Fabric_LE_SubModule(mock_resources)
    fabric_le_submodule.add({'name': 'LE1', 'lut6': 10, 'flip_flop': 5})
    with pytest.raises(FabricLeDescriptionAlreadyExistsException):
        fabric_le_submodule.add({'name': 'LE1', 'lut6': 10, 'flip_flop': 5})

def test_remove_fabric_le():
    mock_resources = Mock()
    fabric_le_submodule = Fabric_LE_SubModule(mock_resources)
    fabric_le_submodule.add({'name': 'LE1', 'lut6': 10, 'flip_flop': 5})
    fabric_le_submodule.remove(0)
    assert len(fabric_le_submodule.itemlist) == 0

def test_compute_output_power():
    mock_resources = Mock()
    mock_resources.get_VCC_CORE.return_value = 1.0
    mock_resources.get_LUT_CAP.return_value = 1.0
    mock_resources.get_LUT_INT_CAP.return_value = 1.0
    mock_resources.get_FF_CAP.return_value = 1.0
    mock_resources.get_FF_CLK_CAP.return_value = 1.0
    mock_resources.get_FF_INT_CAP.return_value = 1.0
    mock_resources.get_clock.return_value.frequency = 1000000  # 1 MHz

    # Given inputs
    lut6 = 10
    flip_flop = 5
    toggle_rate = 0.125
    clock_enable_rate = 0.5
    frequency = mock_resources.get_clock.return_value.frequency / 1000000.0  # Convert to MHz
    VCC_CORE = mock_resources.get_VCC_CORE.return_value

    # Calculate the expected values based on the formulas
    expected_output_signal_rate = frequency * toggle_rate * clock_enable_rate
    expected_block_power_value = (
        VCC_CORE**2 * lut6 * expected_output_signal_rate * mock_resources.get_LUT_CAP.return_value * 1  # glitch factor is 1
        + VCC_CORE**2 * flip_flop * expected_output_signal_rate * mock_resources.get_FF_CAP.return_value
        + VCC_CORE**2 * flip_flop * frequency * clock_enable_rate * mock_resources.get_FF_CLK_CAP.return_value
    )

    expected_interconnect_power_value = (
        VCC_CORE**2 * lut6 * expected_output_signal_rate * mock_resources.get_LUT_INT_CAP.return_value * 1  # glitch factor is 1
        + VCC_CORE**2 * flip_flop * expected_output_signal_rate * mock_resources.get_FF_INT_CAP.return_value
    )

    fabric_le_submodule = Fabric_LE_SubModule(mock_resources)
    fabric_le_submodule.add({'name': 'LE1', 'lut6': lut6, 'flip_flop': flip_flop, 'enable': True})
    fabric_le_submodule.compute_output_power()

    # Assertions to check the calculated power
    assert fabric_le_submodule.total_block_power == expected_block_power_value
    assert fabric_le_submodule.total_interconnect_power == expected_interconnect_power_value

