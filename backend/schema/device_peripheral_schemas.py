#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from marshmallow import Schema, fields
from submodule.peripherals import PeripheralType, Peripherals_Usage, Qspi_Performance_Mbps, Jtag_Clock_Frequency, \
    I2c_Speed, Baud_Rate, Cpu, Usb_Speed, Gige_Speed, Gpio_Type, GpioStandard

class HrefSchema(Schema):
    href = fields.Str()

class PeripheralUrlSchema(Schema):
    spi  = fields.Nested(HrefSchema, many=True)
    jtag = fields.Nested(HrefSchema, many=True)
    i2c  = fields.Nested(HrefSchema, many=True)
    uart = fields.Nested(HrefSchema, many=True)
    usb2 = fields.Nested(HrefSchema, many=True)
    gige = fields.Nested(HrefSchema, many=True)
    gpio = fields.Nested(HrefSchema, many=True)
    pwm  = fields.Nested(HrefSchema, many=True)

class PeripheralConsumptionSchema(Schema):
    total_memory_power = fields.Number()
    total_peripherals_power = fields.Number()
    total_acpu_power = fields.Number()
    total_dma_power = fields.Number()
    total_noc_interconnect_power = fields.Number()
    total_bcpu_power = fields.Number()
    total_soc_io_available = fields.Int()
    total_soc_io_used = fields.Int()

class PeripheralOutputSchema(Schema):
    calculated_bandwidth = fields.Number()
    block_power = fields.Number()
    percentage = fields.Number()
    message = fields.Str()

class PeripheralSchema(Schema):
    enable = fields.Bool()
    name = fields.Str()
    usage = fields.Enum(Peripherals_Usage, by_value=True)
    output = fields.Nested(PeripheralOutputSchema, data_key="consumption")

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
        else:
            return PeripheralSchema()

class SpiSchema(PeripheralSchema):
    clock_frequency = fields.Enum(Qspi_Performance_Mbps, by_value=True)

class JtagSchema(PeripheralSchema):
    clock_frequency = fields.Enum(Jtag_Clock_Frequency, by_value=True)

class I2cSchema(PeripheralSchema):
    clock_frequency = fields.Enum(I2c_Speed, by_value=True)

class UartSchema(PeripheralSchema):
    baudrate = fields.Enum(Baud_Rate, by_value=True)
    cpu = fields.Enum(Cpu, by_value=True)

class Usb2Schema(PeripheralSchema):
    bit_rate = fields.Enum(Usb_Speed, by_value=True)

class GigeSchema(PeripheralSchema):
    bit_rate = fields.Enum(Gige_Speed, by_value=True)

class GpioSchema(PeripheralSchema):
    io_used = fields.Int()
    io_type = fields.Enum(Gpio_Type, by_value=True)
    io_standard = fields.Enum(GpioStandard, by_value=True)

class PwmSchema(PeripheralSchema):
    io_used = fields.Int()
    io_standard = fields.Enum(GpioStandard, by_value=True)
