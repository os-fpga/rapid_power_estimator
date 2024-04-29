#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from marshmallow import Schema, fields
from submodule.peripherals import PeripheralType, Peripherals_Usage, Qspi_Performance_Mbps, Jtag_Clock_Frequency, \
    I2c_Speed, Baud_Rate, Cpu, Usb_Speed, Gige_Speed, Gpio_Type, GpioStandard, Memory_Type, \
    Dma_Source_Destination, Dma_Activity, N22_RISC_V_Clock, Port_Activity, A45_Load
from .device_schemas import MessageSchema

class UrlField(fields.Field):
    def _serialize(self, value, attr, obj, **kwargs):
        return [{'href': f'{item.peripheral_type.value}/{index}', 'name': item.name} for index, item in enumerate(value)]

class EndpointUrlField(fields.Field):
    def _serialize(self, value, attr, obj, **kwargs):
        return [{'href': f'ep/{index}', 'name': item.name} for index, item in enumerate(value)]

class PeripheralUrlSchema(Schema):
    spi  = UrlField()
    jtag = UrlField()
    i2c  = UrlField()
    uart = UrlField()
    usb2 = UrlField()
    gige = UrlField()
    gpio = UrlField()
    pwm  = UrlField()
    dma  = UrlField()
    bcpu = UrlField()
    acpu = UrlField()
    memory = UrlField()
    fpga_complex = UrlField()

class PeripheralConsumptionSchema(Schema):
    total_memory_power = fields.Number()
    total_peripherals_power = fields.Number()
    total_acpu_power = fields.Number()
    total_dma_power = fields.Number()
    total_noc_interconnect_power = fields.Number()
    total_bcpu_power = fields.Number()
    total_soc_io_available = fields.Int()
    total_soc_io_used = fields.Int()
    messages = fields.Nested(MessageSchema, many=True)

class PeripheralOutputSchema(Schema):
    calculated_bandwidth = fields.Number()
    block_power = fields.Number()
    percentage = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class PeripheralSchema(Schema):
    name = fields.Str()

    @classmethod
    def create_schema(cls, peripheral_type):
        if peripheral_type == PeripheralType.SPI:
            return SpiSchema()
        elif peripheral_type == PeripheralType.JTAG:
            return JtagSchema()
        elif peripheral_type == PeripheralType.I2C:
            return I2cSchema()
        elif peripheral_type == PeripheralType.UART:
            return UartSchema()
        elif peripheral_type == PeripheralType.USB2:
            return Usb2Schema()
        elif peripheral_type == PeripheralType.GIGE:
            return GigeSchema()
        elif peripheral_type == PeripheralType.GPIO:
            return GpioSchema()
        elif peripheral_type == PeripheralType.PWM:
            return PwmSchema()
        elif peripheral_type == PeripheralType.MEMORY:
            return MemorySchema()
        elif peripheral_type == PeripheralType.DMA:
            return DmaSchema()
        elif peripheral_type == PeripheralType.BCPU:
            return BcpuSchema()
        elif peripheral_type == PeripheralType.ACPU:
            return AcpuSchema()
        elif peripheral_type == PeripheralType.FPGA_COMPLEX:
            return FpgaComplexSchema()
        else:
            return PeripheralSchema()

class SpiSchema(PeripheralSchema):
    enable = fields.Bool()
    usage = fields.Enum(Peripherals_Usage, by_value=True)
    clock_frequency = fields.Enum(Qspi_Performance_Mbps, by_value=True)
    output = fields.Nested(PeripheralOutputSchema, data_key="consumption")

class JtagSchema(PeripheralSchema):
    enable = fields.Bool()
    usage = fields.Enum(Peripherals_Usage, by_value=True)
    clock_frequency = fields.Enum(Jtag_Clock_Frequency, by_value=True)
    output = fields.Nested(PeripheralOutputSchema, data_key="consumption")

class I2cSchema(PeripheralSchema):
    enable = fields.Bool()
    usage = fields.Enum(Peripherals_Usage, by_value=True)
    clock_frequency = fields.Enum(I2c_Speed, by_value=True)
    output = fields.Nested(PeripheralOutputSchema, data_key="consumption")

class UartSchema(PeripheralSchema):
    enable = fields.Bool()
    usage = fields.Enum(Peripherals_Usage, by_value=True)
    baudrate = fields.Enum(Baud_Rate, by_value=True)
    cpu = fields.Enum(Cpu, by_value=True)
    output = fields.Nested(PeripheralOutputSchema, data_key="consumption")

class Usb2Schema(PeripheralSchema):
    enable = fields.Bool()
    usage = fields.Enum(Peripherals_Usage, by_value=True)
    bit_rate = fields.Enum(Usb_Speed, by_value=True)
    output = fields.Nested(PeripheralOutputSchema, data_key="consumption")

class GigeSchema(PeripheralSchema):
    enable = fields.Bool()
    usage = fields.Enum(Peripherals_Usage, by_value=True)
    bit_rate = fields.Enum(Gige_Speed, by_value=True)
    output = fields.Nested(PeripheralOutputSchema, data_key="consumption")

class GpioSchema(PeripheralSchema):
    usage = fields.Enum(Peripherals_Usage, by_value=True)
    io_used = fields.Int()
    io_type = fields.Enum(Gpio_Type, by_value=True)
    io_standard = fields.Enum(GpioStandard, by_value=True)
    output = fields.Nested(PeripheralOutputSchema, data_key="consumption")

class PwmSchema(PeripheralSchema):
    usage = fields.Enum(Peripherals_Usage, by_value=True)
    io_used = fields.Int()
    io_standard = fields.Enum(GpioStandard, by_value=True)
    output = fields.Nested(PeripheralOutputSchema, data_key="consumption")

class MemoryOutputSchema(Schema):
    write_bandwidth = fields.Number()
    read_bandwidth = fields.Number()
    block_power = fields.Number()
    percentage = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class MemorySchema(PeripheralSchema):
    enable = fields.Bool()
    usage = fields.Enum(Peripherals_Usage, by_value=True)
    memory_type = fields.Enum(Memory_Type, by_value=True)
    data_rate = fields.Int()
    width = fields.Int()
    output = fields.Nested(MemoryOutputSchema, data_key="consumption")

class DmaOutputSchema(Schema):
    calculated_bandwidth = fields.Number()
    noc_power = fields.Number()
    block_power = fields.Number()
    percentage = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class DmaSchema(PeripheralSchema):
    enable = fields.Bool()
    channel = fields.Int()
    source = fields.Enum(Dma_Source_Destination, by_value=True)
    destination = fields.Enum(Dma_Source_Destination, by_value=True)
    activity = fields.Enum(Dma_Activity, by_value=True)
    read_write_rate = fields.Number()
    toggle_rate = fields.Number()
    output = fields.Nested(DmaOutputSchema, data_key="consumption")

class EndpointOutputSchema(Schema):
    calculated_bandwidth = fields.Number()
    noc_power = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class EndpointSchema(Schema):
    name = fields.Str()
    activity = fields.Enum(Port_Activity, by_value=True)
    read_write_rate = fields.Number()
    toggle_rate = fields.Number()
    output = fields.Nested(EndpointOutputSchema, data_key="consumption")

class BcpuOutputSchema(Schema):
    boot_mode = fields.Str()
    active_power = fields.Number()
    boot_power = fields.Number()

class BcpuSchema(PeripheralSchema):
    encryption_used = fields.Bool()
    clock = fields.Enum(N22_RISC_V_Clock, by_value=True)
    ports = EndpointUrlField()
    output = fields.Nested(BcpuOutputSchema, data_key="consumption")

class FpgaComplexEndpointOutputSchema(EndpointOutputSchema):
    clock_frequency = fields.Int()
    percentage = fields.Number()

class FpgaComplexEndpointSchema(EndpointSchema):
    clock = fields.Str()
    output = fields.Nested(FpgaComplexEndpointOutputSchema, data_key="consumption")

class AcpuOutputSchema(Schema):
    block_power = fields.Number()

class AcpuSchema(PeripheralSchema):
    enable = fields.Bool()
    frequency = fields.Int()
    load = fields.Enum(A45_Load, by_value=True)
    ports = EndpointUrlField()
    output = fields.Nested(AcpuOutputSchema, data_key="consumption")

class FpgaComplexSchema(PeripheralSchema):
    ports = EndpointUrlField()
