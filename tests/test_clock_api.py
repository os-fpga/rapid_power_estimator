#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import pytest
from unittest.mock import Mock
from submodule.clock import Clock, Source, ClockOutput, Clock_SubModule, Clock_State
from submodule.rs_device_resources import RsDeviceResources, ClockNotFoundException, ClockMaxCountReachedException, ClockDescriptionPortValidationException
from submodule.rs_message import RsMessageType

def test_clock_initialization():
    clock = Clock()
    assert not clock.enable
    assert clock.description == ''
    assert clock.source == Source.IO
    assert clock.port == ''
    assert clock.frequency == 100000000
    assert clock.state == Clock_State.ACTIVE
    assert isinstance(clock.output, ClockOutput)
    assert clock.output.fan_out == 0
    assert clock.output.block_power == 0.0
    assert clock.output.interconnect_power == 0.0
    assert clock.output.percentage == 0.0
    assert clock.output.messages == []

@pytest.mark.parametrize("block_power, interconnect_power, total_power, expected_percentage", [
    (10, 20, 100.0, 30.0),
    (25, 25, 100.0, 50.0),
    (25, 25, 0.0, 0.0)
])
def test_compute_percentage(block_power, interconnect_power, total_power, expected_percentage):
    clock = Clock()
    clock.output.block_power = block_power
    clock.output.interconnect_power = interconnect_power
    clock.compute_percentage(total_power)

    assert clock.output.percentage == expected_percentage

@pytest.mark.parametrize(
"enable, frequency, fan_out, clock_cap_block, clock_cap_interconnect, expected_block_power, expected_interconnect_power, message_count, message_code",
[
    (True, 100000000, 10, 0.5, 0.3, 50.0, 300.0, 0, 0),
    (False, 100000000, 10, 0.5, 0.3, 0, 0, 1, 101)
])
def test_compute_dynamic_power(enable, frequency, fan_out, clock_cap_block, clock_cap_interconnect, expected_block_power, expected_interconnect_power, message_count, message_code):
    clock = Clock(enable=enable, frequency=frequency)

    clock.compute_dynamic_power(fan_out, clock_cap_block, clock_cap_interconnect)

    assert clock.output.fan_out == fan_out
    assert clock.output.block_power == expected_block_power
    assert clock.output.interconnect_power == expected_interconnect_power
    assert len(clock.output.messages) == message_count
    if message_count > 0:
        assert clock.output.messages[0].type == RsMessageType.INFO

def test_clock_submodule_initialization():
    mock_resources = Mock(spec=RsDeviceResources)
    clocks = [Clock(enable=True, description="Clock 1", port="CLK_1"), Clock(enable=False, description="Clock 2", port="CLK_2")]
    clock_submodule = Clock_SubModule(mock_resources, clocks)

    assert clock_submodule.total_clock_available == mock_resources.get_num_Clocks()
    assert clock_submodule.total_pll_available == mock_resources.get_num_PLLs()
    assert clock_submodule.itemlist == clocks

def test_get_clocking_resources():
    mock_resources = Mock(spec=RsDeviceResources)

    mock_resources.get_num_Clocks.return_value = 16
    mock_resources.get_num_PLLs.return_value = 2
    clock_submodule = Clock_SubModule(mock_resources, [])

    total_clock_used = 0
    total_pll_used = 0

    expected_result = (16, 2, total_clock_used, total_pll_used)
    assert clock_submodule.get_resources() == expected_result

def test_add_clock_success():
    mock_resources = Mock(spec=RsDeviceResources)
    mock_resources.get_num_Clocks.return_value = 5
    clock_submodule = Clock_SubModule(mock_resources)

    data = {"description": "Clock A", "port": "PORT_A", "enable": True}
    clock = clock_submodule.add(data)

    assert clock.description == "Clock A"
    assert clock.port == "PORT_A"
    assert clock_submodule.get_total_clock_used() == 1

def test_add_clock_duplicate_raises_exception():
    mock_resources = Mock(spec=RsDeviceResources)
    mock_resources.get_num_Clocks.return_value = 5
    clock_submodule = Clock_SubModule(mock_resources)

    clock_submodule.add({"description": "Clock A", "port": "PORT_A", "enable": True})
    
    with pytest.raises(ClockDescriptionPortValidationException):
        clock_submodule.add({"description": "Clock A", "port": "PORT_A", "enable": True})

def test_add_clock_max_limit_reached():
    mock_resources = Mock(spec=RsDeviceResources)
    mock_resources.get_num_Clocks.return_value = 1
    clock_submodule = Clock_SubModule(mock_resources)

    clock_submodule.add({"description": "Clock A", "port": "PORT_A", "enable": True})
    
    with pytest.raises(ClockMaxCountReachedException):
        clock_submodule.add({"description": "Clock B", "port": "PORT_B", "enable": True})

def test_remove_clock_success():
    mock_resources = Mock(spec=RsDeviceResources)
    mock_resources.get_num_Clocks.return_value = 5
    clock_submodule = Clock_SubModule(mock_resources)

    clock_submodule.add({"description": "Clock A", "port": "PORT_A", "enable": True})
    clock_submodule.add({"description": "Clock B", "port": "PORT_B", "enable": True})

    removed_clock = clock_submodule.remove(0)

    assert removed_clock.description == "Clock A"
    assert len(clock_submodule.itemlist) == 1

def test_remove_clock_not_found():
    mock_resources = Mock(spec=RsDeviceResources)
    clock_submodule = Clock_SubModule(mock_resources)

    with pytest.raises(ClockNotFoundException):
        clock_submodule.remove(0)

def test_get_all_messages():
    mock_resources = Mock(spec=RsDeviceResources)
    mock_resources.get_num_Clocks.return_value = 5
    mock_resources.get_num_PLLs.return_value = 1

    clock_submodule = Clock_SubModule(mock_resources)

    clock_submodule.add({"description": "Clock A", "port": "PORT_A", "enable": False})
    clock_submodule.add({"description": "Clock B", "port": "PORT_B", "enable": True})

    mock_resources.get_VCC_CORE.return_value = 1.0
    mock_resources.get_VCC_AUX.return_value = 1.2
    mock_resources.get_PLL_INT.return_value = 1.0
    mock_resources.get_PLL_AUX.return_value = 1.0
    mock_resources.get_CLK_CAP.return_value = 0.5
    mock_resources.get_CLK_INT_CAP.return_value = 0.3

    mock_module = Mock()
    mock_module.get_all.return_value = [
        Mock(flip_flop=10, clock="PORT_A"),
        Mock(flip_flop=5, clock="PORT_B")
    ]
    mock_resources.get_module.return_value = mock_module

    mock_resources.get_clock_fanout = Mock(return_value=5)

    clock_submodule.total_block_power = 50.0
    clock_submodule.total_interconnect_power = 30.0
    clock_submodule.total_pll_power = 10.0

    mock_message = Mock()
    mock_message.type = RsMessageType.INFO
    clock_submodule.get_all_messages = Mock(return_value=[mock_message])

    messages = clock_submodule.get_all_messages()

    assert len(messages) > 0
    assert messages[0].type == RsMessageType.INFO
