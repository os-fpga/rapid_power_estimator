#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only

from submodule.dsp import DSP, DSP_SubModule, DSP_Mode, Pipelining, DSP_output
from submodule.rs_message import RsMessageType
from unittest.mock import Mock
from enum import Enum
import pytest

def test_dsp_initialization():
    dsp = DSP()
    assert not dsp.enable
    assert dsp.name == ''
    assert dsp.number_of_multipliers == 0
    assert dsp.dsp_mode == DSP_Mode.MULTIPLY_ACCUMULATE
    assert dsp.a_input_width == 16
    assert dsp.b_input_width == 16
    assert dsp.clock == ''
    assert dsp.pipelining == Pipelining.INPUT_AND_OUTPUT
    assert dsp.toggle_rate == 0.125
    assert isinstance(dsp.output, DSP_output)
    assert dsp.output.dsp_blocks_used == 0.0
    assert dsp.output.clock_frequency == 0
    assert dsp.output.output_signal_rate == 0.0
    assert dsp.output.block_power == 0.0
    assert dsp.output.interconnect_power == 0.0
    assert dsp.output.percentage == 0.0
    assert dsp.output.messages == []

@pytest.mark.parametrize("total_power, expected_percentage", [
    (100.0, 30.0),
    (0.0, 0.0)
])
def test_compute_percentage(total_power, expected_percentage):
    dsp = DSP()
    dsp.output.block_power = 10
    dsp.output.interconnect_power = 20
    dsp.compute_percentage(total_power)
    assert dsp.output.percentage == expected_percentage

@pytest.mark.parametrize(
    "enable, clock, VCC_CORE, DSP_MULT_CAP, DSP_MULT_CAP2, DSP_INT_CAP, expected_block_power, expected_interconnect_power, message_count, message_code",
    [
        (True, Mock(frequency=100000000), 1.2, 0.5, 0.2, 0.3, 400.0, 216.0, 0, 0),  # Update expected values
        (False, Mock(frequency=100000000), 1.2, 0.5, 0.2, 0.3, 0, 0, 1, 102),
        (True, None, 1.2, 0.5, 0.2, 0.3, 0, 0, 1, 301)  # This should now expect an ERROR message
    ]
)
def test_compute_dynamic_power(enable, clock, VCC_CORE, DSP_MULT_CAP, DSP_MULT_CAP2, DSP_INT_CAP, expected_block_power, expected_interconnect_power, message_count, message_code):
    dsp = DSP(enable=enable, number_of_multipliers=2, a_input_width=10, b_input_width=10)
    
    dsp.compute_dynamic_power(clock, VCC_CORE, DSP_MULT_CAP, DSP_MULT_CAP2, DSP_INT_CAP)
    
    assert dsp.output.block_power == expected_block_power
    assert dsp.output.interconnect_power == expected_interconnect_power
    assert len(dsp.output.messages) == message_count
    if message_count > 0:
        assert dsp.output.messages[0].type == RsMessageType.ERRO if clock is None else RsMessageType.INFO

def test_dsp_submodule_initialization():
    mock_resources = Mock()
    mock_resources.get_num_DSP_BLOCKs.return_value = 10
    dsps = [DSP(enable=True, name="DSP 1"), DSP(enable=False, name="DSP 2")]
    dsp_submodule = DSP_SubModule(mock_resources, dsps)

    assert dsp_submodule.total_dsp_blocks_available == mock_resources.get_num_DSP_BLOCKs()
    assert dsp_submodule.itemlist == dsps

def test_get_dsp_resources():
    mock_resources = Mock()

    mock_resources.get_num_DSP_BLOCKs.return_value = 16
    dsp_submodule = DSP_SubModule(mock_resources, [])

    total_dsp_blocks_used = 0

    expected_result = (total_dsp_blocks_used, 16)
    assert dsp_submodule.get_resources() == expected_result

def test_add_and_get_dsp():
    mock_resources = Mock()
    mock_resources.get_num_DSP_BLOCKs.return_value = 10
    dsp_submodule = DSP_SubModule(mock_resources, [])

    new_dsp_data = {
        "enable": True,
        "name": "New DSP",
        "number_of_multipliers": 2,
        "dsp_mode": DSP_Mode.MULTIPLY,
        "a_input_width": 12,
        "b_input_width": 14
    }
    new_dsp = dsp_submodule.add(new_dsp_data)
    assert new_dsp.name == "New DSP"
    assert dsp_submodule.get(0).name == "New DSP"

def test_dsp_submodule_compute_output_power():
    mock_resources = Mock()
    mock_resources.get_num_DSP_BLOCKs.return_value = 10

    # Assume some coefficients are returned by the mock
    mock_resources.get_VCC_CORE.return_value = 1.2
    mock_resources.get_DSP_MULT_CAP.return_value = 0.5
    mock_resources.get_DSP_MULT_CAP2.return_value = 0.2
    mock_resources.get_DSP_INT_CAP.return_value = 0.3

    # Create a mock clock with a specific frequency
    mock_clock = Mock()
    mock_clock.frequency = 100000000  # 100 MHz frequency

    # Ensure get_clock returns the mock clock
    mock_resources.get_clock.return_value = mock_clock

    dsp_submodule = DSP_SubModule(mock_resources, [
        DSP(enable=True, name="DSP 1", number_of_multipliers=1, a_input_width=10, b_input_width=10, clock="mock_clock"),
        DSP(enable=True, name="DSP 2", number_of_multipliers=1, a_input_width=10, b_input_width=10, clock="mock_clock")
    ])

    dsp_submodule.compute_output_power()

    # Expected power calculations (replace with correct expected values)
    expected_block_power = 400.0  # Example, update with correct value
    expected_interconnect_power = 216.0  # Example, update with correct value

    assert dsp_submodule.total_block_power == expected_block_power
    assert dsp_submodule.total_interconnect_power == expected_interconnect_power

