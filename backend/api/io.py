#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from flask import Blueprint, request
from flask_restful import Api, Resource
from marshmallow import Schema, fields, ValidationError
from submodule.io import IO_Direction, IO_Drive_Strength, IO_Slew_Rate, IO_differential_termination, \
    IO_Data_Type, IO_Standard, IO_Synchronization, IO_Pull_up_down, IO_Bank_Type
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import ModuleType, DeviceNotFoundException, IONotFoundException
from .device import MessageSchema
from .errors import DeviceNotExistsError, InternalServerError, IONotExistsError, \
    SchemaValidationError
from .errors import errors

#-------------------------------------------------------------------------------------------#
# endpoints                               | methods                 | classes               #
#-------------------------------------------------------------------------------------------# 
# devices/<device_id>/io                  | get, post               | IosApi                #
# devices/<device_id>/io/<rownum>         | get, patch, delete      | IoApi                 #
# devices/<device_id>/io/consumption      | get                     | IoConsumptionApi      #
#-------------------------------------------------------------------------------------------#

class IoOnDieTerminationSchema(Schema):
    bank_number = fields.Int()
    odt = fields.Bool()
    power = fields.Number()

class IoUsageAllocationSchema(Schema):
    voltage = fields.Number()
    banks_used = fields.Int()
    io_used = fields.Int()
    io_available = fields.Int()

class IoUsageSchema(Schema):
    type = fields.Enum(IO_Bank_Type, by_value=True)
    total_banks_available = fields.Int()
    total_io_available = fields.Int()
    usage = fields.Nested(IoUsageAllocationSchema, many=True)

class IoResourcesConsumptionSchema(Schema):
    total_block_power = fields.Number()
    total_interconnect_power = fields.Number()
    total_on_die_termination_power = fields.Number()
    io_usage = fields.Nested(IoUsageSchema, many=True)
    io_on_die_termination = fields.Nested(IoOnDieTerminationSchema, many=True)
    messages = fields.Nested(MessageSchema, many=True)

class IoOutputSchema(Schema):
    bank_type = fields.Enum(IO_Bank_Type, by_value=True)
    bank_number = fields.Int()
    vccio_voltage = fields.Number()
    io_signal_rate = fields.Number()
    block_power = fields.Number()
    interconnect_power = fields.Number()
    percentage = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class IoSchema(Schema):
    enable = fields.Bool()
    name = fields.Str()
    bus_width = fields.Int()
    direction = fields.Enum(IO_Direction, by_value=True)
    io_standard = fields.Enum(IO_Standard, by_value=True)
    drive_strength = fields.Enum(IO_Drive_Strength, by_value=True)
    slew_rate = fields.Enum(IO_Slew_Rate, by_value=True)
    differential_termination = fields.Enum(IO_differential_termination, by_value=True)
    io_data_type = fields.Enum(IO_Data_Type, by_value=True)
    clock = fields.Str()
    toggle_rate = fields.Number()
    duty_cycle = fields.Number()
    synchronization = fields.Enum(IO_Synchronization, by_value=True)
    input_enable_rate = fields.Number()
    output_enable_rate = fields.Number()
    io_pull_up_down = fields.Enum(IO_Pull_up_down, by_value=True)
    output = fields.Nested(IoOutputSchema, data_key="consumption")

class IosApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns a list of IO of a device
        ---
        tags:
            - IO
        description: Return a list of IO of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
        definitions:
            IO:
                type: object
                properties:
                    enable:
                        type: boolean
                    name:
                        type: string
                    bus_width:
                        type: integer
                    direction:
                        type: integer
                        minimum: 0
                        maximum: 3
                    io_standard:
                        type:  integer
                        minimum: 0
                        maximum: 42
                    drive_strength:
                        type:  integer
                        minimum: 2
                        maximum: 16
                    slew_rate:
                        type:  integer
                        minimum: 0
                        maximum: 1
                    differential_termination:
                        type:  integer
                        minimum: 0
                        maximum: 1
                    io_data_type:
                        type:  integer
                        minimum: 0
                        maximum: 3
                    clock:
                        type: string
                    toggle_rate:
                        type: number
                    duty_cycle:
                        type: number
                    synchronization:
                        type:  integer
                        minimum: 0
                        maximum: 9
                    input_enable_rate:
                        type: number
                    output_enable_rate:
                        type: number
                    io_pull_up_down:
                        type:  integer
                        minimum: 0
                        maximum: 2
            IOOutput:
                type: object
                properties:
                    consumption:
                        allOf:
                            - type: object
                              properties:
                                bank_type:
                                    type: integer
                                    minimum: 0
                                    maximum: 1
                                bank_number:
                                    type: integer
                                vccio_voltage:
                                    type: number
                                io_signal_rate:
                                    type: number
                                block_power:
                                    type: number
                                interconnect_power:
                                    type: number
                                percentage:
                                    type: number
                            - $ref: '#/definitions/ItemMessage'
            IOOnDieTermination:
                type: object
                properties:
                    bank_number:
                        type: integer
                    odt:
                        type: boolean
                    power:
                        type: number
            IOUsageAllocation:
                type: object
                properties:
                    voltage:
                        type: number
                    banks_used:
                        type: integer
                    io_used:
                        type: integer
                    io_available:
                        type: integer
            IOUsage:
                type: object
                properties:
                    type:
                        type: string
                    total_banks_available:
                        type: integer
                    total_io_available:
                        type: integer
                    usage:
                        type: array
                        items:
                            $ref: '#/definitions/IOUsageAllocation'
            IOConsumptionAndResourceUsage:
                allOf:
                    - type: object
                      properties:
                        total_block_power:
                            type: number
                        total_interconnect_power:
                            type: number
                        total_on_die_termination_power:
                            type: number
                        io_usage:
                            $ref: '#/definitions/IOUsage'
                        io_on_die_termination:
                            type: array
                            items:
                                $ref: '#/definitions/IOOnDieTermination'
                    - $ref: '#/definitions/ItemMessage'
        responses:
            200:
                description: Successfully returned a list of IO
                schema:
                    type: array
                    items:
                        allOf:
                            - $ref: '#/definitions/IO'
                            - $ref: '#/definitions/IOOutput'
            400:
                description: Invalid request
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            io_module = device.get_module(ModuleType.IO)
            ios = io_module.get_all()
            schema = IoSchema(many=True)
            return schema.dump(ios)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def post(self, device_id : str):
        """
        This is an endpoint that creates a IO of a device
        ---
        tags:
            - IO
        description: Create a IO of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true 
            - name: io
              in: body
              description: Create a new IO of a device
              schema:
                $ref: '#/definitions/IO'
        responses:
            201:
                description: Successfully created a new IO
                schema:
                    allOf:
                        - $ref: '#/definitions/IO'
                        - $ref: '#/definitions/IOOutput'
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
            io_module = device.get_module(ModuleType.IO)
            schema = IoSchema()
            io = io_module.add(schema.load(request.json))
            device.compute_output_power()
            return schema.dump(io), 201
        except ValidationError as e:
            raise SchemaValidationError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class IoApi(Resource):
    def get(self, device_id : str, rownum : int):
        """
        This is an endpoint that returns an IO details of a device by its index
        ---
        tags:
            - IO
        description: Return an IO details of a device by its index.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true 
            - name: rownum
              in: path 
              type: integer
              required: true 
        responses:
            200:
                description: Successfully returned the IO details
                schema:
                    allOf:
                        - $ref: '#/definitions/IO'
                        - $ref: '#/definitions/IOOutput'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            io_module = device.get_module(ModuleType.IO)
            io = io_module.get(rownum)
            schema = IoSchema()
            return schema.dump(io)
        except IONotFoundException as e:
            raise IONotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def patch(self, device_id : str, rownum : int):
        """
        This is an endpoint that updates an IO of a device by its index
        ---
        tags:
            - IO
        description: Update an IO of a device by its index.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true 
            - name: rownum
              in: path 
              type: integer
              required: true
            - name: io
              in: body
              description: Update an IO of a device
              schema:
                $ref: '#/definitions/IO'
        responses:
            200:
                description: Successfully updated the IO
                schema:
                    allOf:
                        - $ref: '#/definitions/IO'
                        - $ref: '#/definitions/IOOutput'
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
            io_module = device.get_module(ModuleType.IO)
            schema = IoSchema()
            io = io_module.update(rownum, schema.load(request.json))
            device.compute_output_power()
            return schema.dump(io), 200
        except ValidationError as e:
            raise SchemaValidationError
        except IONotFoundException as e:
            raise IONotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def delete(self, device_id : str, rownum : int):
        """
        This is an endpoint that deletes an IO of a device by its index
        ---
        tags:
            - IO
        description: Delete an IO of a device by its index.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true 
            - name: rownum
              in: path 
              type: integer
              required: true
        responses:
            204:
                description: Successfully deleted the IO
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            io_module = device.get_module(ModuleType.IO)
            schema = IoSchema()
            io_module.remove(rownum)
            device.compute_output_power()
            return '', 204
        except IONotFoundException as e:
            raise IONotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class IoConsumptionApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns overall IO power consumption and resource utilization of a device
        ---
        tags:
            - IO
        description: Return overall IO power consumption and resource utilization of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
        responses:
            200:
                description: Successfully returned IO power consumption and resource utilization
                schema:
                    $ref: '#/definitions/IOConsumptionAndResourceUsage'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            io_module = device.get_module(ModuleType.IO)
            consumption = io_module.get_power_consumption()
            messages = io_module.get_all_messages()
            res = io_module.get_resources()
            data = {
                'total_block_power': consumption[0],
                'total_interconnect_power': consumption[1],
                'total_on_die_termination_power': consumption[1],
                'io_usage': res[0],
                'io_on_die_termination': res[1],
                'messages': messages
            }
            schema = IoResourcesConsumptionSchema()
            return schema.dump(data)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

io_api = Blueprint('io_api', __name__)
api = Api(io_api, errors=errors)
api.add_resource(IosApi, '/devices/<string:device_id>/io')
api.add_resource(IoApi, '/devices/<string:device_id>/io/<int:rownum>')
api.add_resource(IoConsumptionApi, '/devices/<string:device_id>/io/consumption')
