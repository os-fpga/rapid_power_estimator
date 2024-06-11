#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from dataclasses import dataclass, field, InitVar
from enum import Enum
from typing import List
from utilities.common_utils import RsEnum, update_attributes
from .clock import Clock
from .rs_device_resources import PeripheralNotFoundException, PeripheralEndpointNotFoundException
from .rs_message import RsMessage, RsMessageManager

class PeripheralType(Enum):
    NONE = 'none'
    SPI  = 'spi'
    JTAG = 'jtag'
    I2C  = 'i2c'
    UART = 'uart'
    USB2 = 'usb2'
    GIGE = 'gige'
    GPIO = 'gpio'
    PWM  = 'pwm'
    MEMORY = 'memory'
    DMA  = 'dma'
    BCPU = 'bcpu'
    ACPU = 'acpu'
    FPGA_COMPLEX = 'fpga_complex'

class Peripherals_Usage(RsEnum):
    Boot  = 0, "Boot"
    Debug = 1, "Debug"
    App   = 2, "App"

class Qspi_Performance_Mbps(RsEnum):
    SPI_1Mbps    = 0, "SPI: 1 Mb/s"
    SPI_25Mbps   = 1, "SPI: 25 Mb/s"
    SPI_50Mbps   = 2, "SPI: 50 Mb/s"
    SPI_100Mbps  = 3, "SPI: 100 Mb/s"
    QSPI_4Mbps   = 4, "QSPI: 4 Mb/s"
    QSPI_100Mbps = 5, "QSPI: 100 Mb/s"
    QSPI_200Mbps = 6, "QSPI: 200 Mb/s"
    QSPI_400Mbps = 7, "QSPI: 400 Mb/s"

class Jtag_Clock_Frequency(RsEnum):
    JTAG_10Mbps = 0, "10 Mb/S"
    JTAG_20Mbps = 1, "20 Mb/S"
    JTAG_40Mbps = 2, "40 Mb/S"

class Cpu(Enum):
    ACPU = 0
    BCPU = 1

class Baud_Rate(RsEnum):
    Baud_Rate_9600   = 0, "9600 baud"
    Baud_Rate_19200  = 1, "19200 baud"
    Baud_Rate_28800  = 2, "28800 baud"
    Baud_Rate_57600  = 3, "57600 baud"
    Baud_Rate_115200 = 4, "115200 baud"
    Baud_Rate_128000 = 5, "128000 baud"

class I2c_Speed(RsEnum):
    Standard_100Kbps = 0, "Standard (100Kb/s)"
    Fast_400Kbps     = 1, "Fast (400Kb/s)"
    Fast_Plus_1Mbps  = 2, "Fast+ (1Mb/s)"

class Usb_Speed(RsEnum):
    High_Speed_12Mbps  = 0, "High Speed (12Mb/s)"
    Full_Speed_480Mbps = 1, "Full Speed (480Mb/s)"

class Gige_Speed(RsEnum):
    Gige_10Mbps   = 0, "10 Mb/s"
    Gige_100Mbps  = 1, "100 Mb/s"
    Gige_1000Mbps = 2, "1000 Mb/s"

class GpioStandard(RsEnum):
    LVCMOS_1_8V_HR        = 0, "LVCMOS 1.8V (HR)"
    LVCMOS_2_5V           = 1, "LVCMOS 2.5V"
    LVCMOS_3_3V           = 2, "LVCMOS 3.3V"
    LVTTL                 = 3, "LVTTL"
    PCI66                 = 4, "PCI66"
    PCIX133               = 5, "PCIX133"
    SSTL_1_8V_Class_I_HR  = 6, "SSTL 1.8V Class-I (HR)"
    SSTL_1_8V_Class_II_HR = 7, "SSTL 1.8V Class-II (HR)"
    SSTL_2_5V_Class_I     = 8, "SSTL 2.5V Class-I"
    SSTL_2_5V_Class_II    = 9, "SSTL 2.5V Class-II"
    SSTL_3_3V_Class_I     = 10, "SSTL 3.3V Class-I"
    SSTL_3_3V_Class_II    = 11, "SSTL 3.3V Class-II"

class Gpio_Type(RsEnum):
    BCPU   = 0
    ACPU   = 1
    FABRIC = 2

class N22_RISC_V_Clock(RsEnum):
    PLL_233MHz       = 0, "PLL (233 MHz)"
    BOOT_Clock_40MHz = 1, "BOOT CLK (40 MHz)"
    RC_OSC_50MHz     = 2, "RC OSC (50 MHz)"

class Port_Activity(RsEnum):
    IDLE   = 0, "Idle"
    LOW    = 1, "Low"
    MEDIUM = 2, "Medium"
    HIGH   = 3, "High"

class A45_Load(RsEnum):
    IDLE   = 0, "Idle"
    LOW    = 1, "Low"
    MEDIUM = 2, "Medium"
    HIGH   = 3, "High"

class Memory_Type(RsEnum):
    SRAM = 0, "SRAM"
    DDR3 = 1, "DDR3"
    DDR4 = 2, "DDR4"

class Dma_Activity(RsEnum):
    IDLE   = 0, "Idle"
    LOW    = 1, "Low"
    MEDIUM = 2, "Mediun"
    HIGH   = 3, "High"

class Dma_Source_Destination(RsEnum):
    NONE     = 0, "NONE"
    DDR      = 1, "DDR"
    OCM      = 2, "OCM"
    SPI_QSPI = 3, "SPI/QSPI"
    I2C      = 4, "I2C"
    FABRIC   = 5, "Fabric"

@dataclass
class Peripheral_Output:
    calculated_bandwidth: float = field(default=0.0)
    block_power: float = field(default=0.0)
    percentage: float = field(default=0.0)
    messages: List[RsMessage] = field(default_factory=list)

@dataclass
class PeripheralBase:
    name : str = field(default='')
    peripheral_type : PeripheralType = field(default=PeripheralType.NONE)

@dataclass
class Qspi(PeripheralBase):
    enable: bool = field(default=False)
    usage: Peripherals_Usage = field(default=Peripherals_Usage.Boot)
    clock_frequency: Qspi_Performance_Mbps = field(default=Qspi_Performance_Mbps.SPI_1Mbps)
    output: Peripheral_Output = field(default_factory=Peripheral_Output)

    def __post_init__(self):
        self.peripheral_type = PeripheralType.SPI

    def compute_dynamic_power(self):
        # todo
        pass

@dataclass
class Jtag(PeripheralBase):
    enable: bool = field(default=False)
    usage: Peripherals_Usage = field(default=Peripherals_Usage.Debug)
    clock_frequency : Jtag_Clock_Frequency = field(default=Jtag_Clock_Frequency.JTAG_10Mbps)
    output: Peripheral_Output = field(default_factory=Peripheral_Output)

    def __post_init__(self):
        self.peripheral_type = PeripheralType.JTAG

    def compute_dynamic_power(self):
        # todo
        pass

@dataclass
class Uart(PeripheralBase):
    enable: bool = field(default=False)
    usage: Peripherals_Usage = field(default=Peripherals_Usage.Debug)
    baudrate : Baud_Rate = field(default=Baud_Rate.Baud_Rate_115200)
    cpu : Cpu = field(default=Cpu.ACPU)
    output: Peripheral_Output = field(default_factory=Peripheral_Output)

    def __post_init__(self):
        self.peripheral_type = PeripheralType.UART

    def compute_dynamic_power(self):
        # todo
        pass

@dataclass
class I2c(PeripheralBase):
    enable: bool = field(default=False)
    usage: Peripherals_Usage = field(default=Peripherals_Usage.App)
    clock_frequency : I2c_Speed = field(default=I2c_Speed.Standard_100Kbps)
    output: Peripheral_Output = field(default_factory=Peripheral_Output)

    def __post_init__(self):
        self.peripheral_type = PeripheralType.I2C

    def compute_dynamic_power(self):
        # todo
        pass

@dataclass
class Usb2(PeripheralBase):
    enable: bool = field(default=False)
    usage: Peripherals_Usage = field(default=Peripherals_Usage.App)
    bit_rate : Usb_Speed = field(default=Usb_Speed.Full_Speed_480Mbps)
    output: Peripheral_Output = field(default_factory=Peripheral_Output)

    def __post_init__(self):
        self.peripheral_type = PeripheralType.USB2

    def compute_dynamic_power(self):
        # todo
        pass

@dataclass
class Gige(PeripheralBase):
    enable: bool = field(default=False)
    usage: Peripherals_Usage = field(default=Peripherals_Usage.App)
    bit_rate: Gige_Speed = field(default=Gige_Speed.Gige_100Mbps)
    output: Peripheral_Output = field(default_factory=Peripheral_Output)

    def __post_init__(self):
        self.peripheral_type = PeripheralType.GIGE

    def compute_dynamic_power(self):
        # todo
        pass

@dataclass
class Gpio(PeripheralBase):
    usage: Peripherals_Usage = field(default=Peripherals_Usage.App)
    io_used: int = field(default=0)
    io_type: Gpio_Type = field(default=Gpio_Type.BCPU)
    io_standard: GpioStandard = field(default=GpioStandard.SSTL_1_8V_Class_I_HR)
    output: Peripheral_Output = field(default_factory=Peripheral_Output)

    def __post_init__(self):
        self.peripheral_type = PeripheralType.GPIO

    def compute_dynamic_power(self):
        # todo
        pass

@dataclass
class Pwm(PeripheralBase):
    usage: Peripherals_Usage = field(default=Peripherals_Usage.App)
    io_used: int = field(default=0)
    io_standard: GpioStandard = field(default=GpioStandard.SSTL_1_8V_Class_I_HR)
    output: Peripheral_Output = field(default_factory=Peripheral_Output)

    def __post_init__(self):
        self.peripheral_type = PeripheralType.PWM

    def compute_dynamic_power(self):
        # todo
        pass

@dataclass
class Memory_Output:
    write_bandwidth: float = field(default=0.0)
    read_bandwidth: float = field(default=0.0)
    block_power: float = field(default=0.0)
    percentage: float = field(default=0.0)
    messages: List[RsMessage] = field(default_factory=list)

@dataclass
class Memory(PeripheralBase):
    enable: bool = field(default=False)
    usage: Peripherals_Usage = field(default=Peripherals_Usage.App)
    memory_type: Memory_Type = field(default=Memory_Type.DDR3)
    data_rate: int = field(default=1333)
    width: int = field(default=32)
    output: Memory_Output = field(default_factory=Memory_Output)

    def __post_init__(self):
        self.peripheral_type = PeripheralType.MEMORY

    def compute_dynamic_power(self):
        # todo
        pass

@dataclass
class Endpoint_Output:
    calculated_bandwidth: float = field(default=0.0)
    clock_frequency: int = field(default=0) # specific to FPGA_Complex only
    percentage: float = field(default=0.0) # specific to FPGA_Complex only
    noc_power: float = field(default=0.0)
    messages: List[RsMessage] = field(default_factory=list)

@dataclass
class Endpoint:
    name: str = field(default='')
    activity: Port_Activity = field(default=Port_Activity.IDLE)
    read_write_rate: float = field(default=0.5)
    toggle_rate: float = field(default=0.125)
    clock: str = field(default='') # specific to FPGA_Complex only
    output: Endpoint_Output = field(default_factory=Endpoint_Output)

@dataclass
class N22_RISC_V_BCPU_Output:
    boot_mode: str = field(default='')
    active_power: float = field(default=0.0)
    boot_power: float = field(default=0.0)

@dataclass
class N22_RISC_V_BCPU(PeripheralBase):
    encryption_used: bool = field(default=True)
    clock: N22_RISC_V_Clock = field(default=N22_RISC_V_Clock.PLL_233MHz)
    ports: List[Endpoint] = field(default=List)
    output: N22_RISC_V_BCPU_Output = field(default_factory=N22_RISC_V_BCPU_Output)

    def __post_init__(self):
        self.peripheral_type = PeripheralType.BCPU

    def compute_dynamic_power(self):
        # todo
        pass

@dataclass
class Fpga_Complex(PeripheralBase):
    ports: List[Endpoint] = field(default=List)

    def __post_init__(self):
        self.peripheral_type = PeripheralType.FPGA_COMPLEX

    def compute_dynamic_power(self):
        # todo
        pass

@dataclass
class A45_RISC_V_Port_Output:
    block_power: float = field(default=0.0)

@dataclass
class A45_RISC_V_ACPU(PeripheralBase):
    enable: bool = field(default=False)
    frequency: int = field(default=0)
    load: A45_Load = field(default=A45_Load.MEDIUM)
    ports: List[Endpoint] = field(default_factory=List)
    output: A45_RISC_V_Port_Output = field(default_factory=A45_RISC_V_Port_Output)

    def __post_init__(self):
        self.peripheral_type = PeripheralType.ACPU

    def compute_dynamic_power(self):
        # todo
        pass

@dataclass
class DMA_Output:
    calculated_bandwidth: float = field(default=0.0)
    noc_power: float = field(default=0.0)
    block_power: float = field(default=0.0)
    percentage: float = field(default=0.0)
    messages: List[RsMessage] = field(default_factory=list)

@dataclass
class DMA(PeripheralBase):
    enable: bool = field(default=False)
    channel: int = field(default=1)
    source: Dma_Source_Destination = field(default=Dma_Source_Destination.NONE)
    destination: Dma_Source_Destination = field(default=Dma_Source_Destination.NONE)
    activity: Dma_Activity = field(default=Dma_Activity.MEDIUM)
    read_write_rate: float = field(default=0.5)
    toggle_rate: float = field(default=0.125)
    output: DMA_Output = field(default_factory=DMA_Output)

    def __post_init__(self):
        self.peripheral_type = PeripheralType.DMA

    def compute_dynamic_power(self):
        # todo
        pass
        
class Peripheral_SubModule:

    def __init__(self, resources):
        self.resources = resources
        self.total_interconnect_power = 0.0
        self.total_block_power = 0.0
        # todo: add peripherals for testing. actual configuration should be retrieved from device.xml when 
        # this data is availiable
        self.peripherals = [
            Qspi(enable=True, name="SPI/QSPI", usage=Peripherals_Usage.Boot),
            Jtag(name="JTAG"),
            I2c(name="I2C"),
            Uart(name="UART0 (BCPU)", cpu=Cpu.BCPU),
            Uart(name="UART1 (ACPU)", cpu=Cpu.ACPU),
            Usb2(name="USB 2.0"),
            Gige(name="GigE"),
            Gpio(name="GPIO (BCPU)", io_type=Gpio_Type.BCPU),
            Gpio(name="GPIO (ACPU)", io_type=Gpio_Type.ACPU),
            Gpio(name="GPIO (Fabric)", io_type=Gpio_Type.FABRIC),
            Pwm(name="PWM"),
            Memory(name="DDR", memory_type=Memory_Type.DDR3, data_rate=1333),
            Memory(enable=True, name="OCM", memory_type=Memory_Type.SRAM, data_rate=533),
            DMA(name="Channel 1"),
            DMA(name="Channel 2"),
            DMA(name="Channel 3"),
            DMA(name="Channel 4"),
            N22_RISC_V_BCPU(name="N22 RISC-V", ports=[Endpoint(), Endpoint(), Endpoint(), Endpoint()]),
            A45_RISC_V_ACPU(name="A45 RISC-V", ports=[Endpoint(), Endpoint(), Endpoint(), Endpoint()]),
            Fpga_Complex(name="FPGA Complex", ports=[Endpoint(), Endpoint(), Endpoint(), Endpoint()])
        ]

    def get_processor_output_power(self) -> float:
        # todo
        return 0.347

    def get_peripherals_output_power(self) -> float:
        # todo
        return 0.024

    def get_bcpu_output_power(self) -> float:
        # todo
        return 0.013

    def get_memory_output_power(self) -> float:
        # todo
        return 0.001

    def get_dma_output_power(self) -> float:
        # todo
        return 0.0001

    def get_noc_output_power(self) -> float:
        # todo
        return 0.003

    def get_power_consumption(self):
        # todo
        return 0.347, 0.024, 0.013, 0.001, 0.0001, 0.003

    def get_resources(self):
        # todo
        return 20, 40

    def get_all_messages(self):
        # todo
        return []

    def get_all(self):
        return self.peripherals

    def get_peripherals_by_type(self, periph_type):
        return [item for item in self.peripherals if item.peripheral_type == periph_type]

    def get_peripheral(self, periph_type, idx):
        items = self.get_peripherals_by_type(periph_type)
        if 0 <= idx < len(items):
            return items[idx]
        raise PeripheralNotFoundException

    def update_peripheral(self, periph_type, idx, data):
        item = update_attributes(self.get_peripheral(periph_type, idx), data)
        return item

    def get_endpoint(self, periph_type, idx, endpoint_idx):
        if periph_type in (PeripheralType.BCPU, PeripheralType.ACPU, PeripheralType.FPGA_COMPLEX):
            item = self.get_peripheral(periph_type, idx)
            if 0 <= endpoint_idx < len(item.ports):
                return item.ports[endpoint_idx]
        raise PeripheralEndpointNotFoundException

    def update_endpoint(self, periph_type, idx, endpoint_idx, data):
        item = update_attributes(self.get_endpoint(periph_type, idx, endpoint_idx), data)
        return item

    def compute_output_power(self):
        # todo
        pass
