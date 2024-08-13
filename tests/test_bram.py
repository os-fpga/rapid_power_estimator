from submodule.bram import BRAM, BRAM_SubModule, BRAM_Type, PortProperties, PortOutputProperties
from unittest.mock import Mock
import pytest

def test_bram_initialization():
    bram = BRAM()
    assert not bram.enable
    assert bram.name == ''
    assert bram.type == BRAM_Type.BRAM_18K_SDP
    assert bram.bram_used == 0
    assert isinstance(bram.port_a, PortProperties)
    assert isinstance(bram.port_b, PortProperties)
    assert isinstance(bram.output, PortOutputProperties)
    assert bram.output.block_power == 0.0
    assert bram.output.interconnect_power == 0.0
    assert bram.output.percentage == 0.0
    assert bram.output.messages == []

@pytest.mark.parametrize("type, expected_capacity", [
    (BRAM_Type.BRAM_18K_SDP, 1024),
    (BRAM_Type.BRAM_36K_TDP, 2048),
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
])
def test_compute_dynamic_power(enable, clock_a, clock_b, write_cap, read_cap, int_cap, fifo_cap, expected_block_power, expected_interconnect_power, message_count, message_code):
    bram = BRAM(enable=enable)

    bram.compute_dynamic_power(clock_a, clock_b, write_cap, read_cap, int_cap, fifo_cap)

    assert bram.output.block_power == expected_block_power
    assert bram.output.interconnect_power == expected_interconnect_power
    assert len(bram.output.messages) == message_count
    if message_count > 0:
        assert bram.output.messages[0].type == RsMessageType.INFO
        
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
        "bram_used": 1
    }
    new_bram = bram_submodule.add(new_bram_data)
    assert new_bram.name == "New BRAM"
    assert bram_submodule.get(0).name == "New BRAM"

def test_bram_submodule_compute_output_power():
    mock_resources = Mock()

    # Assume some coefficients are returned by the mock
    mock_resources.get_BRAM_WRITE_CAP.return_value = 0.5
    mock_resources.get_BRAM_READ_CAP.return_value = 0.3
    mock_resources.get_BRAM_INT_CAP.return_value = 0.2
    mock_resources.get_BRAM_FIFO_CAP.return_value = 0.1

    bram_submodule = BRAM_SubModule(mock_resources, [
        BRAM(enable=True, name="BRAM 1", bram_used=1),
        BRAM(enable=True, name="BRAM 2", bram_used=1)
    ])

    bram_submodule.compute_output_power()

    assert bram_submodule.total_block_power > 0
    assert bram_submodule.total_interconnect_power > 0

