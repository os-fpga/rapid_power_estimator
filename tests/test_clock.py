# from backend.submodule.clock import Clock, Source, ClockOutput, Clock_SubModule, Clock_State
# from backend.submodule.rs_device_resources import RsDeviceResources
# from unittest.mock import Mock
import pytest

def test_clock_1():
    assert 1 == 1
    # TODO: add backend test cases

# def test_clock_initialization():
#     clock = Clock()
#     assert not clock.enable
#     assert clock.description == ''
#     assert clock.source == Source.IO
#     assert clock.port == ''
#     assert clock.frequency == 100000000
#     assert clock.state == Clock_State.ACTIVE
#     assert isinstance(clock.output, ClockOutput)
#     assert clock.output.fan_out == 0
#     assert clock.output.block_power == 0.0
#     assert clock.output.interconnect_power == 0.0
#     assert clock.output.percentage == 0.0
#     assert clock.output.message == ''

# @pytest.mark.parametrize("block_power, interconnect_power, total_power, expected_percentage", [
#     (10, 20, 100.0, 30.0),
#     (25, 25, 100.0, 50.0),
#     (25, 25, 0.0, 0.0)
# ])
# def test_compute_percentage(block_power, interconnect_power, total_power, expected_percentage):
#     clock = Clock()
#     clock.output.block_power = block_power
#     clock.output.interconnect_power = interconnect_power
#     clock.compute_percentage(total_power)

#     assert clock.output.percentage == expected_percentage

# @pytest.mark.parametrize(
# "enable, frequency, fan_out, clock_cap_block, clock_cap_interconnect, expected_block_power, expected_interconnect_power", 
# [
#     (True, 100000000, 10, 0.5, 0.3, 50.0, 300.0),
#     (False, 100000000, 10, 0.5, 0.3, 0, 0)
# ])
# def test_compute_dynamic_power(enable, frequency, fan_out, clock_cap_block, clock_cap_interconnect, expected_block_power, expected_interconnect_power):
#     clock = Clock(enable=enable, frequency=frequency)

#     clock.compute_dynamic_power(fan_out, clock_cap_block, clock_cap_interconnect)

#     assert clock.output.fan_out == fan_out
#     assert clock.output.block_power == expected_block_power
#     assert clock.output.interconnect_power == expected_interconnect_power
#     assert clock.output.message == ''


# def test_clock_submodule_initialization():
#     mock_resources = Mock(spec=RsDeviceResources)
#     clocks = [Clock(enable=True, description="Clock 1", port="CLK_1"), Clock(enable=False, description="Clock 2", port="CLK_2")]
#     clock_submodule = Clock_SubModule(mock_resources, clocks)

#     assert clock_submodule.total_clock_available == mock_resources.get_num_Clocks()
#     assert clock_submodule.total_pll_available == mock_resources.get_num_PLLs()
#     assert clock_submodule.itemlist == clocks

# def test_get_clocking_resources():
#     mock_resources = Mock(spec=RsDeviceResources)

#     mock_resources.get_num_Clocks.return_value = 16
#     mock_resources.get_num_PLLs.return_value = 2
#     clock_submodule = Clock_SubModule(mock_resources, [])

#     total_clock_used = 0
#     total_pll_used = 0

#     expected_result = (16, 2, total_clock_used, total_pll_used)
#     assert clock_submodule.get_resources() == expected_result