#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from flask import Blueprint, request
from flask_restful import Api, Resource
from marshmallow import Schema, fields, ValidationError
from utilities.common_utils import get_enum_by_value
from submodule.peripherals import PeripheralType, Peripherals_Usage, Qspi_Performance_Mbps, Jtag_Clock_Frequency, \
    I2c_Speed, Baud_Rate, Cpu, Usb_Speed, Gige_Speed, Gpio_Type, GpioStandard, Memory_Type, \
    Dma_Source_Destination, Dma_Activity, N22_RISC_V_Clock, Port_Activity, A45_Load
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import ModuleType, DeviceNotFoundException, PeripheralNotFoundException, \
    InvalidPeripheralTypeException, PeripheralEndpointNotFoundException
from .device import MessageSchema
from .errors import DeviceNotExistsError, InternalServerError, PeripheralNotExistsError, \
    InvalidPeripheralTypeError, PeripheralEndpointNotExistsError, \
    SchemaValidationError
from .errors import errors

import sys


#------------------------------------------------------------------------------------------------------------#
# endpoints                                                        | methods     | classes                   #
#------------------------------------------------------------------------------------------------------------# 
# devices/<device_id>/peripherals                                  | get         | PeripheralsApi            #
# devices/<device_id>/peripherals/consumption                      | get         | PeripheralsConsumptionApi #
# devices/<device_id>/peripherals/<periph>/<rownum>                | get, patch  | PeripheralApi             #
# devices/<device_id>/peripherals/<periph>/<rownum>/ep/<endpoint>  | get, patch  | PeripheralEndpointApi     #
#------------------------------------------------------------------------------------------------------------#

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

class PeripheralsApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns a list of soc peripherals of a device
        ---
        tags:
            - Peripherals
        description: Return a list of soc peripherals of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
        definitions:
            Url:
                type: array
                items:
                    type: object
                    properties:
                        href:
                            type: string
                        name:
                            type: string
            PeripheralUrl:
                type: object
                properties:
                    spi:
                        $ref: '#/definitions/Url'
                    jtag:
                        $ref: '#/definitions/Url'
                    i2c:
                        $ref: '#/definitions/Url'
                    uart:
                        $ref: '#/definitions/Url'
                    usb2:
                        $ref: '#/definitions/Url'
                    gige:
                        $ref: '#/definitions/Url'
                    gpio:
                        $ref: '#/definitions/Url'
                    pwm:
                        $ref: '#/definitions/Url'
                    dma:
                        $ref: '#/definitions/Url'
                    bcpu:
                        $ref: '#/definitions/Url'
                    acpu:
                        $ref: '#/definitions/Url'
                    memory:
                        $ref: '#/definitions/Url'
                    fpga_complex:
                        $ref: '#/definitions/Url'
            PeripheralConsumptionAndResourceUsage:
                allOf:
                    - type: object
                      properties:
                        total_memory_power:
                            type: number
                        total_peripherals_power:
                            type: number
                        total_acpu_power:
                            type: number
                        total_dma_power:
                            type: number
                        total_noc_interconnect_power:
                            type: number
                        total_bcpu_power:
                            type: number
                        total_soc_io_available:
                            type: integer
                        total_soc_io_used:
                            type: integer
                    - $ref: '#/definitions/ItemMessage'
            EndpointUrl:
                type: object
                properties:
                    ports:
                        $ref: '#/definitions/Url'
            ACPUOutput:
                type: object
                properties:
                    consumption:
                        type: object
                        properties:
                            block_power:
                                type: number
            ACPU:
                type: object
                properties:
                    name:
                        type: string
                    enable:
                        type: boolean
                    frequency:
                        type: integer
                    load:
                        type: integer
                        minimum: 0
                        maximum: 3
            Endpoint:
                type: object
                properties:
                    name:
                        type: string
                    activity:
                        type: integer
                        minimum: 0
                        maximum: 3
                    read_write_rate:
                        type: number
                    toggle_rate:
                        type: number
            EndpointOutput:
                type: object
                properties:
                    consumption:
                        allOf:
                            - type: object
                              properties:
                                calculated_bandwidth:
                                    type: number
                                noc_power:
                                    type: number
                            - $ref: '#/definitions/ItemMessage'
        responses:
            200:
                description: Successfully returned a list of soc peripherals
                schema:
                    $ref: '#/definitions/PeripheralUrl'
            400:
                description: Invalid request
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            periph_module = device.get_module(ModuleType.SOC_PERIPHERALS)
            peripherals = periph_module.get_all()
            peripherals_by_type = {}
            # group peripherals by their type
            for item in peripherals:
                if item.peripheral_type.value in peripherals_by_type:
                    peripherals_by_type[item.peripheral_type.value].append(item)
                else:
                    peripherals_by_type[item.peripheral_type.value] = [item]
            schema = PeripheralUrlSchema()
            return schema.dump(peripherals_by_type)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class PeripheralsConsumptionApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns overall soc peripherals power consumption and resource utilization of a device
        ---
        tags:
            - Peripherals
        description: Returns overall soc peripherals power consumption and resource utilization.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
        responses:
            200:
                description: Successful returned soc peripherals power consumption and resource utilization
                schema:
                    $ref: '#/definitions/PeripheralConsumptionAndResourceUsage'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            periph_module = device.get_module(ModuleType.SOC_PERIPHERALS)
            consumption = periph_module.get_power_consumption()
            messages = periph_module.get_all_messages()
            res = periph_module.get_resources()
            data = {
                'total_memory_power': consumption[0],
                'total_peripherals_power': consumption[1],
                'total_acpu_power': consumption[2],
                'total_dma_power': consumption[3],
                'total_noc_interconnect_power': consumption[4],
                'total_bcpu_power': consumption[5],
                'total_soc_io_available': res[0],
                'total_soc_io_used': res[1],
                'messages': messages
            }
            schema = PeripheralConsumptionSchema()
            return schema.dump(data)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class PeripheralApi(Resource):
    def create_schema(self, periph):
        periph_type = get_enum_by_value(PeripheralType, periph)
        if periph_type is None:
            raise InvalidPeripheralTypeException
        return periph_type, PeripheralSchema.create_schema(periph_type)

    def get(self, device_id : str, periph : str, rownum : int):
        """
        This is an endpoint that returns a peripheral details of a device by its index
        ---
        tags:
            - Peripherals
        description: Return peripheral details of a device by its index
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
            - name: periph
              in: path 
              type: string
              required: true
            - name: rownum
              in: path 
              type: integer
              required: true
        responses:
            200:
                description: Successfully returned peripheral details
                schema:
                    allOf:
                        - $ref: '#/definitions/ACPU'
                        - $ref: '#/definitions/EndpointUrl'
                        - $ref: '#/definitions/ACPUOutput'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            periph_module = device.get_module(ModuleType.SOC_PERIPHERALS)
            periph_type, schema = self.create_schema(periph)
            peripheral = periph_module.get_peripheral(periph_type, rownum)
            return schema.dump(peripheral)
        except InvalidPeripheralTypeException as e:
            raise InvalidPeripheralTypeError
        except PeripheralNotFoundException as e:
            raise PeripheralNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def patch(self, device_id : str, periph : str, rownum : int):
        """
        This is an endpoint that updates a peripheral details of a device by its index
        ---
        tags:
            - Peripherals
        description: Update a peripheral details of a device by its index.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
            - name: periph
              in: path 
              type: string
              required: true
            - name: rownum
              in: path 
              type: integer
              required: true
            - name: peripheral
              in: body
              description: Update a peripheral of a device
              schema:
                $ref: '#/definitions/ACPU'
        responses:
            200:
                description: Successfully updated the peripheral
                schema:
                    allOf:
                        - $ref: '#/definitions/ACPU'
                        - $ref: '#/definitions/EndpointUrl'
                        - $ref: '#/definitions/ACPUOutput'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
            403:
                description: Schema validation error 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            periph_module = device.get_module(ModuleType.SOC_PERIPHERALS)
            periph_type, schema = self.create_schema(periph)
            peripheral = periph_module.update_peripheral(periph_type, rownum, schema.load(request.json))
            device.compute_output_power()
            return schema.dump(peripheral), 200
        except ValidationError as e:
            raise SchemaValidationError
        except InvalidPeripheralTypeException as e:
            raise InvalidPeripheralTypeError
        except PeripheralNotFoundException as e:
            raise PeripheralNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class PeripheralEndpointApi(Resource):
    def create_endpoint_schema(self, periph):
        periph_type = get_enum_by_value(PeripheralType, periph)
        if periph_type is None:
            raise InvalidPeripheralTypeException
        if periph_type == PeripheralType.FPGA_COMPLEX:
            schema = FpgaComplexEndpointSchema()
        else:
            schema = EndpointSchema()
        return periph_type, schema

    def get(self, device_id : str, periph : str, rownum : int, endpoint : int):
        """
        This is an endpoint that returns an endpoint of a peripheral of a device
        ---
        tags:
            - Peripherals
        description: Return an endpoint of a peripheral of a device (applicable for ACPU, BCPU and FPGA_COMPLEX only).
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
            - name: periph
              in: path 
              type: string
              required: true
            - name: rownum
              in: path 
              type: integer
              required: true
            - name: endpoint
              in: path 
              type: integer
              required: true
        responses:
            200:
                description: Successfully returned an endpoint
                schema:
                    allOf:
                        - $ref: '#/definitions/Endpoint'
                        - $ref: '#/definitions/EndpointOutput'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            periph_module = device.get_module(ModuleType.SOC_PERIPHERALS)
            periph_type, schema = self.create_endpoint_schema(periph)
            ep = periph_module.get_endpoint(periph_type, rownum, endpoint)
            return schema.dump(ep)
        except PeripheralEndpointNotFoundException as e:
            raise PeripheralEndpointNotExistsError
        except InvalidPeripheralTypeException as e:
            raise InvalidPeripheralTypeError
        except PeripheralNotFoundException as e:
            raise PeripheralNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def patch(self, device_id : str, periph : str, rownum : int, endpoint : int):
        """
        This is an endpoint that updates an endpoint of a peripheral of a device
        ---
        tags:
            - Peripherals
        description: Update an endpoints of a peripheral of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
            - name: periph
              in: path 
              type: string
              required: true
            - name: rownum
              in: path 
              type: integer
              required: true
            - name: endpoint
              in: path 
              type: integer
              required: true
            - name: ep
              in: body 
              description: Update an endpoint of a peripheral
              schema:
                $ref: '#/definitions/Endpoint'
        responses:
            200:
                description: Successfully updated an endpoint
                schema:
                    allOf:
                        - $ref: '#/definitions/Endpoint'
                        - $ref: '#/definitions/EndpointOutput'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
            403:
                description: Schema validation error 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            periph_module = device.get_module(ModuleType.SOC_PERIPHERALS)
            periph_type, schema = self.create_endpoint_schema(periph)
            ep = periph_module.update_endpoint(periph_type, rownum, endpoint, schema.load(request.json))
            device.compute_output_power()
            return schema.dump(ep), 200
        except ValidationError as e:
            raise SchemaValidationError
        except PeripheralEndpointNotFoundException as e:
            raise PeripheralEndpointNotExistsError
        except InvalidPeripheralTypeException as e:
            raise InvalidPeripheralTypeError
        except PeripheralNotFoundException as e:
            raise PeripheralNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

peripherals_api = Blueprint('peripheral_api', __name__)
api = Api(peripherals_api, errors=errors)
api.add_resource(PeripheralsApi, '/devices/<string:device_id>/peripherals')
api.add_resource(PeripheralsConsumptionApi, '/devices/<string:device_id>/peripherals/consumption')
api.add_resource(PeripheralApi, '/devices/<string:device_id>/peripherals/<string:periph>/<int:rownum>')
api.add_resource(PeripheralEndpointApi, '/devices/<string:device_id>/peripherals/<string:periph>/<int:rownum>/ep/<int:endpoint>')
