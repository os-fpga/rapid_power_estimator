import pytest
from submodule.rs_message import RsMessage, RsMessageManager, RsMessageType
from submodule.rs_device_resources import RsDeviceResources
from unittest.mock import patch
from unittest.mock import MagicMock
from submodule.io import (
    IO,
    IO_Direction,
    IO_Drive_Strength,
    IO_Slew_Rate,
    IO_differential_termination,
    IO_Data_Type,
    IO_Synchronization,
    IO_Pull_up_down,
    IO_Feature_ODT,
    IO_SubModule,
    IO_BankType,
    IO_Standard,
    IO_Standard_Coeff,
)

@pytest.fixture
def mock_resources():
    # Creating a mock of RsDeviceResources
    mock_device = MagicMock()
    mock_res = MagicMock(spec=RsDeviceResources)
    mock_res.get_num_HP_Banks.return_value = 4
    mock_res.get_num_HR_Banks.return_value = 2
    mock_res.get_num_HP_IOs.return_value = 100
    mock_res.get_num_HR_IOs.return_value = 60
    mock_res.get_IO_standard_coeff.return_value = [
        IO_Standard_Coeff(io_standard=IO_Standard.LVCMOS_1_8V_HR, voltage=1.8, bank_type=IO_BankType.HR, input_ac=0.1, input_dc=0.2, output_ac=0.3, output_dc=0.4, int_inner=0.1, int_outer=0.2)
    ]
    mock_res.get_clock.return_value = None
    mock_res.device = mock_device
    return mock_res

def test_io_initialization():
    io = IO(enable=True, name="TestIO")
    assert io.enable == True
    assert io.name == "TestIO"

def test_compute_io_count():
    io = IO(enable=True, bus_width=8, direction=IO_Direction.INPUT)
    assert io.compute_io_count() == 8

def test_compute_vcco_power(mock_resources):
    io = IO(enable=True, bus_width=8, direction=IO_Direction.INPUT, io_standard=IO_Standard.LVCMOS_1_8V_HR)
    io_submodule = IO_SubModule(resources=mock_resources, itemlist=[io])
    io_submodule.compute_output_power()
    assert io.output.block_power >= 0

def test_io_submodule_initialization(mock_resources):
    io_submodule = IO_SubModule(resources=mock_resources)
    assert len(io_submodule.io_features) > 0

def test_io_feature_odt_initialization(mock_resources):
    io_submodule = IO_SubModule(resources=mock_resources)
    odt_feature = IO_Feature_ODT(context=io_submodule)
    assert len(odt_feature.banks) == mock_resources.get_num_HP_Banks()

def test_io_feature_odt_compute(mock_resources):
    io_submodule = IO_SubModule(resources=mock_resources)
    odt_feature = IO_Feature_ODT(context=io_submodule)
    result = odt_feature.compute()
    assert result == True

def test_find_coeff(mock_resources):
    io_submodule = IO_SubModule(resources=mock_resources)
    coeff = io_submodule.find_coeff(mock_resources.get_IO_standard_coeff(), IO_Standard.LVCMOS_1_8V_HR)
    assert coeff.voltage == 1.8

def test_get_num_ios_by_banktype_voltage(mock_resources):
    # Mocking the IO's output attributes
    mock_resources.get_IO_standard_coeff.return_value = [
        IO_Standard_Coeff(io_standard=IO_Standard.LVCMOS_1_8V_HR, voltage=1.8, bank_type=IO_BankType.HR, input_ac=0.1, input_dc=0.2, output_ac=0.3, output_dc=0.4, int_inner=0.1, int_outer=0.2)
    ]
    
    # Create an IO object with matching bank_type and voltage
    io = IO(
        enable=True,
        bus_width=8,
        direction=IO_Direction.INPUT,
        io_standard=IO_Standard.LVCMOS_1_8V_HR,
    )
    io.output.bank_type = IO_BankType.HR
    io.output.vccio_voltage = 1.8

    io_submodule = IO_SubModule(resources=mock_resources, itemlist=[io])
    count = io_submodule.get_num_ios_by_banktype_voltage(IO_BankType.HR, 1.8)
    
    # Asserting that the IO count is correctly computed
    assert count == 8

def test_set_io_error_msg(mock_resources):
    # Create an IO object that should trigger an error
    io = IO(
        enable=True,
        bus_width=8,
        direction=IO_Direction.INPUT,
        io_standard=IO_Standard.LVCMOS_1_8V_HR,
    )
    io.output.bank_type = IO_BankType.HR
    io.output.vccio_voltage = 1.8

    io_submodule = IO_SubModule(resources=mock_resources, itemlist=[io])

    # Mock RsMessageManager.get_message to return a real RsMessage
    with patch('submodule.rs_message.RsMessageManager.get_message') as mock_get_message:
        # Mocking a return message
        mock_get_message.return_value = RsMessage(202, RsMessageType.WARN, "Not enough HR banks powered at 1.8V available")

        # Invoke set_io_error_msg to simulate the condition where an error should be added
        io_submodule.set_io_error_msg(IO_BankType.HR, 1.8)

        # Check if an error message was added
        assert len(io.output.messages) > 0
        assert io.output.messages[0].code == 202  # Check for correct message code
        assert io.output.messages[0].type == RsMessageType.WARN  # Check for correct message type
        assert io.output.messages[0].text == "Not enough HR banks powered at 1.8V available"  # Check for correct message text

def test_compute_output_power(mock_resources):
    # Mock IO standard coefficients
    mock_io_standard_coeff = IO_Standard_Coeff(
        io_standard=IO_Standard.LVCMOS_1_8V_HR,
        voltage=1.8,
        bank_type=IO_BankType.HR,
        input_ac=0.1,
        output_ac=0.2,
        input_dc=0.3,
        output_dc=0.4,
        int_inner=0.5,
        int_outer=0.6
    )

    # Setup RsDeviceResources to return the mock coefficient
    mock_resources.get_IO_standard_coeff = MagicMock(return_value=[mock_io_standard_coeff])
    mock_resources.get_clock = MagicMock(return_value=MagicMock(frequency=100e6))  # 100 MHz clock

    # Create an IO object with attributes that should trigger interconnect power calculation
    io = IO(
        enable=True,
        bus_width=8,
        direction=IO_Direction.OUTPUT,
        io_standard=IO_Standard.LVCMOS_1_8V_HR,
        input_enable_rate=0.5,
        output_enable_rate=0.5,
        toggle_rate=0.5,
    )
    io_submodule = IO_SubModule(resources=mock_resources, itemlist=[io])
    io_submodule.compute_output_power()

    # Ensure power calculations were performed
    assert io_submodule.total_block_power > 0
    assert io_submodule.total_interconnect_power > 0  # This should now be greater than 0
    assert io_submodule.total_on_die_termination_power >= 0

def test_add_io(mock_resources):
    io_submodule = IO_SubModule(resources=mock_resources)
    io_submodule.add({"enable": True, "name": "TestIO"})
    assert len(io_submodule.itemlist) == 1

def test_remove_io(mock_resources):
    io_submodule = IO_SubModule(resources=mock_resources)
    io_submodule.add({"enable": True, "name": "TestIO"})
    io_submodule.remove(0)
    assert len(io_submodule.itemlist) == 0

def test_clear_io(mock_resources):
    io_submodule = IO_SubModule(resources=mock_resources)
    io_submodule.add({"enable": True, "name": "TestIO"})
    io_submodule.clear()
    assert len(io_submodule.itemlist) == 0
