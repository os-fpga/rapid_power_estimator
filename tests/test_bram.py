#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only

from submodule.bram import BRAM, BRAM_SubModule, BRAM_Type, PortProperties, PortOutputProperties, BRAM_output
from unittest.mock import Mock
from submodule.rs_message import RsMessageType
import pytest

def test_bram_initialization():
    bram = BRAM()
    assert not bram.enable
    assert bram.name == ''
    assert bram.bram_used == 0
    assert isinstance(bram.port_a, PortProperties)
    assert isinstance(bram.port_b, PortProperties)
    assert isinstance(bram.output, BRAM_output)
    assert bram.output.block_power == 0.0
    assert bram.output.interconnect_power == 0.0
    assert bram.output.percentage == 0.0
    assert bram.output.messages == []

def test_bram_initialization_bram_18k_sdp():
    bram = BRAM(type=BRAM_Type.BRAM_18K_SDP)
    assert bram.type == BRAM_Type.BRAM_18K_SDP

def test_bram_initialization_bram_36k_tdp():
    bram = BRAM(type=BRAM_Type.BRAM_36K_TDP)
    assert bram.type == BRAM_Type.BRAM_36K_TDP

@pytest.mark.parametrize("type, expected_capacity", [
    (BRAM_Type.BRAM_18K_TDP, 1024),
    (BRAM_Type.BRAM_36K_SDP, 2048),
    (BRAM_Type.BRAM_18K_ROM, 1024),
    (BRAM_Type.BRAM_36K_FIFO, 2048),
])
def test_get_bram_capacity(type, expected_capacity):
    bram = BRAM(type=type)
    assert bram.get_bram_capacity() == expected_capacity

@pytest.mark.parametrize(
    "enable, clock_a, clock_b, write_cap, read_cap, int_cap, fifo_cap, expected_block_power, expected_interconnect_power, message_count, message_code",
    [
        (True, Mock(frequency=100000000), Mock(frequency=50000000), 0.5, 0.3, 0.2, 0.1, 512.0, 64.0, 0, 0),
        (False, None, None, 0.5, 0.3, 0.2, 0.1, 0, 0, 1, 104)
    ]
)
def test_compute_dynamic_power(enable, clock_a, clock_b, write_cap, read_cap, int_cap, fifo_cap, expected_block_power, expected_interconnect_power, message_count, message_code):
    bram = BRAM(enable=enable)

    # Set the mock return value for frequency
    if clock_a:
        clock_a.frequency = 100000000.0  # Set the frequency for clock_a
    if clock_b:
        clock_b.frequency = 50000000.0  # Set the frequency for clock_b

    bram.compute_dynamic_power(clock_a, clock_b, write_cap, read_cap, int_cap, fifo_cap)

    assert bram.output.block_power == expected_block_power
    assert bram.output.interconnect_power == expected_interconnect_power
    assert len(bram.output.messages) == message_count

    if message_count > 0:
        # Assuming RsMessageType is an enumeration or similar
        # Adjust this according to the actual attribute or value it should have
        assert bram.output.messages[0].message_code == message_code  # Replace 'message_code' with the correct attribute

        
def test_bram_submodule_initialization():
    mock_resources = Mock()
    brams = [BRAM(enable=True, name="BRAM 1"), BRAM(enable=False, name="BRAM 2")]
    bram_submodule = BRAM_SubModule(mock_resources, brams)

    assert bram_submodule.total_18k_bram_available == mock_resources.get_num_18K_BRAM()
    assert bram_submodule.total_36k_bram_available == mock_resources.get_num_36K_BRAM()
    assert bram_submodule.itemlist == brams

def test_get_bram_resources():
    mock_resources = Mock()

    mock_resources.get_num_18K_BRAM.return_value = 10
    mock_resources.get_num_36K_BRAM.return_value = 5
    bram_submodule = BRAM_SubModule(mock_resources, [])

    total_18k_bram_used = 0
    total_36k_bram_used = 0

    expected_result = (total_18k_bram_used, 10, total_36k_bram_used, 5)
    assert bram_submodule.get_resources() == expected_result

def test_add_and_get_bram():
    mock_resources = Mock()
    bram_submodule = BRAM_SubModule(mock_resources, [])

    new_bram_data = {
        "enable": True,
        "name": "New BRAM",
        "type": BRAM_Type.BRAM_36K_TDP,
        "bram_used": 2
    }
    new_bram = bram_submodule.add(new_bram_data)
    assert new_bram.name == "New BRAM"
    assert bram_submodule.get(0).name == "New BRAM"


def test_compute_dynamic_power():
    # Create mock clock objects
    bram = BRAM(enable=True, name="BRAM 1", type=BRAM_Type.BRAM_18K_SDP)
    clock_a = Mock()
    clock_b = Mock()

    # Set the frequency attribute to a float value
    clock_a.frequency = 100000000.0
    clock_b.frequency = 100000000.0

    # Now pass these mock objects to your method
    bram.compute_dynamic_power(clock_a, clock_b, WRITE_CAP=0.5, READ_CAP=0.3, INT_CAP=0.2, FIFO_CAP=0.1)
