#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import IntFlag
import sys
from typing import Any, List, Dict, Tuple
from submodule.clock import Clock
from utilities.common_utils import RsEnum, update_attributes
from .rs_device_resources import IO_Standard, IO_Standard_Coeff, RsDeviceResources, Power_Factor, PeripheralNotFoundException, PeripheralChannelNotFoundException, \
     PeripheralEndpointNotFoundException, PeripheralType
from .rs_message import RsMessage, RsMessageManager

class Peripherals_Usage(RsEnum):
    Boot  = 0, "Boot"
    Debug = 1, "Debug"
    App   = 2, "Application"

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
    MEDIUM = 2, "Medium"
    HIGH   = 3, "High"

class Dma_Source_Destination(RsEnum):
    NONE     = 0, "NONE"
    DDR      = 1, "DDR"
    OCM      = 2, "OCM"
    SPI_QSPI = 3, "SPI/QSPI"
    I2C      = 4, "I2C"
    FABRIC   = 5, "Fabric"

class PeripheralTarget(IntFlag):
    NONE   = 0
    ACPU   = 1
    BCPU   = 2
    FABRIC = 4
    DMA    = 8

def find_highest_bandwidth_peripheral_endpoint(context: 'IPeripheral') -> Tuple['Endpoint', 'Peripheral']:
    peripherals = context.get_submodule().get_peripherals()
    name = context.get_name()
    peripheral: IPeripheral = None
    endpoint: Endpoint = None
    for p in peripherals:
        for ep in p.get_endpoints() or []:
            if ep.name == name:
                if endpoint is None or ep.output.calculated_bandwidth > endpoint.output.calculated_bandwidth:
                    peripheral = p
                    endpoint = ep
    return endpoint, peripheral

def find_peripheral(context: 'IPeripheral', name: str) -> 'IPeripheral':
    for peripheral in context.get_submodule().get_peripherals():
        if peripheral.get_name() == name:
            return peripheral
    return None

def get_io_output_coeff(context: 'IPeripheral', voltage: float) -> List[float]:
    IO_STANDARD_COEFF = context.get_device_resources().get_IO_standard_coeff()
    for coeff in IO_STANDARD_COEFF:
        if coeff.io_standard in (IO_Standard.LVCMOS_1_8V_HR, IO_Standard.LVCMOS_2_5V, IO_Standard.LVCMOS_3_3V):
            if coeff.voltage == voltage:
                return coeff.output_ac, coeff.output_dc
    return 0.0, 0.0

def get_power_factor(POWER_FACTOR: List[Power_Factor], master_type: PeripheralType, slave_type: PeripheralType) -> float:
    factors = [elem.factor for elem in POWER_FACTOR if elem.master == master_type and elem.slave == slave_type]
    if factors:
        return sum(factors) / len(factors)
    return 0.0

def sanity_check(output: List[RsMessage], context: 'IPeripheral') -> bool:
    output.clear()
    if context.is_enabled() == False:
        output.append(RsMessageManager.get_message(106, { 'name' : context.get_name() }))
        return False
    return True

@dataclass
class Endpoint_Output:
    calculated_bandwidth: float = field(default=0.0)
    clock_frequency: int = field(default=0) # specific to FPGA_Complex only
    percentage: float = field(default=0.0) # specific to FPGA_Complex only
    noc_power: float = field(default=0.0)
    messages: List[RsMessage] = field(default_factory=list)

    def reset(self):
        self.messages.clear()
        self.calculated_bandwidth = 0.0
        self.clock_frequency = 0.0
        self.percentage = 0.0
        self.noc_power = 0.0

@dataclass
class Endpoint:
    name: str = field(default='')
    activity: Port_Activity = field(default=Port_Activity.IDLE)
    read_write_rate: float = field(default=0.5)
    toggle_rate: float = field(default=0.125)
    clock: str = field(default='') # specific to FPGA_Complex only
    output: Endpoint_Output = field(default_factory=Endpoint_Output)

    def set_properties(self, props: Dict[str, Any]) -> None:
        update_attributes(self, props)

@dataclass
class Channel_Output:
    calculated_bandwidth: float = field(default=0.0)
    noc_power: float = field(default=0.0)
    block_power: float = field(default=0.0)
    percentage: float = field(default=0.0)
    messages: List[RsMessage] = field(default_factory=list)

@dataclass
class Channel:
    enable: bool = field(default=False)
    name: str = field(default='')
    source: Dma_Source_Destination = field(default=Dma_Source_Destination.NONE)
    destination: Dma_Source_Destination = field(default=Dma_Source_Destination.NONE)
    activity: Dma_Activity = field(default=Dma_Activity.MEDIUM)
    read_write_rate: float = field(default=0.5)
    toggle_rate: float = field(default=0.125)
    output: Channel_Output = field(default_factory=Channel_Output)

    def set_properties(self, props: Dict[str, Any]) -> None:
        update_attributes(self, props)

class SubModule(ABC):
    @abstractmethod
    def get_device_resources(self) -> RsDeviceResources:
        pass

    @abstractmethod
    def get_peripherals(sef) -> List['Peripheral']:
        pass

    @abstractmethod
    def compute_output_power(self) -> None:
        pass

class Peripheral_SubModule(SubModule):

    def __init__(self, resources : RsDeviceResources):
        self.resources = resources
        self.total_interconnect_power = 0.0
        self.total_block_power = 0.0
        # todo: add peripherals for testing. actual configuration should be retrieved from device.xml when
        # this data is availiable
        self.peripherals : List[Peripheral] = [
            Peripheral(name='SPI/QSPI', type=PeripheralType.SPI, usage=Peripherals_Usage.Boot, targets=PeripheralTarget.ACPU | PeripheralTarget.BCPU | PeripheralTarget.FABRIC, context=self),
            Peripheral(name='JTAG', type=PeripheralType.JTAG, usage=Peripherals_Usage.Debug, targets=PeripheralTarget.ACPU | PeripheralTarget.BCPU, context=self),
            Peripheral(name='I2C', type=PeripheralType.I2C, usage=Peripherals_Usage.App, targets=PeripheralTarget.ACPU | PeripheralTarget.FABRIC, context=self),
            Peripheral(name='UART0 (BCPU)', type=PeripheralType.UART, index=0, usage=Peripherals_Usage.Debug, targets=PeripheralTarget.BCPU, context=self),
            Peripheral(name='UART1 (ACPU)', type=PeripheralType.UART, index=1, usage=Peripherals_Usage.Debug, targets=PeripheralTarget.ACPU, context=self),
            Peripheral(name='USB 2.0', type=PeripheralType.USB2, usage=Peripherals_Usage.App, targets=PeripheralTarget.ACPU | PeripheralTarget.FABRIC, context=self),
            Peripheral(name='GigE', type=PeripheralType.GIGE, usage=Peripherals_Usage.App, targets=PeripheralTarget.ACPU | PeripheralTarget.FABRIC, context=self),
            Peripheral(name="GPIO (BCPU)", type=PeripheralType.GPIO, index=0, usage=Peripherals_Usage.App, targets=PeripheralTarget.BCPU, enable=True, context=self),
            Peripheral(name="GPIO (ACPU)", type=PeripheralType.GPIO, index=1, usage=Peripherals_Usage.App, targets=PeripheralTarget.ACPU, enable=True, context=self),
            Peripheral(name="GPIO (Fabric)", type=PeripheralType.GPIO, index=2, usage=Peripherals_Usage.App, targets=PeripheralTarget.FABRIC, enable=True, context=self),
            Peripheral(name="PWM", type=PeripheralType.PWM, usage=Peripherals_Usage.App, enable=True, context=self),
            Peripheral(name="DDR", type=PeripheralType.DDR, index=0, usage=Peripherals_Usage.App, targets=PeripheralTarget.ACPU | PeripheralTarget.BCPU | PeripheralTarget.FABRIC, enable=False, context=self, init_props={ "data_rate" : 1333000000, "memory_type" : Memory_Type.DDR4 }),
            Peripheral(name="OCM", type=PeripheralType.OCM, index=1, usage=Peripherals_Usage.App, targets=PeripheralTarget.ACPU | PeripheralTarget.BCPU | PeripheralTarget.FABRIC, enable=False, context=self, init_props={ "data_rate" : 533000000, "memory_type" : Memory_Type.SRAM }),
            Peripheral(name='DMA', type=PeripheralType.DMA, enable=True, max_channels=4, context=self),
            Peripheral(name='N22 RISC-V', type=PeripheralType.BCPU, enable=True, max_endpoints=4, context=self),
            Peripheral(name='A45 RISC-V', type=PeripheralType.ACPU, enable=True, max_endpoints=4, context=self, init_props={ 'frequency' : 533000000 }),
            Peripheral(name='FPGA Complex', type=PeripheralType.FPGA_COMPLEX, enable=True, max_endpoints=4, context=self),
        ]

    def get_device_resources(self) -> RsDeviceResources:
        return self.resources

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

    def get_peripherals(self) -> List['Peripheral']:
        return self.peripherals

    def get_peripheral(self, type: PeripheralType, idx: int) -> 'Peripheral':
        for peripheral in self.peripherals:
            if peripheral.type == type and peripheral.index == idx:
                return peripheral
        raise PeripheralNotFoundException

    def compute_output_power(self) -> None:
        # complex periperals first
        for peripheral in [p for p in self.peripherals if p.type in (PeripheralType.ACPU, PeripheralType.BCPU, PeripheralType.FPGA_COMPLEX)]:
            peripheral.compute()

        # memory devices send
        for peripheral in [p for p in self.peripherals if p.type in (PeripheralType.DDR, PeripheralType.OCM)]:
            peripheral.compute()

        # simple periperals last
        for peripheral in [p for p in self.peripherals if p.type not in (PeripheralType.ACPU, PeripheralType.BCPU, PeripheralType.FPGA_COMPLEX, PeripheralType.DDR, PeripheralType.OCM)]:
            peripheral.compute()

class IPeripheral(ABC):
    @abstractmethod
    def is_enabled(self) -> bool:
        pass

    @abstractmethod
    def get_type(self) -> PeripheralType:
        pass

    @abstractmethod
    def get_name(self) -> str:
        pass

    @abstractmethod
    def get_usage(self) -> Peripherals_Usage:
        pass

    @abstractmethod
    def get_endpoints(self) -> List[Endpoint]:
        pass

    @abstractmethod
    def get_submodule(self) -> SubModule:
        pass

    @abstractmethod
    def get_channels(self) -> List[Channel]:
        pass

    @abstractmethod
    def get_bandwidth(self) -> float:
        pass

    @abstractmethod
    def get_device_resources(self) -> RsDeviceResources:
        pass

@dataclass
class ComputeObject:

    context: IPeripheral

    def get_context(self) -> IPeripheral:
        return self.context

    def get_properties(self) -> Dict[str, Any]:
        return {}

    def get_output(self) -> Dict[str, Any]:
        return {}

    def get_messages(self) -> List[RsMessage]:
        return []

    def get_bandwidth(self) -> float:
        return 0.0

    def set_properties(self, props: Dict[str, Any]) -> None:
        pass

    def compute(self) -> bool:
        return False

    @classmethod
    def get_compute_object(cls, type: PeripheralType, context: IPeripheral) -> 'ComputeObject':
        if type == PeripheralType.UART:
            return Uart0(context=context)
        elif type == PeripheralType.SPI:
            return Qspi0(context=context)
        elif type == PeripheralType.JTAG:
            return Jtag0(context=context)
        elif type == PeripheralType.I2C:
            return I2c0(context=context)
        elif type == PeripheralType.USB2:
            return Usb2_0(context=context)
        elif type == PeripheralType.GIGE:
            return GigE_0(context=context)
        elif type == PeripheralType.GPIO:
            return Gpio0(context=context)
        elif type == PeripheralType.PWM:
            return Pwm0(context=context)
        elif type == PeripheralType.DDR or type == PeripheralType.OCM:
            # DDR and OCM share the same compute object
            return Memory0(context=context)
        elif type == PeripheralType.BCPU:
            return N22_RISC_V_BCPU(context=context)
        elif type == PeripheralType.ACPU:
            return A45_RISC_V_ACPU(context=context)
        elif type == PeripheralType.FPGA_COMPLEX:
            return FPGA_Fabric(context=context)
        elif type == PeripheralType.DMA:
            return Dma0(context=context)
        return None

@dataclass
class Peripheral(IPeripheral):

    type: PeripheralType = field(default=PeripheralType.NONE)
    enable: bool = field(default=False)
    name: str = field(default='')
    usage: Peripherals_Usage = field(default=Peripherals_Usage.App)
    targets: PeripheralTarget = field(default=PeripheralTarget.NONE)
    index: int = field(default=0)
    context: SubModule = field(default=None)
    max_endpoints: int = field(default=0)
    max_channels: int = field(default=0)
    init_props: Dict[str, Any] = field(default=None)

    def __post_init__(self) -> None:
        self.object = ComputeObject.get_compute_object(self.type, self)
        self.endpoints: List[Endpoint] = [Endpoint() for _ in range(self.max_endpoints)] if self.max_endpoints > 0 else None
        self.channels: List[Channel] = [Channel(name=f'Channel {i+1}') for i in range(self.max_channels)] if self.max_channels > 0 else None
        if self.init_props:
            self.object.set_properties(self.init_props)

    def flatten(self, excludes: List[str] = ['object', 'context', 'max_endpoints', 'max_channels', 'init_props']) -> Dict[str, Any]:
        newobj = {}
        for key, value in { **self.__dict__, **self.get_properties(), \
                           'output': { **self.get_output(), 'messages': self.get_messages() } }.items():
            if key not in excludes:
                newobj[key] = value
        return newobj

    def is_enabled(self) -> bool:
        return self.enable

    def get_name(self) -> str:
        return self.name

    def get_type(self) -> PeripheralType:
        return self.type

    def get_usage(self) -> Peripherals_Usage:
        return self.usage

    def get_device_resources(self) -> RsDeviceResources:
        return self.context.get_device_resources()

    def get_properties(self) -> Dict[str, Any]:
        return self.object.get_properties()

    def get_output(self) -> Dict[str, Any]:
        return self.object.get_output()

    def get_messages(self) -> List[RsMessage]:
        return self.object.get_messages()

    def set_properties(self, props: Dict[str, Any]) -> None:
        self.object.set_properties(props)
        update_attributes(self, props)

    def get_bandwidth(self) -> float:
        return self.object.get_bandwidth()

    def get_endpoints(self) -> List[Endpoint]:
        return self.endpoints

    def get_endpoint(self, idx: int) -> Endpoint:
        if self.endpoints:
            if 0 <= idx < len(self.endpoints):
                return self.endpoints[idx]
        raise PeripheralEndpointNotFoundException

    def get_channels(self) -> List[Channel]:
        return self.channels

    def get_channel(self, idx: int) -> Endpoint:
        if self.channels:
            if 0 <= idx < len(self.channels):
                return self.channels[idx]
        raise PeripheralChannelNotFoundException

    def get_submodule(self) -> SubModule:
        return self.context

    def compute(self) -> bool:
        return self.object.compute()

@dataclass
class common_output_:
    calculated_bandwidth: float = field(default=0.0)
    block_power: float = field(default=0.0)
    percentage: float = field(default=0.0)

    def reset(self):
        self.calculated_bandwidth = 0.0
        self.block_power = 0.0
        self.percentage = 0.0

@dataclass
class Pwm0(ComputeObject):
    @dataclass
    class properties_:
        io_used: int
        io_standard: GpioStandard

    @dataclass
    class output_(common_output_):
        pass

    def __post_init__(self) -> None:
        self.properties = Gpio0.properties_(io_used=4, io_standard=GpioStandard.SSTL_1_8V_Class_I_HR)
        self.output = Gpio0.output_()
        self.messages: List[RsMessage] = []

    def get_properties(self) -> Dict[str, Any]:
        return self.properties.__dict__

    def get_output(self) -> Dict[str, Any]:
        return self.output.__dict__

    def get_messages(self) -> List[RsMessage]:
        return self.messages

    def set_properties(self, props: Dict[str, Any]) -> None:
        return update_attributes(self.properties, props)

    def compute(self) -> bool:
        self.messages.clear()
        self.output.reset()

        if self.properties.io_used <= 0:
            return False

        self.output.calculated_bandwidth = 0.0001 # hardcoded in excel
        self.output.block_power = self.properties.io_used * 0.001 # hardcoded in excel

        return True

@dataclass
class Dma0(ComputeObject):
    def compute(self) -> bool:
        # todo: populate output properties
        pass

@dataclass
class FPGA_Fabric(ComputeObject):
    def __post_init__(self) -> None:
        pass

    def compute(self) -> bool:
        resources = self.get_context().get_device_resources()
        NOC_POWER_FACTOR = resources.get_peripheral_noc_power_factor()
        VCC_CORE = resources.get_VCC_CORE()

        for endpoint in self.get_context().get_endpoints():
            endpoint.output.reset()
            if endpoint.name == '':
                continue

            peripheral = find_peripheral(self.get_context(), endpoint.name)
            if peripheral is None:
                endpoint.output.messages.append(RsMessageManager.get_message(305, { 'name': endpoint.name }))
                continue

            if peripheral.is_enabled() == False:
                endpoint.output.messages.append(RsMessageManager.get_message(304, { 'name': endpoint.name }))
                continue

            # find clock frequency
            clock = self.get_context().get_device_resources().get_clock(endpoint.clock)
            if clock is None:
                endpoint.output.messages.append(RsMessageManager.get_message(301, { 'clock': endpoint.clock }))
                continue

            if peripheral.get_type() == PeripheralType.GPIO:
                bandwidth = peripheral.get_bandwidth() * (clock.frequency / 1000000.0)
            elif peripheral.get_type() in (PeripheralType.DDR, PeripheralType.OCM):
                bandwidth = min((clock.frequency / 1000000.0) * 8, peripheral.get_bandwidth())
            else:
                bandwidth = peripheral.get_bandwidth()

            # calculate bandwidth
            if endpoint.activity == Port_Activity.HIGH:
                calculated_bandwidth = bandwidth * 0.75
            elif endpoint.activity == Port_Activity.MEDIUM:
                calculated_bandwidth = bandwidth * 0.5
            elif endpoint.activity == Port_Activity.LOW:
                calculated_bandwidth = bandwidth * 0.25
            else:
                calculated_bandwidth = 0

            # calculate noc power
            power_factor = get_power_factor(NOC_POWER_FACTOR, self.get_context().get_type(), peripheral.get_type())
            noc_power = calculated_bandwidth * endpoint.toggle_rate * power_factor * (VCC_CORE ** 2)

            # update output
            endpoint.output.clock_frequency = clock.frequency
            endpoint.output.calculated_bandwidth = calculated_bandwidth
            endpoint.output.noc_power = noc_power

            # debug info
            print(f'[DEBUG] FPGA: {self.get_context().get_name() = }', file=sys.stderr)
            print(f'[DEBUG] FPGA:   {peripheral.get_name() = }', file=sys.stderr)
            print(f'[DEBUG] FPGA:   {power_factor = }', file=sys.stderr)
            print(f'[DEBUG] FPGA:   {endpoint.activity = }', file=sys.stderr)
            print(f'[DEBUG] FPGA:   {endpoint.toggle_rate = }', file=sys.stderr)
            print(f'[DEBUG] FPGA:   {VCC_CORE = }', file=sys.stderr)
            print(f'[DEBUG] FPGA:   {endpoint.output.calculated_bandwidth = }', file=sys.stderr)
            print(f'[DEBUG] FPGA:   {endpoint.output.noc_power = }', file=sys.stderr)

        return True

@dataclass
class A45_RISC_V_ACPU(ComputeObject):
    @dataclass
    class properties_:
        frequency: int
        load: A45_Load

    @dataclass
    class output_:
        block_power: float

        def reset(self):
            self.block_power = 0.0

    def __post_init__(self) -> None:
        self.properties = A45_RISC_V_ACPU.properties_(frequency=0, load=A45_Load.MEDIUM)
        self.output = A45_RISC_V_ACPU.output_(block_power=0.0)
        self.messages: List[RsMessage] = []

    def get_properties(self) -> Dict[str, Any]:
        return self.properties.__dict__

    def get_output(self) -> Dict[str, Any]:
        return self.output.__dict__

    def get_messages(self) -> List[RsMessage]:
        return self.messages

    def set_properties(self, props: Dict[str, Any]) -> None:
        return update_attributes(self.properties, props)

    def compute(self) -> bool:
        self.messages.clear()
        self.output.reset()

        if self.get_context().is_enabled() == False:
            self.messages.append(RsMessageManager.get_message(106, {"name" : self.get_context().get_name()}))
            return False

        resources = self.get_context().get_device_resources()
        NOC_POWER_FACTOR = resources.get_peripheral_noc_power_factor()
        VCC_CORE = resources.get_VCC_CORE()
        ACPU_CLK_FACTOR = resources.get_ACPU_CLK_FACTOR()

        if self.properties.load == A45_Load.HIGH:
            LOAD_FACTOR = resources.get_ACPU_HIGH_LOAD_FACTOR()
        elif self.properties.load == A45_Load.MEDIUM:
            LOAD_FACTOR = resources.get_ACPU_MEDIUM_LOAD_FACTOR()
        elif self.properties.load == A45_Load.LOW:
            LOAD_FACTOR = resources.get_ACPU_LOW_LOAD_FACTOR()
        else:
            LOAD_FACTOR = 0.0

        for endpoint in self.get_context().get_endpoints():
            endpoint.output.reset()
            if endpoint.name == '':
                continue

            peripheral = find_peripheral(self.get_context(), endpoint.name)
            if peripheral is None:
                endpoint.output.messages.append(RsMessageManager.get_message(305, { 'name' : endpoint.name }))
                continue

            if peripheral.is_enabled() == False:
                endpoint.output.messages.append(RsMessageManager.get_message(304, { 'name' : endpoint.name }))
                continue

            if peripheral.get_type() == PeripheralType.GPIO:
                bandwidth = peripheral.get_bandwidth() * 200 # no idea hardcoded in excel
            else:
                bandwidth = peripheral.get_bandwidth()

            # calculate bandwidth
            if endpoint.activity == Port_Activity.HIGH:
                calculated_bandwidth = bandwidth * 0.75
            elif endpoint.activity == Port_Activity.MEDIUM:
                calculated_bandwidth = bandwidth * 0.5
            elif endpoint.activity == Port_Activity.LOW:
                calculated_bandwidth = bandwidth * 0.25
            else:
                calculated_bandwidth = 0

            # calculate noc power
            power_factor = get_power_factor(NOC_POWER_FACTOR, self.get_context().get_type(), peripheral.get_type())
            noc_power = calculated_bandwidth * endpoint.toggle_rate * power_factor * (VCC_CORE ** 2)

            # update output
            endpoint.output.calculated_bandwidth = calculated_bandwidth
            endpoint.output.noc_power = noc_power

            # debug info
            print(f'[DEBUG] ACPU: {self.get_context().get_name() = }', file=sys.stderr)
            print(f'[DEBUG] ACPU:   {peripheral.get_name() = }', file=sys.stderr)
            print(f'[DEBUG] ACPU:   {power_factor = }', file=sys.stderr)
            print(f'[DEBUG] ACPU:   {endpoint.activity = }', file=sys.stderr)
            print(f'[DEBUG] ACPU:   {endpoint.toggle_rate = }', file=sys.stderr)
            print(f'[DEBUG] ACPU:   {VCC_CORE = }', file=sys.stderr)
            print(f'[DEBUG] ACPU:   {endpoint.output.calculated_bandwidth = }', file=sys.stderr)
            print(f'[DEBUG] ACPU:   {endpoint.output.noc_power = }', file=sys.stderr)

        # compute block power
        block_power = (LOAD_FACTOR + ACPU_CLK_FACTOR) * (self.properties.frequency / 1000000.0) * VCC_CORE ** 2

        # update output property
        self.output.block_power = block_power
        return True

@dataclass
class N22_RISC_V_BCPU(ComputeObject):
    @dataclass
    class properties_:
        encryption_used: bool
        clock: N22_RISC_V_Clock

    @dataclass
    class output_:
        boot_mode: str
        active_power: float
        boot_power: float

        def reset(self):
            self.boot_mode = ''
            self.active_power = 0.0
            self.boot_power = 0.0

    def __post_init__(self) -> None:
        self.properties = N22_RISC_V_BCPU.properties_(encryption_used=True, clock=N22_RISC_V_Clock.PLL_233MHz)
        self.output = N22_RISC_V_BCPU.output_(boot_mode='', active_power=0.0, boot_power=0.0)
        self.messages: List[RsMessage] = []

    def get_properties(self) -> Dict[str, Any]:
        return self.properties.__dict__

    def get_output(self) -> Dict[str, Any]:
        return self.output.__dict__

    def get_messages(self) -> List[RsMessage]:
        return self.messages

    def set_properties(self, props: Dict[str, Any]) -> None:
        return update_attributes(self.properties, props)

    def compute(self) -> bool:
        self.messages.clear()
        self.output.reset()

        peripherals = self.get_context().get_submodule().get_peripherals()
        resources = self.get_context().get_device_resources()
        NOC_POWER_FACTOR = resources.get_peripheral_noc_power_factor()
        VCC_CORE = resources.get_VCC_CORE()
        BCPU_CLK_FACTOR = resources.get_BCPU_CLK_FACTOR()
        BCPU_LOW_LOAD_FACTOR = resources.get_BCPU_LOW_LOAD_FACTOR()
        BCPU_HIGH_LOAD_FACTOR = resources.get_BCPU_HIGH_LOAD_FACTOR()

        # determine boot mode (assume first SPI device)
        spi_boot_devices = [peripheral for peripheral in self.get_context().get_submodule().get_peripherals() \
                            if peripheral.get_type() == PeripheralType.SPI]
        if spi_boot_devices:
            if 'QSPI' in spi_boot_devices[0].get_properties()['clock_frequency'].name:
                self.output.boot_mode = 'QSPI'
            else:
                self.output.boot_mode = 'SPI'
        else:
            self.output.boot_mode = '<UNK>'

        for endpoint in self.get_context().get_endpoints():
            endpoint.output.reset()
            if endpoint.name == '':
                continue

            peripheral = find_peripheral(self.get_context(), endpoint.name)
            if peripheral is None:
                endpoint.output.messages.append(RsMessageManager.get_message(305, { 'name' : endpoint.name }))
                continue

            if peripheral.get_type() != PeripheralType.GPIO and peripheral.is_enabled() == False:
                endpoint.output.messages.append(RsMessageManager.get_message(304, { 'name' : endpoint.name }))
                continue

            if peripheral.get_type() == PeripheralType.GPIO:
                bandwidth = peripheral.get_bandwidth() * 200 # no idea hardcoded in excel
            else:
                bandwidth = peripheral.get_bandwidth()

            # calculate bandwidth
            if endpoint.activity == Port_Activity.HIGH:
                calculated_bandwidth = bandwidth * 0.75
            elif endpoint.activity == Port_Activity.MEDIUM:
                calculated_bandwidth = bandwidth * 0.5
            elif endpoint.activity == Port_Activity.LOW:
                calculated_bandwidth = bandwidth * 0.25
            else:
                calculated_bandwidth = 0

            # cap bandwidth
            calculated_bandwidth = min(266.0 * 4, calculated_bandwidth)

            # calculate noc power
            power_factor = get_power_factor(NOC_POWER_FACTOR, self.get_context().get_type(), peripheral.get_type())
            noc_power = calculated_bandwidth * endpoint.toggle_rate * power_factor * (VCC_CORE ** 2)

            # update output
            endpoint.output.calculated_bandwidth = calculated_bandwidth
            endpoint.output.noc_power = noc_power

            # debug info
            print(f'[DEBUG] BCPU: {self.get_context().get_name() = }', file=sys.stderr)
            print(f'[DEBUG] BCPU:   {peripheral.get_name() = }', file=sys.stderr)
            print(f'[DEBUG] BCPU:   {power_factor = }', file=sys.stderr)
            print(f'[DEBUG] BCPU:   {endpoint.activity = }', file=sys.stderr)
            print(f'[DEBUG] BCPU:   {endpoint.toggle_rate = }', file=sys.stderr)
            print(f'[DEBUG] BCPU:   {VCC_CORE = }', file=sys.stderr)
            print(f'[DEBUG] BCPU:   {endpoint.output.calculated_bandwidth = }', file=sys.stderr)
            print(f'[DEBUG] BCPU:   {endpoint.output.noc_power = }', file=sys.stderr)

        # compute active power
        if self.properties.clock == N22_RISC_V_Clock.PLL_233MHz:
            clock_freq = 233
        elif self.properties.clock == N22_RISC_V_Clock.RC_OSC_50MHz:
            clock_freq = 50
        else:
            # default N22_RISC_V_Clock.BOOT_Clock_40MHz
            clock_freq = 40
        self.output.active_power = clock_freq * VCC_CORE ** 2 * (BCPU_LOW_LOAD_FACTOR + BCPU_CLK_FACTOR)

        # compute boot power
        power_factor = get_power_factor(NOC_POWER_FACTOR, self.get_context().get_type(), PeripheralType.CONFIG)
        boot_power = clock_freq * VCC_CORE ** 2 * (BCPU_HIGH_LOAD_FACTOR + power_factor + BCPU_CLK_FACTOR)
        if self.properties.encryption_used:
            self.output.boot_power = boot_power + 0.005
        else:
            self.output.boot_power = boot_power
        return True

@dataclass
class Memory0(ComputeObject):
    @dataclass
    class properties_:
        memory_type: Memory_Type
        data_rate: int
        width: int

    @dataclass
    class output_:
        write_bandwidth: float
        read_bandwidth: float
        block_power: float
        percentage: float

        def reset(self):
            self.write_bandwidth = 0.0
            self.read_bandwidth = 0.0
            self.block_power = 0.0
            self.percentage = 0.0

    def __post_init__(self) -> None:
        self.properties = Memory0.properties_(memory_type=Memory_Type.DDR4, data_rate=1333000000, width=32)
        self.output = Memory0.output_(write_bandwidth=0.0, read_bandwidth=0.0, block_power=0.0, percentage=0.0)
        self.messages: List[RsMessage] = []

    def get_properties(self) -> Dict[str, Any]:
        return self.properties.__dict__

    def get_output(self) -> Dict[str, Any]:
        return self.output.__dict__

    def get_messages(self) -> List[RsMessage]:
        return self.messages

    def set_properties(self, props: Dict[str, Any]) -> None:
        return update_attributes(self.properties, props)

    def get_bandwidth(self) -> float:
        bandwidth = (self.properties.data_rate / 1000000.0) * self.properties.width / 8.0
        return bandwidth

    def get_ddr_io_power_coeff(self, io_std: IO_Standard) -> IO_Standard_Coeff:
        IO_STANDARD_COEFF = self.get_context().get_device_resources().get_IO_standard_coeff()
        for coeff in IO_STANDARD_COEFF:
            if coeff.io_standard == io_std:
                return coeff

    def compute_ddr_io_power(self, read_bandwidth: float, write_bandwidth: float, read_write_rate: float) -> float:
        if self.properties.memory_type == Memory_Type.DDR4:
            io_coeff = self.get_ddr_io_power_coeff(IO_Standard.POD_1_2V)
        else:
            io_coeff = self.get_ddr_io_power_coeff(IO_Standard.SSTL_1_5V_Class_I)
        read_power = read_bandwidth / 8 * io_coeff.input_ac * (self.properties.width + 10)
        write_power = write_bandwidth / 8 * io_coeff.output_ac * (self.properties.width + 10)
        a = (1 - read_write_rate) * io_coeff.input_dc * (self.properties.width + 10)
        b = read_write_rate * io_coeff.output_dc * (self.properties.width + 10)
        return read_power + write_power + a + b

    def compute(self) -> bool:
        self.output.reset()

        if sanity_check(self.messages, self.get_context()) == False:
            return False

        endpoint, _ = find_highest_bandwidth_peripheral_endpoint(self.get_context())
        if endpoint is None:
            self.messages.append(RsMessageManager.get_message(203, {"name" : self.get_context().get_name()}))
            return False

        resources = self.get_context().get_device_resources()
        VCC_CORE = resources.get_VCC_CORE()
        ACLK_FACTOR = resources.get_ACLK_FACTOR()
        DDR_CLK_FACTOR = resources.get_DDR_CLK_FACTOR()
        DDR_WRITE_FACTOR = resources.get_DDR_WRITE_FACTOR()
        DDR_READ_FACTOR = resources.get_DDR_READ_FACTOR()
        SRAM_WRITE_FACTOR = resources.get_SRAM_WRITE_FACTOR()
        SRAM_READ_FACTOR = resources.get_SRAM_READ_FACTOR()

        # highest calculated bandwidth
        bandwidth = endpoint.output.calculated_bandwidth

        # compute write bandwidth
        write_bandwidth = bandwidth * endpoint.read_write_rate
        read_bandwidth = bandwidth * (1.0 - endpoint.read_write_rate)

        # compute block power
        if self.get_context().get_type() == PeripheralType.DDR:
            block_power = VCC_CORE ** 2 * (((self.properties.data_rate / 1000000.0) * DDR_CLK_FACTOR) + (533 * ACLK_FACTOR / 2) + \
                                           (write_bandwidth * DDR_WRITE_FACTOR) + (read_bandwidth * DDR_READ_FACTOR)) + \
                                            self.compute_ddr_io_power(read_bandwidth, write_bandwidth, endpoint.read_write_rate)
        else:
            block_power = VCC_CORE ** 2 * ((533 * ACLK_FACTOR / 2) + (write_bandwidth * SRAM_WRITE_FACTOR) + \
                                           (read_bandwidth * SRAM_READ_FACTOR))

        # update output
        self.output.write_bandwidth = write_bandwidth
        self.output.read_bandwidth = read_bandwidth
        self.output.block_power = block_power

        # debug info
        print(f'[DEBUG] MEM0: {bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] MEM0: {self.properties.data_rate / 1000000.0 = }', file=sys.stderr)
        print(f'[DEBUG] MEM0: {endpoint.read_write_rate = }', file=sys.stderr)
        print(f'[DEBUG] MEM0: {VCC_CORE = }', file=sys.stderr)
        print(f'[DEBUG] MEM0: {ACLK_FACTOR = }', file=sys.stderr)
        print(f'[DEBUG] MEM0: {SRAM_WRITE_FACTOR = }', file=sys.stderr)
        print(f'[DEBUG] MEM0: {SRAM_READ_FACTOR = }', file=sys.stderr)
        print(f'[DEBUG] MEM0: {self.output.write_bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] MEM0: {self.output.read_bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] MEM0: {self.output.block_power = }', file=sys.stderr)

        return True

@dataclass
class Gpio0(ComputeObject):
    @dataclass
    class properties_:
        io_used: int
        io_standard: GpioStandard

    @dataclass
    class output_(common_output_):
        pass

    def __post_init__(self) -> None:
        self.properties = Gpio0.properties_(io_used=0, io_standard=GpioStandard.SSTL_1_8V_Class_I_HR)
        self.output = Gpio0.output_()
        self.messages: List[RsMessage] = []

    def get_properties(self) -> Dict[str, Any]:
        return self.properties.__dict__

    def get_output(self) -> Dict[str, Any]:
        return self.output.__dict__

    def get_messages(self) -> List[RsMessage]:
        return self.messages

    def get_bandwidth(self) -> float:
        return self.properties.io_used / 8.0

    def get_freq(self, peripheral: Peripheral, endpoint: Endpoint) -> int:
        if peripheral.get_type() == PeripheralType.BCPU:
            return 233000000 # hardcoded in excel
        elif peripheral.get_type() == PeripheralType.ACPU:
            return 533000000 # hardcoded in excel
        elif peripheral.get_type() == PeripheralType.FPGA_COMPLEX:
            clock = self.get_context().get_device_resources().get_clock(endpoint.clock)
            return clock.frequency if clock else 0
        return 0

    def set_properties(self, props: Dict[str, Any]) -> None:
        return update_attributes(self.properties, props)

    def compute(self) -> bool:
        self.messages.clear()
        self.output.reset()

        if self.properties.io_used <= 0:
            return False

        endpoint, peripheral = find_highest_bandwidth_peripheral_endpoint(self.get_context())
        if endpoint is None:
            self.messages.append(RsMessageManager.get_message(203, { "name" : self.get_context().get_name() }))
            return False

        # highest calculated bandwidth
        bandwidth = endpoint.output.calculated_bandwidth

        # compule block power
        resources = self.get_context().get_device_resources()
        VCC_CORE = resources.get_VCC_CORE()
        VCC_BOOT_IO = resources.get_VCC_BOOT_IO()
        OUTPUT_AC, OUTPUT_DC = get_io_output_coeff(self.get_context(), VCC_BOOT_IO)
        GPIO_CLK_FACTOR = resources.get_GPIO_CLK_FACTOR()
        GPIO_SWITCHING_FACTOR = resources.get_GPIO_SWITCHING_FACTOR()
        GPIO_IO_FACTOR = resources.get_GPIO_IO_FACTOR()

        # core power calculation
        clock_frequency = self.get_freq(peripheral, endpoint)
        core_power = ((GPIO_CLK_FACTOR * (clock_frequency / 1000000.0)) + (GPIO_SWITCHING_FACTOR * bandwidth * self.properties.io_used)) * VCC_CORE ** 2

        if peripheral.get_type() == PeripheralType.BCPU:
            io_core_power = GPIO_IO_FACTOR * bandwidth * self.properties.io_used * VCC_CORE ** 2
        elif peripheral.get_type() == PeripheralType.ACPU:
            io_core_power = GPIO_IO_FACTOR * bandwidth * endpoint.toggle_rate * self.properties.io_used * VCC_CORE ** 2
        elif peripheral.get_type() == PeripheralType.FPGA_COMPLEX:
            io_core_power = GPIO_IO_FACTOR * bandwidth * endpoint.toggle_rate * VCC_CORE ** 2

        io_vcco_power = ((OUTPUT_AC * bandwidth * endpoint.toggle_rate) + OUTPUT_DC) * self.properties.io_used * VCC_BOOT_IO ** 2
        io_vcc_aux_power = io_vcco_power * 0.1

        # update output properties
        self.output.calculated_bandwidth = bandwidth
        self.output.block_power = core_power + io_core_power + io_vcco_power + io_vcc_aux_power

        # debug info
        print(f'[DEBUG] GPIO: {bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] GPIO: {clock_frequency = }', file=sys.stderr)
        print(f'[DEBUG] GPIO: {endpoint.toggle_rate = }', file=sys.stderr)
        print(f'[DEBUG] GPIO: {endpoint.toggle_rate * bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] GPIO: {core_power = }', file=sys.stderr)
        print(f'[DEBUG] GPIO: {io_core_power = }', file=sys.stderr)
        print(f'[DEBUG] GPIO: {io_vcco_power = }', file=sys.stderr)
        print(f'[DEBUG] GPIO: {io_vcc_aux_power = }', file=sys.stderr)
        print(f'[DEBUG] GPIO: {self.output.calculated_bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] GPIO: {self.output.block_power = }', file=sys.stderr)

        return True

@dataclass
class Usb2_0(ComputeObject):
    @dataclass
    class properties_:
        bit_rate: Usb_Speed

    @dataclass
    class output_(common_output_):
        pass

    @dataclass
    class bandwidth_:
        type: Usb_Speed
        bandwidth: float
        frequency: int

    def __post_init__(self) -> None:
        self.properties = Usb2_0.properties_(bit_rate=Usb_Speed.Full_Speed_480Mbps)
        self.output = Usb2_0.output_()
        self.messages: List[RsMessage] = []
        self.bandwidth_table = [
            Usb2_0.bandwidth_(type=Usb_Speed.High_Speed_12Mbps , bandwidth=1.5, frequency= 12000000),
            Usb2_0.bandwidth_(type=Usb_Speed.Full_Speed_480Mbps, bandwidth=60 , frequency=480000000),
        ]

    def get_properties(self) -> Dict[str, Any]:
        return self.properties.__dict__

    def get_output(self) -> Dict[str, Any]:
        return self.output.__dict__

    def get_messages(self) -> List[RsMessage]:
        return self.messages

    def get_perf(self) -> bandwidth_:
        for row in self.bandwidth_table:
            if row.type == self.properties.bit_rate:
                return row

    def get_bandwidth(self) -> float:
        row = self.get_perf()
        if row:
            return row.bandwidth
        return 0.0

    def get_freq(self) -> int:
        row = self.get_perf()
        if row:
            return row.frequency
        return 0

    def set_properties(self, props: Dict[str, Any]) -> None:
        return update_attributes(self.properties, props)

    def compute(self) -> bool:
        self.output.reset()

        if sanity_check(self.messages, self.get_context()) == False:
            return False

        endpoint, _ = find_highest_bandwidth_peripheral_endpoint(self.get_context())
        if endpoint is None:
            self.messages.append(RsMessageManager.get_message(203, {"name" : self.get_context().get_name()}))
            return False

        # highest calculated bandwidth
        bandwidth = endpoint.output.calculated_bandwidth

        # compule block power
        resources = self.get_context().get_device_resources()
        VCC_CORE = resources.get_VCC_CORE()
        USB2_CLK_FACTOR = resources.get_USB2_CLK_FACTOR()
        USB2_SWITCHING_FACTOR = resources.get_USB2_SWITCHING_FACTOR()
        USB2_IO_FACTOR = resources.get_USB2_IO_FACTOR()

        # core power calculation
        core_power = ((USB2_CLK_FACTOR * (self.get_freq() / 1000000.0)) + (USB2_SWITCHING_FACTOR * bandwidth)) * VCC_CORE ** 2
        io_core_power = USB2_IO_FACTOR * bandwidth * endpoint.toggle_rate * VCC_CORE ** 2

        # update output properties
        self.output.calculated_bandwidth = bandwidth
        self.output.block_power = core_power + io_core_power

        # debug info
        print(f'[DEBUG] USB2: {bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] USB2: {self.get_freq() / 1000000.0 = }', file=sys.stderr)
        print(f'[DEBUG] USB2: {endpoint.toggle_rate = }', file=sys.stderr)
        print(f'[DEBUG] USB2: {endpoint.toggle_rate * bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] USB2: {core_power = }', file=sys.stderr)
        print(f'[DEBUG] USB2: {io_core_power = }', file=sys.stderr)
        print(f'[DEBUG] USB2: {self.output.calculated_bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] USB2: {self.output.block_power = }', file=sys.stderr)

        return True

@dataclass
class GigE_0(ComputeObject):
    @dataclass
    class properties_:
        bit_rate: Gige_Speed

    @dataclass
    class output_(common_output_):
        pass

    @dataclass
    class bandwidth_:
        type: Gige_Speed
        bitrate: int
        frequency: int

    def __post_init__(self) -> None:
        self.properties = GigE_0.properties_(bit_rate=Gige_Speed.Gige_100Mbps)
        self.output = GigE_0.output_()
        self.messages: List[RsMessage] = []
        self.bandwidth_table = [
            GigE_0.bandwidth_(type=Gige_Speed.Gige_10Mbps  , bitrate=  10000000, frequency=  2500000),
            GigE_0.bandwidth_(type=Gige_Speed.Gige_100Mbps , bitrate= 100000000, frequency= 25000000),
            GigE_0.bandwidth_(type=Gige_Speed.Gige_1000Mbps, bitrate=1000000000, frequency=125000000),
        ]

    def get_properties(self) -> Dict[str, Any]:
        return self.properties.__dict__

    def get_output(self) -> Dict[str, Any]:
        return self.output.__dict__

    def get_messages(self) -> List[RsMessage]:
        return self.messages

    def get_perf(self) -> bandwidth_:
        for row in self.bandwidth_table:
            if row.type == self.properties.bit_rate:
                return row

    def get_bandwidth(self) -> float:
        row = self.get_perf()
        if row:
            return (row.bitrate / 1000000.0) / 8.0
        return 0.0

    def get_freq(self) -> int:
        row = self.get_perf()
        if row:
            return row.frequency
        return 0

    def set_properties(self, props: Dict[str, Any]) -> None:
        return update_attributes(self.properties, props)

    def compute(self) -> bool:
        self.output.reset()

        if sanity_check(self.messages, self.get_context()) == False:
            return False

        endpoint, _ = find_highest_bandwidth_peripheral_endpoint(self.get_context())
        if endpoint is None:
            self.messages.append(RsMessageManager.get_message(203, {"name" : self.get_context().get_name()}))
            return False

        # highest calculated bandwidth
        bandwidth = endpoint.output.calculated_bandwidth

        # compule block power
        resources = self.get_context().get_device_resources()
        VCC_CORE = resources.get_VCC_CORE()
        GIGE_CLK_FACTOR = resources.get_GIGE_CLK_FACTOR()
        GIGE_SWITCHING_FACTOR = resources.get_GIGE_SWITCHING_FACTOR()
        GIGE_IO_FACTOR = resources.get_GIGE_IO_FACTOR()

        # core power calculation
        core_power = ((GIGE_CLK_FACTOR * (self.get_freq() / 1000000.0)) + (GIGE_SWITCHING_FACTOR * bandwidth)) * VCC_CORE ** 2
        io_core_power = GIGE_IO_FACTOR * bandwidth * endpoint.toggle_rate * VCC_CORE ** 2

        # update output properties
        self.output.calculated_bandwidth = bandwidth
        self.output.block_power = core_power + io_core_power

        # debug info
        print(f'[DEBUG] GIGE: {bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] GIGE: {self.get_freq() / 1000000.0 = }', file=sys.stderr)
        print(f'[DEBUG] GIGE: {endpoint.toggle_rate = }', file=sys.stderr)
        print(f'[DEBUG] GIGE: {endpoint.toggle_rate * bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] GIGE: {core_power = }', file=sys.stderr)
        print(f'[DEBUG] GIGE: {io_core_power = }', file=sys.stderr)
        print(f'[DEBUG] GIGE: {self.output.calculated_bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] GIGE: {self.output.block_power = }', file=sys.stderr)

        return True

@dataclass
class I2c0(ComputeObject):
    @dataclass
    class properties_:
        clock_frequency: I2c_Speed

    @dataclass
    class output_(common_output_):
        pass

    @dataclass
    class bandwidth_:
        type: I2c_Speed
        bandwidth: float
        frequency: int

    def __post_init__(self) -> None:
        self.properties = I2c0.properties_(clock_frequency=I2c_Speed.Standard_100Kbps)
        self.output = I2c0.output_()
        self.messages: List[RsMessage] = []
        self.bandwidth_table = [
            I2c0.bandwidth_(type=I2c_Speed.Standard_100Kbps, bandwidth=0.0125, frequency= 100000),
            I2c0.bandwidth_(type=I2c_Speed.Fast_400Kbps    , bandwidth=0.05  , frequency= 400000),
            I2c0.bandwidth_(type=I2c_Speed.Fast_Plus_1Mbps , bandwidth=0.125 , frequency=1000000),
        ]

    def get_properties(self) -> Dict[str, Any]:
        return self.properties.__dict__

    def get_output(self) -> Dict[str, Any]:
        return self.output.__dict__

    def get_messages(self) -> List[RsMessage]:
        return self.messages

    def get_perf(self) -> bandwidth_:
        for row in self.bandwidth_table:
            if row.type == self.properties.clock_frequency:
                return row

    def get_bandwidth(self) -> float:
        row = self.get_perf()
        if row:
            return row.bandwidth
        return 0.0

    def get_freq(self) -> int:
        row = self.get_perf()
        if row:
            return row.frequency
        return 0

    def set_properties(self, props: Dict[str, Any]) -> None:
        return update_attributes(self.properties, props)

    def compute(self) -> bool:
        self.output.reset()

        if sanity_check(self.messages, self.get_context()) == False:
            return False

        endpoint, _ = find_highest_bandwidth_peripheral_endpoint(self.get_context())
        if endpoint is None:
            self.messages.append(RsMessageManager.get_message(203, {"name" : self.get_context().get_name()}))
            return False

        # highest calculated bandwidth
        bandwidth = endpoint.output.calculated_bandwidth

        # compule block power
        resources = self.get_context().get_device_resources()
        VCC_CORE = resources.get_VCC_CORE()
        VCC_BOOT_IO = resources.get_VCC_BOOT_IO()
        OUTPUT_AC, OUTPUT_DC = get_io_output_coeff(self.get_context(), VCC_BOOT_IO)
        I2C_CLK_FACTOR = resources.get_I2C_CLK_FACTOR()
        I2C_SWITCHING_FACTOR = resources.get_I2C_SWITCHING_FACTOR()
        I2C_IO_FACTOR = resources.get_I2C_IO_FACTOR()

        # core power calculation
        core_power = ((I2C_CLK_FACTOR * (self.get_freq() / 1000000.0)) + (I2C_SWITCHING_FACTOR * bandwidth)) * VCC_CORE ** 2
        io_core_power = I2C_IO_FACTOR * bandwidth * endpoint.toggle_rate * VCC_CORE ** 2
        io_vcco_power = ((OUTPUT_AC * bandwidth * endpoint.toggle_rate) + OUTPUT_DC) * 2 * VCC_BOOT_IO ** 2
        io_vcc_aux_power = io_vcco_power * 0.1

        # update output properties
        self.output.calculated_bandwidth = bandwidth
        self.output.block_power = core_power + io_core_power + io_vcco_power + io_vcc_aux_power

        # debug info
        print(f'[DEBUG] I2C: {bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] I2C: {self.get_freq() / 1000000.0 = }', file=sys.stderr)
        print(f'[DEBUG] I2C: {endpoint.toggle_rate = }', file=sys.stderr)
        print(f'[DEBUG] I2C: {endpoint.toggle_rate * bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] I2C: {core_power = }', file=sys.stderr)
        print(f'[DEBUG] I2C: {io_core_power = }', file=sys.stderr)
        print(f'[DEBUG] I2C: {io_vcco_power = }', file=sys.stderr)
        print(f'[DEBUG] I2C: {io_vcc_aux_power = }', file=sys.stderr)
        print(f'[DEBUG] I2C: {self.output.calculated_bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] I2C: {self.output.block_power = }', file=sys.stderr)

        return True

@dataclass
class Jtag0(ComputeObject):
    @dataclass
    class properties_:
        clock_frequency: Jtag_Clock_Frequency

    @dataclass
    class output_(common_output_):
        pass

    @dataclass
    class bandwidth_:
        type: Jtag_Clock_Frequency
        frequency: int

    def __post_init__(self) -> None:
        self.properties = Jtag0.properties_(clock_frequency=Jtag_Clock_Frequency.JTAG_10Mbps)
        self.output = Jtag0.output_()
        self.messages: List[RsMessage] = []
        self.bandwidth_table = [
            Jtag0.bandwidth_(type=Jtag_Clock_Frequency.JTAG_10Mbps, frequency=10000000),
            Jtag0.bandwidth_(type=Jtag_Clock_Frequency.JTAG_20Mbps, frequency=20000000),
            Jtag0.bandwidth_(type=Jtag_Clock_Frequency.JTAG_40Mbps, frequency=40000000),
        ]

    def get_properties(self) -> Dict[str, Any]:
        return self.properties.__dict__

    def get_output(self) -> Dict[str, Any]:
        return self.output.__dict__

    def get_messages(self) -> List[RsMessage]:
        return self.messages

    def get_perf(self) -> bandwidth_:
        for row in self.bandwidth_table:
            if row.type == self.properties.clock_frequency:
                return row

    def get_bandwidth(self) -> float:
        row = self.get_perf()
        if row:
            return (row.frequency / 1000000.0) / 8.0
        return 0.0

    def get_freq(self) -> int:
        row = self.get_perf()
        if row:
            return row.frequency
        return 0

    def set_properties(self, props: Dict[str, Any]) -> None:
        return update_attributes(self.properties, props)

    def compute(self) -> bool:
        self.output.reset()

        if sanity_check(self.messages, self.get_context()) == False:
            return False

        endpoint, _ = find_highest_bandwidth_peripheral_endpoint(self.get_context())
        if endpoint is None:
            self.messages.append(RsMessageManager.get_message(203, {"name" : self.get_context().get_name()}))
            return False

        # highest calculated bandwidth
        bandwidth = endpoint.output.calculated_bandwidth

        # compule block power
        resources = self.get_context().get_device_resources()
        VCC_CORE = resources.get_VCC_CORE()
        VCC_BOOT_IO = resources.get_VCC_BOOT_IO()
        OUTPUT_AC, OUTPUT_DC = get_io_output_coeff(self.get_context(), VCC_BOOT_IO)
        JTAG_CLK_FACTOR = resources.get_JTAG_CLK_FACTOR()
        JTAG_SWITCHING_FACTOR = resources.get_JTAG_SWITCHING_FACTOR()
        JTAG_IO_FACTOR = resources.get_JTAG_IO_FACTOR()

        # core power calculation
        core_power = ((JTAG_CLK_FACTOR * (self.get_freq() / 1000000.0)) + (JTAG_SWITCHING_FACTOR * bandwidth)) * VCC_CORE ** 2
        io_core_power = JTAG_IO_FACTOR * bandwidth * endpoint.toggle_rate * VCC_CORE ** 2
        io_vcco_power = ((OUTPUT_AC * bandwidth * endpoint.toggle_rate) + OUTPUT_DC) * 4 * VCC_BOOT_IO ** 2
        io_vcc_aux_power = io_vcco_power * 0.1

        # update output properties
        self.output.calculated_bandwidth = bandwidth
        self.output.block_power = core_power + io_core_power + io_vcco_power + io_vcc_aux_power

        # debug info
        print(f'[DEBUG] JTAG: {core_power = }', file=sys.stderr)
        print(f'[DEBUG] JTAG: {io_core_power = }', file=sys.stderr)
        print(f'[DEBUG] JTAG: {io_vcco_power = }', file=sys.stderr)
        print(f'[DEBUG] JTAG: {io_vcc_aux_power = }', file=sys.stderr)
        print(f'[DEBUG] JTAG: {self.output.calculated_bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] JTAG: {self.output.block_power = }', file=sys.stderr)

        return True

@dataclass
class Qspi0(ComputeObject):
    @dataclass
    class properties_:
        clock_frequency: Qspi_Performance_Mbps

    @dataclass
    class output_(common_output_):
        pass

    @dataclass
    class bandwidth_:
        type: Qspi_Performance_Mbps
        bandwidth: float
        frequency: int
        ios: int

    def __post_init__(self) -> None:
        self.properties = Qspi0.properties_(clock_frequency=Qspi_Performance_Mbps.SPI_1Mbps)
        self.output = Qspi0.output_()
        self.messages: List[RsMessage] = []
        self.bandwidth_table = [
            Qspi0.bandwidth_(type=Qspi_Performance_Mbps.SPI_1Mbps   , bandwidth= 0.125, frequency=1000000  , ios=1),
            Qspi0.bandwidth_(type=Qspi_Performance_Mbps.SPI_25Mbps  , bandwidth= 3.125, frequency=25000000 , ios=1),
            Qspi0.bandwidth_(type=Qspi_Performance_Mbps.SPI_50Mbps  , bandwidth= 6.25 , frequency=50000000 , ios=1),
            Qspi0.bandwidth_(type=Qspi_Performance_Mbps.SPI_100Mbps , bandwidth=12.5  , frequency=100000000, ios=1),
            Qspi0.bandwidth_(type=Qspi_Performance_Mbps.QSPI_4Mbps  , bandwidth= 0.5  , frequency=1000000  , ios=4),
            Qspi0.bandwidth_(type=Qspi_Performance_Mbps.QSPI_100Mbps, bandwidth=12.5  , frequency=25000000 , ios=4),
            Qspi0.bandwidth_(type=Qspi_Performance_Mbps.QSPI_200Mbps, bandwidth=25.0  , frequency=50000000 , ios=4),
            Qspi0.bandwidth_(type=Qspi_Performance_Mbps.QSPI_400Mbps, bandwidth=50.0  , frequency=100000000, ios=4),
        ]

    def get_properties(self) -> Dict[str, Any]:
        return self.properties.__dict__

    def get_output(self) -> Dict[str, Any]:
        return self.output.__dict__

    def get_messages(self) -> List[RsMessage]:
        return self.messages

    def get_perf(self) -> bandwidth_:
        for row in self.bandwidth_table:
            if row.type == self.properties.clock_frequency:
                return row

    def get_bandwidth(self) -> float:
        row = self.get_perf()
        if row:
            return row.bandwidth
        return 0.0

    def get_freq(self) -> int:
        row = self.get_perf()
        if row:
            return row.frequency
        return 0

    def set_properties(self, props: Dict[str, Any]) -> None:
        return update_attributes(self.properties, props)

    def compute(self) -> bool:
        self.output.reset()

        if sanity_check(self.messages, self.get_context()) == False:
            return False

        endpoint, _ = find_highest_bandwidth_peripheral_endpoint(self.get_context())
        if endpoint is None:
            self.messages.append(RsMessageManager.get_message(203, {"name" : self.get_context().get_name()}))
            return False

        # highest calculated bandwidth
        bandwidth = endpoint.output.calculated_bandwidth

        # compule block power
        resources = self.get_context().get_device_resources()
        VCC_CORE = resources.get_VCC_CORE()
        VCC_BOOT_IO = resources.get_VCC_BOOT_IO()
        OUTPUT_AC, OUTPUT_DC = get_io_output_coeff(self.get_context(), VCC_BOOT_IO)
        QSPI_CLK_FACTOR = resources.get_QSPI_CLK_FACTOR()
        QSPI_SWITCHING_FACTOR = resources.get_QSPI_SWITCHING_FACTOR()
        QSPI_IO_FACTOR = resources.get_QSPI_IO_FACTOR()

        # core power calculation
        core_power = ((QSPI_CLK_FACTOR * (self.get_freq() / 1000000.0)) + (QSPI_SWITCHING_FACTOR * bandwidth)) * VCC_CORE ** 2
        io_core_power = QSPI_IO_FACTOR * bandwidth * endpoint.toggle_rate * VCC_CORE ** 2
        io_vcco_power = ((OUTPUT_AC * bandwidth * endpoint.toggle_rate) + OUTPUT_DC) * 4 * VCC_BOOT_IO ** 2
        io_vcc_aux_power = io_vcco_power * 0.1

        # update output properties
        self.output.calculated_bandwidth = bandwidth
        self.output.block_power = core_power + io_core_power + io_vcco_power + io_vcc_aux_power

        # debug info
        print(f'[DEBUG] QSPI: {core_power = }', file=sys.stderr)
        print(f'[DEBUG] QSPI: {io_core_power = }', file=sys.stderr)
        print(f'[DEBUG] QSPI: {io_vcco_power = }', file=sys.stderr)
        print(f'[DEBUG] QSPI: {io_vcc_aux_power = }', file=sys.stderr)
        print(f'[DEBUG] QSPI: {self.output.calculated_bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] QSPI: {self.output.block_power = }', file=sys.stderr)

        return True

@dataclass
class Uart0(ComputeObject):
    @dataclass
    class properties_:
        baudrate: Baud_Rate

    @dataclass
    class output_(common_output_):
        pass

    @dataclass
    class bandwidth_:
        type: Baud_Rate
        frequency: int

    def __post_init__(self) -> None:
        self.properties = Uart0.properties_(baudrate=Baud_Rate.Baud_Rate_115200)
        self.output = Uart0.output_()
        self.messages: List[RsMessage] = []
        self.bandwidth_table = [
            Uart0.bandwidth_(type=Baud_Rate.Baud_Rate_9600  , frequency=  9600),
            Uart0.bandwidth_(type=Baud_Rate.Baud_Rate_19200 , frequency= 19200),
            Uart0.bandwidth_(type=Baud_Rate.Baud_Rate_28800 , frequency= 28800),
            Uart0.bandwidth_(type=Baud_Rate.Baud_Rate_57600 , frequency= 57600),
            Uart0.bandwidth_(type=Baud_Rate.Baud_Rate_115200, frequency=115200),
            Uart0.bandwidth_(type=Baud_Rate.Baud_Rate_128000, frequency=128000),
        ]

    def get_properties(self) -> Dict[str, Any]:
        return self.properties.__dict__

    def get_output(self) -> Dict[str, Any]:
        return self.output.__dict__

    def get_messages(self) -> List[RsMessage]:
        return self.messages

    def get_perf(self) -> bandwidth_:
        for row in self.bandwidth_table:
            if row.type == self.properties.baudrate:
                return row

    def get_bandwidth(self) -> float:
        row = self.get_perf()
        if row:
            return (row.frequency / 1000000.0) * 0.8
        return 0.0

    def get_freq(self) -> int:
        row = self.get_perf()
        if row:
            return row.frequency
        return 0

    def set_properties(self, props: Dict[str, Any]) -> None:
        return update_attributes(self.properties, props)

    def compute(self) -> bool:
        self.output.reset()

        if sanity_check(self.messages, self.get_context()) == False:
            return False

        endpoint, _ = find_highest_bandwidth_peripheral_endpoint(self.get_context())
        if endpoint is None:
            self.messages.append(RsMessageManager.get_message(203, {"name" : self.get_context().get_name()}))
            return False

        # highest calculated bandwidth
        bandwidth = endpoint.output.calculated_bandwidth

        # compule block power
        resources = self.get_context().get_device_resources()
        VCC_CORE = resources.get_VCC_CORE()
        VCC_BOOT_IO = resources.get_VCC_BOOT_IO()
        OUTPUT_AC, OUTPUT_DC = get_io_output_coeff(self.get_context(), VCC_BOOT_IO)
        UART_CLK_FACTOR = resources.get_UART_CLK_FACTOR()
        UART_SWITCHING_FACTOR = resources.get_UART_SWITCHING_FACTOR()
        UART_IO_FACTOR = resources.get_UART_IO_FACTOR()

        # core power calculation
        core_power = ((UART_CLK_FACTOR * (self.get_freq() / 1000000.0)) + (UART_SWITCHING_FACTOR * bandwidth)) * VCC_CORE ** 2
        io_core_power = UART_IO_FACTOR * bandwidth * 0.25 * VCC_CORE ** 2
        io_vcco_power = ((OUTPUT_AC * bandwidth * 0.25) + OUTPUT_DC) * 4 * VCC_BOOT_IO ** 2
        io_vcc_aux_power = io_vcco_power * 0.1

        # update output properties
        self.output.calculated_bandwidth = bandwidth
        self.output.block_power = core_power + io_core_power + io_vcco_power + io_vcc_aux_power

        # debug info
        print(f'[DEBUG] UART: {bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] UART: {self.get_freq() / 1000000.0 = }', file=sys.stderr)
        print(f'[DEBUG] UART: {endpoint.toggle_rate = }', file=sys.stderr)
        print(f'[DEBUG] UART: {endpoint.toggle_rate * bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] UART: {core_power = }', file=sys.stderr)
        print(f'[DEBUG] UART: {io_core_power = }', file=sys.stderr)
        print(f'[DEBUG] UART: {io_vcco_power = }', file=sys.stderr)
        print(f'[DEBUG] UART: {io_vcc_aux_power = }', file=sys.stderr)
        print(f'[DEBUG] UART: {self.output.calculated_bandwidth = }', file=sys.stderr)
        print(f'[DEBUG] UART: {self.output.block_power = }', file=sys.stderr)

        return True
