#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from flask import Blueprint, request
from flask_restful import Api, Resource
from marshmallow import Schema, fields, ValidationError
from submodule.fabric_logic_element import Glitch_Factor
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import ModuleType, DeviceNotFoundException, FabricLeNotFoundException, \
    FabricLeDescriptionAlreadyExistsException
from .device import MessageSchema
from .errors import DeviceNotExistsError, InternalServerError, FabricLeNotExistsError, \
    FabricLeDescriptionAlreadyExistsError, \
    SchemaValidationError
from .errors import errors

#------------------------------------------------------------------------------------------------#
# endpoints                                  | methods                 | classes                 #
#------------------------------------------------------------------------------------------------# 
# devices/<device_id>/fabric_le              | get, post               | Fabric_LesApi           #
# devices/<device_id>/fabric_le/<rownum>     | get, patch, delete      | Fabric_LeApi            #
# devices/<device_id>/fabric_le/consumption  | get                     | Fabric_LeConsumptionApi #
#------------------------------------------------------------------------------------------------#

class FabricLogicElementResourcesConsumptionSchema(Schema):
    total_lut6_available = fields.Int()
    total_lut6_used = fields.Int()
    total_flip_flop_available = fields.Int()
    total_flip_flop_used = fields.Int()
    total_block_power = fields.Number()
    total_interconnect_power = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class FabricLogicElementOutputSchema(Schema):
    clock_frequency = fields.Int()
    output_signal_rate = fields.Number()
    block_power = fields.Number()
    interconnect_power = fields.Number()
    percentage = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class FabricLogicElementSchema(Schema):
    enable = fields.Bool()
    name = fields.Str()
    lut6 = fields.Int()
    flip_flop = fields.Int()
    clock = fields.Str()
    toggle_rate = fields.Number()
    glitch_factor = fields.Enum(Glitch_Factor, by_value=True)
    clock_enable_rate = fields.Number()
    output = fields.Nested(FabricLogicElementOutputSchema, data_key="consumption")

class Fabric_LesApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns a list of fabric logic elements of a device
        ---
        tags:
            - Fabric Logic Element
        description: Returns a list of fabric logic elements of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
        definitions:
            FabricLE:
                type: object
                properties:
                    enable:
                        type: boolean
                    name:
                        type: string
                    lut6:
                        type: integer
                    flip_flop:
                        type: integer
                    clock:
                        type: string
                    toggle_rate:
                        type: number
                    glitch_factor:
                        type: integer
                        minimum: 0
                        maximum: 2
                    clock_enable_rate:
                        type: number
            FabricLEOutput:
                type: object
                properties:
                    consumption:
                        allOf:
                            - type: object
                              properties:
                                clock_frequency: 
                                    type: integer
                                output_signal_rate: 
                                    type: number
                                block_power: 
                                    type: number
                                interconnect_power: 
                                    type: number
                                percentage: 
                                    type: number
                            - $ref: '#/definitions/ItemMessage'
            FabricLEConsumptionAndResourceUsage:
                allOf:
                    - type: object
                      properties:
                        total_lut6_available:
                            type: integer
                        total_lut6_used:
                            type: integer
                        total_flip_flop_available:
                            type: integer
                        total_flip_flop_used:
                            type: integer
                        total_block_power:
                            type: number
                        total_interconnect_power:
                            type: number
                    - $ref: '#/definitions/ItemMessage'
        responses:
            200:
                description: Successfully returned a list of fabric logic elements
                schema:
                    type: array
                    items:
                        allOf:
                            - $ref: '#/definitions/FabricLE'
                            - $ref: '#/definitions/FabricLEOutput'
            400:
                description: Invalid request
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            fle_module = device.get_module(ModuleType.FABRIC_LE)
            logic_elements = fle_module.get_all()
            schema = FabricLogicElementSchema(many=True)
            return schema.dump(logic_elements)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def post(self, device_id : str):
        """
        This is an endpoint that creates a fabric logic element of a device
        ---
        tags:
            - Fabric Logic Element
        description: Create a fabric logic element of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true 
            - name: fabric_le
              in: body
              description: Create a new fabric logic element of a device
              schema:
                $ref: '#/definitions/FabricLE'
        responses:
            201:
                description: Successfully created a new fabric logic element
                schema:
                    allOf:
                        - $ref: '#/definitions/FabricLE'
                        - $ref: '#/definitions/FabricLEOutput'
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
            fle_module = device.get_module(ModuleType.FABRIC_LE)
            schema = FabricLogicElementSchema()
            logic_element = fle_module.add(schema.load(request.json))
            device.compute_output_power()
            return schema.dump(logic_element), 201
        except ValidationError as e:
            raise SchemaValidationError
        except FabricLeDescriptionAlreadyExistsException as e:
            raise FabricLeDescriptionAlreadyExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class Fabric_LeApi(Resource):
    def get(self, device_id : str, rownum : int):
        """
        This is an endpoint that returns the fabric logic element details of a device by its index
        ---
        tags:
            - Fabric Logic Element
        description: Returns a fabric logic element details of a device by its index
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
                description: Successfully returned a fabric logic element details
                schema:
                    allOf:
                        - $ref: '#/definitions/FabricLE'
                        - $ref: '#/definitions/FabricLEOutput'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            fle_module = device.get_module(ModuleType.FABRIC_LE)
            logic_element = fle_module.get(rownum)
            schema = FabricLogicElementSchema()
            return schema.dump(logic_element)
        except FabricLeNotFoundException as e:
            raise FabricLeNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def patch(self, device_id : str, rownum : int):
        """
        This is an endpoint that updates a fabric logic element of a device by its index
        ---
        tags:
            - Fabric Logic Element
        description: Update a fabric Logic element of a device by its index.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true 
            - name: rownum
              in: path 
              type: integer
              required: true
            - name: fabric_le
              in: body
              description: Update a fabric Logic element of a device
              schema:
                $ref: '#/definitions/FabricLE'
        responses:
            200:
                description: Successfully updated the fabric Logic element
                schema:
                    allOf:
                        - $ref: '#/definitions/FabricLE'
                        - $ref: '#/definitions/FabricLEOutput'
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
            fle_module = device.get_module(ModuleType.FABRIC_LE)
            schema = FabricLogicElementSchema()
            logic_element = fle_module.update(rownum, schema.load(request.json))
            device.compute_output_power()
            return schema.dump(logic_element), 200
        except ValidationError as e:
            raise SchemaValidationError
        except FabricLeNotFoundException as e:
            raise FabricLeNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def delete(self, device_id : str, rownum : int):
        """
        This is an endpoint that deletes a fabric logic element of a device by its index
        ---
        tags:
            - Fabric Logic Element
        description: Delete a fabric logic element of a device by its index.
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
                description: Successfully deleted the fabric logic element
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            fle_module = device.get_module(ModuleType.FABRIC_LE)
            schema = FabricLogicElementSchema()
            fle_module.remove(rownum)
            device.compute_output_power()
            return '', 204
        except FabricLeNotFoundException as e:
            raise FabricLeNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class Fabric_LeConsumptionApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns overall the fabric logic element power consumption and resource utilization of a device
        ---
        tags:
            - Fabric Logic Element
        description: Returns overall the fabric logic element power consumption and resource utilization of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
        responses:
            200:
                description: Successfully returned fabric logic element power consumption and resource utilization
                schema:
                    $ref: '#/definitions/FabricLEConsumptionAndResourceUsage'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            fle_module = device.get_module(ModuleType.FABRIC_LE)
            consumption = fle_module.get_power_consumption()
            messages = fle_module.get_all_messages()
            res = fle_module.get_resources()
            data = {
                'total_lut6_available': res[1],
                'total_lut6_used': res[0],
                'total_flip_flop_available': res[3],
                'total_flip_flop_used': res[2],
                'total_block_power': consumption[0],
                'total_interconnect_power': consumption[1],
                'messages': messages
            }
            schema = FabricLogicElementResourcesConsumptionSchema()
            return schema.dump(data)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

fabric_le_api = Blueprint('fabric_le_api', __name__)
api = Api(fabric_le_api, errors=errors)
api.add_resource(Fabric_LesApi, '/devices/<string:device_id>/fabric_le')
api.add_resource(Fabric_LeApi, '/devices/<string:device_id>/fabric_le/<int:rownum>')
api.add_resource(Fabric_LeConsumptionApi, '/devices/<string:device_id>/fabric_le/consumption')
