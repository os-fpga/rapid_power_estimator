#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import pytest
from unittest.mock import Mock, create_autospec
from submodule.rs_device_resources import IO_Standard_Coeff, IO_Standard, IO_BankType
from submodule.peripherals import (
    Peripherals_Usage,
    Qspi_Performance_Mbps,
    Jtag_Clock_Frequency,
    Baud_Rate,
    I2c_Speed,
    Usb_Speed,
    Gige_Speed,
    GpioStandard,
    N22_RISC_V_Clock,
    Port_Activity,
    A45_Load,
    Memory_Type,
    PeripheralTarget,
    find_highest_bandwidth_peripheral_port,
    find_peripheral,
    get_io_output_coeff,
    get_power_factor,
    Port,
    Peripheral,
    Dma0,
    Pwm0,
    SubModule,
    RsDeviceResources,
    RsMessage
)

# Test Enum values
def test_peripherals_usage_enum():
    assert Peripherals_Usage.Boot.value == 0
    assert Peripherals_Usage.Debug.value == 1
    assert Peripherals_Usage.App.value == 2

def test_qspi_performance_mbps_enum():
    assert Qspi_Performance_Mbps.SPI_1Mbps.value == 0
    assert Qspi_Performance_Mbps.QSPI_400Mbps.value == 7

def test_jtag_clock_frequency_enum():
    assert Jtag_Clock_Frequency.JTAG_10Mbps.value == 0
    assert Jtag_Clock_Frequency.JTAG_40Mbps.value == 2

def test_baud_rate_enum():
    assert Baud_Rate.Baud_Rate_9600.value == 0
    assert Baud_Rate.Baud_Rate_115200.value == 4

def test_i2c_speed_enum():
    assert I2c_Speed.Standard_100Kbps.value == 0
    assert I2c_Speed.Fast_Plus_1Mbps.value == 2

def test_usb_speed_enum():
    assert Usb_Speed.High_Speed_12Mbps.value == 0
    assert Usb_Speed.Full_Speed_480Mbps.value == 1

def test_gige_speed_enum():
    assert Gige_Speed.Gige_10Mbps.value == 0
    assert Gige_Speed.Gige_1000Mbps.value == 2

def test_gpio_standard_enum():
    assert GpioStandard.LVCMOS_1_8V_HR.value == 0
    assert GpioStandard.SSTL_3_3V_Class_II.value == 11

def test_n22_risc_v_clock_enum():
    assert N22_RISC_V_Clock.PLL_233MHz.value == 0
    assert N22_RISC_V_Clock.RC_OSC_50MHz.value == 2

def test_port_activity_enum():
    assert Port_Activity.IDLE.value == 0
    assert Port_Activity.HIGH.value == 3

def test_a45_load_enum():
    assert A45_Load.IDLE.value == 0
    assert A45_Load.HIGH.value == 3

def test_memory_type_enum():
    assert Memory_Type.SRAM.value == 0
    assert Memory_Type.DDR4.value == 2

def test_peripheral_target_intflag():
    assert PeripheralTarget.NONE == 0
    assert PeripheralTarget.ACPU == 1
    assert (PeripheralTarget.ACPU | PeripheralTarget.BCPU) == 3

# Test class initializations with proper mock for SubModule
def test_port_initialization():
    port = Port(name='TestPort', source='Source', destination='Destination')
    assert port.name == 'TestPort'
    assert port.source == 'Source'
    assert port.destination == 'Destination'
    assert port.activity == Port_Activity.IDLE

def test_peripheral_initialization():
    mock_submodule = create_autospec(SubModule, instance=True)
    peripheral = Peripheral(name='TestPeripheral', context=mock_submodule)
    assert peripheral.name == 'TestPeripheral'
    assert peripheral.is_enabled() == False

# Test functions with proper mocks
def test_find_highest_bandwidth_peripheral_port():
    mock_context = Mock()
    mock_context.get_submodule.return_value.get_peripherals.return_value = []
    port, peripheral = find_highest_bandwidth_peripheral_port(mock_context)
    assert port is None
    assert peripheral is None

def test_find_peripheral():
    mock_context = Mock()
    mock_context.get_submodule.return_value.get_peripherals.return_value = []
    peripheral = find_peripheral(mock_context, 'TestPeripheral')
    assert peripheral is None

def test_get_io_output_coeff():
    mock_context = Mock()
    mock_context.get_device_resources.return_value.get_IO_standard_coeff.return_value = IO_Standard_Coeff(io_standard=IO_Standard.LVCMOS_1_8V_HR, voltage=1.8, \
                          bank_type=IO_BankType.HR, input_ac=0.1, input_dc=0.2, output_ac=0.3, output_dc=0.4, int_inner=0.1, int_outer=0.2)
    coeff = get_io_output_coeff(mock_context, 1.8)
    assert coeff == (0.3, 0.4)

def test_get_power_factor():
    mock_context = Mock()
    mock_context.get_device_resources.return_value.get_peripheral_noc_power_factor.return_value = []
    factor = get_power_factor(mock_context, PeripheralTarget.ACPU, PeripheralTarget.BCPU)
    assert factor == 0.0

# Test ComputeObject-derived class methods with proper context mocks
def test_dma0_compute():
    mock_context = Mock()
    dma = Dma0(context=mock_context)
    mock_context.get_device_resources.return_value.get_VCC_CORE.return_value = 1.0
    mock_context.get_submodule.return_value.get_peripherals.return_value = []
    assert dma.compute() == True

def test_pwm0_compute():
    mock_context = Mock()
    pwm = Pwm0(context=mock_context)
    assert pwm.compute() == False  # Because io_used is 0 by default
