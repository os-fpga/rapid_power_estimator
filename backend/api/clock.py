#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from flask import Blueprint, request
from flask_restful import Api, Resource
from marshmallow import Schema, fields, ValidationError
from submodule.clock import Clock_State, Source
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import ModuleType, DeviceNotFoundException, ClockNotFoundException, \
    ClockDescriptionPortValidationException
from .device import MessageSchema
from .errors import DeviceNotExistsError, InternalServerError, ClockNotExistsError, \
    ClockDescriptionPortValidationError, \
    ClockMaxCountReachedException, \
    SchemaValidationError
from .errors import errors

#-------------------------------------------------------------------------------------------#
# endpoints                               | methods                 | classes               #
#-------------------------------------------------------------------------------------------# 
# devices/<device_id>/clock               | get, post               | ClocksApi             #
# devices/<device_id>/clock/<rownum>      | get, patch, delete      | ClockApi              #
# devices/<device_id>/clock/consumption   | get                     | ClockConsumptionApi   #
#-------------------------------------------------------------------------------------------#

class ClockResourcesConsumptionSchema(Schema):
    total_clocks_available = fields.Int()
    total_clocks_used = fields.Int()
    total_plls_available = fields.Int()
    total_plls_used = fields.Int()
    total_clock_block_power = fields.Number()
    total_clock_interconnect_power = fields.Number()
    total_pll_power = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class ClockOutputSchema(Schema):
    fan_out = fields.Int()
    block_power = fields.Number()
    interconnect_power = fields.Number()
    percentage = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class ClockSchema(Schema):
    enable = fields.Bool()
    description = fields.Str()
    port = fields.Str()
    source = fields.Enum(Source, by_value=True)
    frequency = fields.Int()
    state = fields.Enum(Clock_State, by_value=True)
    output = fields.Nested(ClockOutputSchema, data_key="consumption")

class ClocksApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns a list of clocks of a device
        ---
        tags:
            - Clock
        description: Returns a list of clocks of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
        definitions:
            Clock:
                type: object
                properties:
                    description:
                        type: string
                    port:
                        type: string
                    enable:
                        type: boolean
                    source:
                        type: integer
                    frequency:
                        type: integer
                    state:
                        type: integer
                        minimum: 1
                        maximum: 2
            ClockOutput:
                type: object
                properties:
                    consumption:
                        allOf:
                            - type: object
                              properties:
                                fan_out:
                                    type: integer
                                block_power:
                                    type: number
                                interconnect_power:
                                    type: number
                                percentage:
                                    type: number
                            - $ref: '#/definitions/ItemMessage'
            ClockConsumptionAndResourceUsage:
                allOf:
                    - type: object
                      properties:
                        total_clocks_available:
                            type: integer
                        total_clocks_used:
                            type: integer
                        total_plls_available:
                            type: integer
                        total_plls_used:
                            type: integer
                        total_clock_block_power:
                            type: number
                        total_clock_interconnect_power:
                            type: number
                        total_pll_power:
                            type: number
                    - $ref: '#/definitions/ItemMessage'
        responses:
            200:
                description: A list of clocks
                schema:
                    type: array
                    items:
                        allOf:
                            - $ref: '#/definitions/Clock'
                            - $ref: '#/definitions/ClockOutput'
            400:
                description: Invalid request
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            clock_module = device.get_module(ModuleType.CLOCKING)
            clocks = clock_module.get_all()
            schema = ClockSchema(many=True)
            return schema.dump(clocks)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def post(self, device_id : str):
        """
        This is an endpoint that creates a clock of a device
        ---
        tags:
            - Clock
        description: Create a clock of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true 
            - name: clock
              in: body
              description: Create a new clock of a device
              schema:
                $ref: '#/definitions/Clock'
        responses:
            201:
                description: Successfully created a new clock
                schema:
                    allOf:
                        - $ref: '#/definitions/Clock'
                        - $ref: '#/definitions/ClockOutput'
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
            clock_module = device.get_module(ModuleType.CLOCKING)
            schema = ClockSchema()
            clock = clock_module.add(schema.load(request.json))
            device.compute_output_power()
            return schema.dump(clock), 201
        except ValidationError as e:
            raise SchemaValidationError
        except ClockDescriptionPortValidationException as e:
            raise ClockDescriptionPortValidationError
        except ClockMaxCountReachedException as e:
            raise ClockMaxCountReachedError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class ClockApi(Resource):
    def get(self, device_id : str, rownum : int):
        """
        This is an endpoint that returns a clock of a device by its index
        ---
        tags:
            - Clock
        description: Return clock of a device by its index
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
                description: Successfully returned a clock details
                schema:
                    allOf:
                        - $ref: '#/definitions/Clock'
                        - $ref: '#/definitions/ClockOutput'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            clock_module = device.get_module(ModuleType.CLOCKING)
            clock = clock_module.get(rownum)
            schema = ClockSchema()
            return schema.dump(clock)
        except ClockNotFoundException as e:
            raise ClockNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def patch(self, device_id : str, rownum : int):
        """
        This is an endpoint that updates a clock of a device by its index
        ---
        tags:
            - Clock
        description: Update a clock of a device by its index.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true 
            - name: rownum
              in: path 
              type: integer
              required: true
            - name: clock
              in: body
              description: Update a clock of a device
              schema:
                $ref: '#/definitions/Clock'
        responses:
            200:
                description: Successfully updated the clock
                schema:
                    allOf:
                        - $ref: '#/definitions/Clock'
                        - $ref: '#/definitions/ClockOutput'
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
            clock_module = device.get_module(ModuleType.CLOCKING)
            schema = ClockSchema()
            clock = clock_module.update(rownum, schema.load(request.json))
            device.compute_output_power()
            return schema.dump(clock), 200
        except ValidationError as e:
            raise SchemaValidationError
        except ClockNotFoundException as e:
            raise ClockNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def delete(self, device_id : str, rownum : int):
        """
        This is an endpoint that deletes a clock of a device by index
        ---
        tags:
            - Clock
        description: Delete a clock of a device by its index.
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
                description: Successfully deleted the clock
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            clock_module = device.get_module(ModuleType.CLOCKING)
            schema = ClockSchema()
            clock_module.remove(rownum)
            device.compute_output_power()
            return '', 204
        except ClockNotFoundException as e:
            raise ClockNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class ClockConsumptionApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns overall clock power consumption and resource utilization of a device
        ---
        tags:
            - Clock
        description: Returns overall clock power consumption and resource utilization of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
        responses:
            200:
                description: Successfully returned clock power consumption and resource utilization
                schema:
                    $ref: '#/definitions/ClockConsumptionAndResourceUsage'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            clock_module = device.get_module(ModuleType.CLOCKING)
            consumption = clock_module.get_power_consumption()
            messages = clock_module.get_all_messages()
            res = clock_module.get_resources()
            data = {
                'total_clocks_available': res[0],
                'total_clocks_used': res[2],
                'total_plls_available': res[1],
                'total_plls_used': res[3],
                'total_clock_block_power': consumption[0],
                'total_clock_interconnect_power': consumption[1],
                'total_pll_power': consumption[2],
                'messages': messages
            }
            schema = ClockResourcesConsumptionSchema()
            return schema.dump(data)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

clock_api = Blueprint('clock_api', __name__)
api = Api(clock_api, errors=errors)
api.add_resource(ClocksApi, '/devices/<string:device_id>/clocking')
api.add_resource(ClockApi, '/devices/<string:device_id>/clocking/<int:rownum>')
api.add_resource(ClockConsumptionApi, '/devices/<string:device_id>/clocking/consumption')
