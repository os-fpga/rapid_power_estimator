#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from dataclasses import dataclass, field, InitVar
from utilities.common_utils import update_attributes
from .clock import Clock
from typing import List
from enum import Enum
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

class Peripherals_Usage(Enum):
    Boot  = 0
    Debug = 1
    App   = 2

class Qspi_Performance_Mbps(Enum):
    SPI_1Mbps    = 0
    SPI_25Mbps   = 1
    SPI_50Mbps   = 2
    SPI_100Mbps  = 3
    QSPI_4Mbps   = 4
    QSPI_100Mbps = 5
    QSPI_200Mbps = 6
    QSPI_400Mbps = 7

class Jtag_Clock_Frequency(Enum):
    JTAG_10Mbps = 0
    JTAG_20Mbps = 1
    JTAG_40Mbps = 2

class Cpu(Enum):
    ACPU = 0
    BCPU = 1

class Baud_Rate(Enum):
    Baud_Rate_9600   = 0
    Baud_Rate_19200  = 1
    Baud_Rate_28800  = 2
    Baud_Rate_57600  = 3
    Baud_Rate_115200 = 4
    Baud_Rate_128000 = 5

class I2c_Speed(Enum):
    Standard_100Kbps = 0
    Fast_400Kbps     = 1
    Fast_Plus_1Mbps  = 2

class Usb_Speed(Enum):
    High_Speed_12Mbps  = 0
    Full_Speed_480Mbps = 1

class Gige_Speed(Enum):
    Gige_10Mbps   = 0
    Gige_100Mbps  = 1
    Gige_1000Mbps = 2

class GpioStandard(Enum):
    LVCMOS_1_8V_HR        = 0
    LVCMOS_2_5V           = 1
    LVCMOS_3_3V           = 2
    LVTTL                 = 3
    PCI66                 = 4
    PCIX133               = 5
    SSTL_1_8V_Class_I_HR  = 6
    SSTL_1_8V_Class_II_HR = 7
    SSTL_2_5V_Class_I     = 8
    SSTL_2_5V_Class_II    = 9
    SSTL_3_3V_Class_I     = 10
    SSTL_3_3V_Class_II    = 11

class Gpio_Type(Enum):
    BCPU   = 0
    ACPU   = 1
    FABRIC = 2

class N22_RISC_V_Clock(Enum):
    PLL_233MHz       = 0
    BOOT_Clock_40MHz = 1
    RC_OSC_50MHz     = 2

class Port_Activity(Enum):
    IDLE   = 0
    LOW    = 1
    MEDIUM = 2
    HIGH   = 3

class A45_Load(Enum):
    IDLE   = 0
    LOW    = 1
    MEDIUM = 2
    HIGH   = 3

class Memory_Type(Enum):
    SRAM = 0
    DDR3 = 1
    DDR4 = 2

class Dma_Activity(Enum):
    IDLE   = 0
    LOW    = 1
    MEDIUM = 2
    HIGH   = 3

class Dma_Source_Destination(Enum):
    NONE     = 0
    DDR      = 1
    OCM      = 2
    SPI_QSPI = 3
    I2C      = 4
    FABRIC   = 5

@dataclass
class Peripheral_Output:
    calculated_bandwidth: float = field(default=0.0)
    block_power: float = field(default=0.0)
    percentage: float = field(default=0.0)
    messages: [RsMessage] = field(default_factory=list)

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
    messages: [RsMessage] = field(default_factory=list)

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
    messages: [RsMessage] = field(default_factory=list)

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
    messages: [RsMessage] = field(default_factory=list)

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
