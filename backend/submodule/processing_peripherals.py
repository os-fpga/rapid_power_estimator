#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from dataclasses import dataclass, field, InitVar
from clock import Clock
from typing import List
from enum import Enum

class Peripherals_Usage(Enum):
    Boot = 'Boot'
    Debug = 'Debug'
    App = 'Application'

class Qspi_Performance_Mbps(Enum):
    SPI_1Mbps = 1000000
    SPI_25Mbps = 25000000
    SPI_50Mbps = 50000000
    SPI_100Mbps = 100000000
    QSPI_4Mbps = 4000000
    QSPI_100Mbps = 100000000
    QSPI_200Mbps = 200000000
    QSPI_400Mbps = 400000000

class Cpu(Enum):
    ACPU = 'ACPU'
    BCPU = 'BCPU'

9600,19200,28800,57600,115200,128000
class Baud_Rate(Enum):
    Baud_Rate_9600 = 9600
    Baud_Rate_19200 = 19200
    Baud_Rate_28800 = 28800
    Baud_Rate_115200 = 115200
    Baud_Rate_128000 = 128000

class I2c_Speed(Enum):
    Standard_100Kbps = 100000
    Fast_400Kbps = 400000
    Fast_Plus_1Mbps = 1000000

class Usb_Speed(Enum):
    High_Speed_12Mbps = 12000000
    Full_Speed_480Mbps = 480000000

class Gige_Speed(Enum):
    Gige_10Mbps = 10000000
    Gige_100Mbps = 100000000
    Gige_1000Mbps = 1000000000

class GpioStandard(Enum):
    LVCMOS_1_8V_HR = "LVCMOS 1.8V (HR)"
    LVCMOS_2_5V = "LVCMOS 2.5V"
    LVCMOS_3_3V = "LVCMOS 3.3V"
    LVTTL = "LVTTL"
    PCI66 = "PCI66"
    PCIX133 = "PCIX133"
    SSTL_1_8V_Class_I_HR = "SSTL 1.8V Class-I (HR)"
    SSTL_1_8V_Class_II_HR = "SSTL 1.8V Class-II (HR)"
    SSTL_2_5V_Class_I = "SSTL 2.5V Class-I"
    SSTL_2_5V_Class_II = "SSTL 2.5V Class-II"
    SSTL_3_3V_Class_I = "SSTL 3.3V Class-I"
    SSTL_3_3V_Class_II = "SSTL 3.3V Class-II"

class Gpio_Type(Enum):
    Bcpu = 'BCPU'
    Acpu = 'ACPU'
    Fabric = 'Fabric'

class Peripheral_Output:
    calculated_bandwidth: float = field(default=0.0)
    block_power: float = field(default=0.0)
    percentage: float = field(default=0.0)
    message: str = field(default='')

    def __init__(self, calculated_bandwidth: float = 0.0, block_power: float = 0.0, percentage: float = 0.0, message: str = ''):
        self.calculated_bandwidth = calculated_bandwidth
        self.block_power = block_power
        self.percentage = percentage
        self.message = message

    def compute_dynamic_power(self):
        if self.used:
            # todo
            pass
        else:
            return 0


@dataclass
class Qspi:
    used: bool = field(default=False)
    usage: Peripherals_Usage = field(default=Peripherals_Usage.Boot)
    performance: Qspi_Performance_Mbps = field(default=Qspi_Performance_Mbps.SPI_1Mbps)
    power_output: Peripheral_Output = field(default=Peripheral_Output())

    def __init__(self, used: bool = False, usage: Peripherals_Usage = Peripherals_Usage.Boot, performance: Qspi_Performance_Mbps = Qspi_Performance_Mbps.SPI_1Mbps, power_output: Peripheral_Output = Peripheral_Output()):
        self.used = used
        self.usage = usage
        self.performance = performance
        self.power_output = power_output

    def compute_dynamic_power(self):
        if self.used:
            # todo
            pass
        else:
            return 0

@dataclass
class Jtag:
    used: bool = field(default=False)
    usage: Peripherals_Usage = field(default=Peripherals_Usage.Debug)
    performance : float = field(default=10000000.0)
    power_output: Peripheral_Output = field(default=Peripheral_Output())

    def __init__(self, used: bool = False, usage: Peripherals_Usage = Peripherals_Usage.Debug, performance: float = 10000000.0, power_output: Peripheral_Output = Peripheral_Output()):
        self.used = used
        self.usage = usage
        self.performance = performance
        self.power_output = power_output
    
    def compute_dynamic_power(self):
        if self.used:
            # todo
            pass
        else:
            return 0

@dataclass
class Uart:
    used: bool = field(default=False)
    usage: Peripherals_Usage = field(default=Peripherals_Usage.Debug)
    performance : Baud_Rate = field(default=Baud_Rate.Baud_Rate_115200)
    cpu : Cpu = field(default=Cpu.ACPU)
    power_output: Peripheral_Output = field(default=Peripheral_Output())

    def __init__(self, used: bool = False, usage: Peripherals_Usage = Peripherals_Usage.Debug, performance: Baud_Rate = Baud_Rate.Baud_Rate_115200, cpu: Cpu = Cpu.ACPU, power_output: Peripheral_Output = Peripheral_Output()):
        self.used = used
        self.usage = usage
        self.performance = performance
        self.cpu = cpu
        self.power_output = power_output

    def compute_dynamic_power(self):
        if self.used:
            # todo
            pass
        else:
            return 0

@dataclass
class I2c:
    used: bool = field(default=False)
    usage: Peripherals_Usage = field(default=Peripherals_Usage.Debug)
    performance : I2c_Speed = field(default=I2c_Speed.standard_100Kbps)
    power_output: Peripheral_Output = field(default=Peripheral_Output())

    def __init__(self, used: bool = False, usage: Peripherals_Usage = Peripherals_Usage.Debug, performance: I2c_Speed = I2c_Speed.standard_100Kbps, power_output: Peripheral_Output = Peripheral_Output()):
        self.used = used
        self.usage = usage
        self.performance = performance
        self.power_output = power_output

    def compute_dynamic_power(self):
        if self.used:
            # todo
            pass
        else:
            return 0

@dataclass
class Usb:
    used: bool = field(default=False)
    usage: Peripherals_Usage = field(Peripherals_Usage.App)
    performance : Usb_Speed = field(default=Usb_Speed.Full_Speed_480Mbps)
    power_output: Peripheral_Output = field(default=Peripheral_Output())

    def __init__(self, used: bool = False, usage: Peripherals_Usage = Peripherals_Usage.App, performance: Usb_Speed = Usb_Speed.Full_Speed_480Mbps, power_output: Peripheral_Output = Peripheral_Output()):
        self.used = used
        self.usage = usage
        self.performance = performance
        self.power_output = power_output

    def compute_dynamic_power(self):
        if self.used:
            # todo
            pass
        else:
            return 0

@dataclass
class Gige:
    used : bool = field(default=False)
    usage : Peripherals_Usage = field(default=Peripherals_Usage.App)
    performace: Gige_Speed = field(default=Gige_Speed.Gige_100Mbps)
    power_output: Peripheral_Output = field(default=Peripheral_Output())

    def __init__(self, used: bool = False, usage: Peripherals_Usage = Peripherals_Usage.App, performace: Gige_Speed = Gige_Speed.Gige_100Mbps, power_output: Peripheral_Output = Peripheral_Output()):
        self.used = used
        self.usage = usage
        self.performace = performace
        self.power_output = power_output

    def compute_dynamic_power(self):
        if self.used:
            # todo
            pass
        else:
            return 0

@dataclass
class Gpio:
    used: int = field(default=0)
    type: Gpio_Type = field(default=Gpio_Type.Bcpu)
    usage: Peripherals_Usage = field(default=Peripherals_Usage.App)
    performance: GpioStandard = field(default=GpioStandard.SSTL_1_8V_Class_I_HR)
    power_output: Peripheral_Output = field(default=Peripheral_Output())

    def __init__(self, used: int = 0, type: Gpio_Type = Gpio_Type.Bcpu, usage: Peripherals_Usage = Peripherals_Usage.App, performance: GpioStandard = GpioStandard.SSTL_1_8V_Class_I_HR, power_output: Peripheral_Output = Peripheral_Output()):
        self.used = used
        self.type = type
        self.usage = usage
        self.performance = performance
        self.power_output = power_output

    def compute_dynamic_power(self):
        if self.used > 0:
            # todo
            pass
        else:
            return 0

@dataclass
class Pwm:
    used: int = field(default=0)
    usage: Peripherals_Usage = field(default=Peripherals_Usage.App)
    performance: GpioStandard = field(default=GpioStandard.SSTL_1_8V_Class_I_HR)
    power_output: Peripheral_Output = field(default=Peripheral_Output())

    def __init__(self, used: int = 0, usage: Peripherals_Usage = Peripherals_Usage.App, performance: GpioStandard = GpioStandard.SSTL_1_8V_Class_I_HR, power_output: Peripheral_Output = Peripheral_Output()):
        self.used = used
        self.usage = usage
        self.performance = performance
        self.power_output = power_output

    def compute_dynamic_power(self):
        if self.used > 0:
            # todo
            pass
        else:
            return 0

class N22_RISC_V_Clock(Enum):
    PLL_233MHz = 'PLL_233MHz'
    BOOT_Clock_40MHz = 'BOOT_Clock_40MHz'
    RC_OSC_50MHz = 'RC_OSC_50MHz'

class Port_Activity(Enum):
    Idle = 'Idle'
    Low = 'Low'
    Medium = 'Medium'
    High = 'High'

@dataclass
class N22_RISC_V_Port_Output:
    calculated_bandwidth: float = field(default=0.0)
    noc_power: float = field(default=0.0)
    active_power: float = field(default=0.0)
    boot_power: float = field(default=0.0)
    message: str = field(default='')

@dataclass
class N22_RISC_V_Port:
    end_point: str = field(default='') # valid values: jtag, spi_qspi, uart0, ddr, ocm, gpio
    activity: Port_Activity = field(default=Port_Activity.Medium)
    read_write_rate_percentage: float = field(default=50.0)
    toggle_rate_percentage: float = field(default=12.5)
    output: N22_RISC_V_Port_Output = field(default=N22_RISC_V_Port_Output())
    message: str = field(default='')

@dataclass
class N22_RISC_V_BCPU:
    boot_mode: str = field(default='QSPI')
    used_encryption: bool = field(default=True)
    clock: N22_RISC_V_Clock = field(default=N22_RISC_V_Clock.PLL_233MHz)
    port: List[N22_RISC_V_Port] = field(default=[])

class Fpga_Complex_End_Points(Enum):
    DDR = 'DDR'
    OCM = 'OCM'
    SPI_QSPI = 'SPI_QSPI'
    I2C = 'I2C'
    GIGE = 'GigE'

class Fpga_Complex_Activity(Enum):
    Idle = 'Idle'
    Low = 'Low'
    Medium = 'Medium'
    High = 'High'

class Fpga_Complex_Output:
    calculated_bandwidth: float = field(default=0.0)
    noc_power: float = field(default=0.0)
    percentage: float = field(default=0.0)
    message: str = field(default='')

@dataclass
class Fpga_Complex:
    clock : Clock = field(default=None)
    frequency : int = field(default=clock.frequency)
    end_point : Fpga_Complex_End_Points = field(default=None)
    activity : Fpga_Complex_Activity = field(default=Fpga_Complex_Activity.Medium)
    read_write_rate_percentage: float = field(default=50.0)
    toggle_rate: float = field(default=12.5)
    output : Fpga_Complex_Output = field(default=Fpga_Complex_Output())

class Memory_Type(Enum):
    DDR3 = 'DDR3'
    DDR4 = 'DDR4'

@dataclass
class Memory_Output:
    write_bandwidth_MBps: float = field(default=0.0)
    read_bandwidth_MBps: float = field(default=0.0)
    block_power: float = field(default=0.0)
    percentage: float = field(default=0.0)

@dataclass
class Memory_DDR:
    used: bool = field(default=False)
    usage: Peripherals_Usage = field(default=Peripherals_Usage.App)
    type: Memory_Type = field(default=Memory_Type.DDR3)
    data_rate: int = field(default=1066)
    width: int = field(default=32)
    output: Memory_Output = field(default=Memory_Output())

@dataclass
class Memory_OCM:
    used: bool = field(default=False)
    usage: Peripherals_Usage = field(default=Peripherals_Usage.App)
    type: str = 'SRAM'
    data_rate: int = 533
    width: int = 32
    output: Memory_Output = field(default=Memory_Output())


class A45_Load(Enum):
    Idle = 'Idle'
    Low = 'Low'
    Medium = 'Medium'
    High = 'High'

@dataclass
class A45_RISC_V_Port_Output:
    calculated_bandwidth: float = field(default=0.0)
    noc_power: float = field(default=0.0)
    block_power: float = field(default=0.0)
    message: str = field(default='')

@dataclass
class A45_RISC_V_Data_Path:
    end_point: str = field(default='') # valid values: jtag, spi_qspi, uart0, ddr, ocm, gpio
    activity: Port_Activity = field(default=Port_Activity.Medium)
    read_write_rate_percentage: float = field(default=50.0)
    toggle_rate_percentage: float = field(default=12.5)
    output: A45_RISC_V_Port_Output = field(default=A45_RISC_V_Port_Output())

@dataclass
class A45_RISC_V_ACPU:
    used: bool = field(default=False)
    frequency: int = field(default=533000000)
    load : A45_Load = field(default=A45_Load.Medium)
    data_path: List[A45_RISC_V_Data_Path] = field(default=[])

class Dma_Activity(Enum):
    Idle = 'Idle'
    Low = 'Low'
    Medium = 'Medium'
    High = 'High'

class Dma_Source_Destination(Enum):
    DDR = 'DDR'
    OCM = 'OCM'
    SPI_QSPI = 'SPI_QSPI'
    I2C = 'I2C'
    Fabric = 'Fabric'

@dataclass
class DMA:
    channel: int = field(default=1)
    used: bool = field(default=False)
    _source: Dma_Source_Destination = field(default=None)
    _destination: Dma_Source_Destination = field(default=None)
    _initialized: InitVar[bool] = field(default=False)
    activity: Dma_Activity = field(default=Dma_Activity.Medium)
    read_write_rate_percentage: float = field(default=50.0)
    toggle_rate: float = field(default=12.5)

    @property
    def source(self):
        return self._source

    @source.setter
    def source(self, value):
        if self._initialized and value is not None and self._destination is not None and value == self._destination:
            raise ValueError("Source and destination cannot be the same.")
        self._source = value

    @property
    def destination(self):
        return self._destination

    @destination.setter
    def destination(self, value):
        if self._initialized and value is not None and self._source is not None and value == self._source:
            raise ValueError("Source and destination cannot be the same.")
        self._destination = value

    def __post_init__(self, _initialized):
        self._initialized = _initialized
        