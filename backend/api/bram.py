#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from flask import Blueprint, request
from flask_restful import Api, Resource
from marshmallow import Schema, fields, ValidationError
from submodule.bram import BRAM_Type
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import ModuleType, DeviceNotFoundException, BramNotFoundException
from .device import MessageSchema
from .errors import DeviceNotExistsError, InternalServerError, BramNotExistsError, \
    SchemaValidationError
from .errors import errors

#-------------------------------------------------------------------------------------------#
# endpoints                               | methods                 | classes               #
#-------------------------------------------------------------------------------------------# 
# devices/<device_id>/bram                | get, post               | BramsApi              #
# devices/<device_id>/bram/<rownum>       | get, patch, delete      | BramApi               #
# devices/<device_id>/bram/consumption    | get                     | BramConsumptionApi    #
#-------------------------------------------------------------------------------------------#

class BramResourcesConsumptionSchema(Schema):
    total_18k_bram_available = fields.Int()
    total_18k_bram_used = fields.Int()
    total_36k_bram_available = fields.Int()
    total_36k_bram_used = fields.Int()
    total_bram_block_power = fields.Number()
    total_bram_interconnect_power = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class BramPortPropertiesOutputSchema(Schema):
    clock_frequency = fields.Int()
    output_signal_rate = fields.Number()
    ram_depth = fields.Int()

class BramOutputSchema(Schema):
    port_a = fields.Nested(BramPortPropertiesOutputSchema)
    port_b = fields.Nested(BramPortPropertiesOutputSchema)
    block_power = fields.Number()
    interconnect_power = fields.Number()
    percentage = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class BramPortPropertiesSchema(Schema):
    clock = fields.Str()
    width = fields.Int()
    write_enable_rate = fields.Number()
    read_enable_rate = fields.Number()
    toggle_rate = fields.Number()

class BramSchema(Schema):
    enable = fields.Bool()
    name = fields.Str()
    type = fields.Enum(BRAM_Type, by_value=True)
    bram_used = fields.Int()
    port_a = fields.Nested(BramPortPropertiesSchema)
    port_b = fields.Nested(BramPortPropertiesSchema)
    output = fields.Nested(BramOutputSchema, data_key="consumption")

class BramsApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns a list of block ram of a device
        ---
        tags:
            - Block RAM
        description: Returns a list of block ram of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
        definitions:
            BRAMPortProperties:
                type: object
                properties:
                    clock:
                        type: string
                    width:
                        type: integer
                    write_enable_rate:
                        type: number
                    read_enable_rate:
                        type: number
                    toggle_rate:
                        type: number
            BRAMPortPropertiesOutput:
                type: object
                properties:
                    clock_frequency:
                        type: integer
                    output_signal_rate:
                        type: number
                    ram_depth:
                        type: integer
            BRAM:
                type: object
                properties:
                    enable:
                        type: boolean
                    name:
                        type: string
                    type:
                        type: integer
                        minimum: 0
                        maximum: 9
                    bram_used:
                        type: integer
                    port_a:
                        $ref: '#/definitions/BRAMPortProperties'
                    port_b:
                        $ref: '#/definitions/BRAMPortProperties'
            BRAMOutput:
                type: object
                properties:
                    consumption:
                        allOf:
                            - type: object
                              properties:
                                port_a:
                                    $ref: '#/definitions/BRAMPortPropertiesOutput'
                                port_b:
                                    $ref: '#/definitions/BRAMPortPropertiesOutput'
                                block_power:
                                    type: number
                                interconnect_power:
                                    type: number
                                percentage:
                                    type: number
                            - $ref: '#/definitions/ItemMessage'
            BRAMConsumptionAndResourceUsage:
                allOf:
                    - type: object
                      properties:
                        total_18k_bram_available:
                            type: integer
                        total_18k_bram_used:
                            type: integer
                        total_36k_bram_available:
                            type: integer
                        total_36k_bram_used:
                            type: integer
                        total_bram_block_power:
                            type: number
                        total_bram_interconnect_power:
                            type: number
                    - $ref: '#/definitions/ItemMessage'
        responses:
            200:
                description: Successfully returned a list of block rams
                schema:
                    type: array
                    items:
                        allOf:
                            - $ref: '#/definitions/BRAM'
                            - $ref: '#/definitions/BRAMOutput'
            400:
                description: Invalid request
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            bram_module = device.get_module(ModuleType.BRAM)
            brams = bram_module.get_all()
            schema = BramSchema(many=True)
            return schema.dump(brams)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def post(self, device_id : str):
        """
        This is an endpoint that creates a block ram of a device
        ---
        tags:
            - Block RAM
        description: Create a block ram of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true 
            - name: bram
              in: body
              description: Create a new block ram of a device
              schema:
                $ref: '#/definitions/BRAM'
        responses:
            201:
                description: Successfully created a new block ram
                schema:
                    allOf:
                        - $ref: '#/definitions/BRAM'
                        - $ref: '#/definitions/BRAMOutput'
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
            bram_module = device.get_module(ModuleType.BRAM)
            schema = BramSchema()
            bram = bram_module.add(schema.load(request.json))
            device.compute_output_power()
            from submodule.rs_project import RsProjectManager
            RsProjectManager.get_instance().set_modified(True)
            return schema.dump(bram), 201
        except ValidationError as e:
            raise SchemaValidationError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class BramApi(Resource):
    def get(self, device_id : str, rownum : int):
        """
        This is an endpoint that returns a block ram details of a device by its index
        ---
        tags:
            - Block RAM
        description: Return block ram details of a device by its index.
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
                description: Successfully returned a block ram details
                schema:
                    allOf:
                        - $ref: '#/definitions/BRAM'
                        - $ref: '#/definitions/BRAMOutput'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            bram_module = device.get_module(ModuleType.BRAM)
            bram = bram_module.get(rownum)
            schema = BramSchema()
            return schema.dump(bram)
        except BramNotFoundException as e:
            raise BramNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def patch(self, device_id : str, rownum : int):
        """
        This is an endpoint that updates a block ram of a device by its index
        ---
        tags:
            - Block RAM
        description: Update a block ram of a device by its index.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true 
            - name: rownum
              in: path 
              type: integer
              required: true
            - name: bram
              in: body
              description: Update a block ram of a device
              schema:
                $ref: '#/definitions/BRAM'
        responses:
            200:
                description: Successfully updated the block ram
                schema:
                    allOf:
                        - $ref: '#/definitions/BRAM'
                        - $ref: '#/definitions/BRAMOutput'
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
            bram_module = device.get_module(ModuleType.BRAM)
            schema = BramSchema()
            bram = bram_module.update(rownum, schema.load(request.json))
            device.compute_output_power()
            from submodule.rs_project import RsProjectManager
            RsProjectManager.get_instance().set_modified(True)
            return schema.dump(bram), 200
        except ValidationError as e:
            raise SchemaValidationError
        except BramNotFoundException as e:
            raise BramNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def delete(self, device_id : str, rownum : int):
        """
        This is an endpoint that deletes a block ram of a device by its index
        ---
        tags:
            - Block RAM
        description: Delete a block ram of a device  by its index.
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
                description: Successfully deleted the block ram
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            bram_module = device.get_module(ModuleType.BRAM)
            schema = BramSchema()
            bram_module.remove(rownum)
            device.compute_output_power()
            from submodule.rs_project import RsProjectManager
            RsProjectManager.get_instance().set_modified(True)
            return '', 204
        except BramNotFoundException as e:
            raise BramNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class BramConsumptionApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns overall block ram power consumption and resource utilization of a device
        ---
        tags:
            - Block RAM
        description: Return overall block ram power consumption and resource utilization of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
        responses:
            200:
                description: Successfully returned block ram power consumption and resource utilization
                schema:
                    $ref: '#/definitions/BRAMConsumptionAndResourceUsage'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            bram_module = device.get_module(ModuleType.BRAM)
            consumption = bram_module.get_power_consumption()
            messages = bram_module.get_all_messages()
            res = bram_module.get_resources()
            data = {
                'total_18k_bram_available': res[1],
                'total_18k_bram_used': res[0],
                'total_36k_bram_available': res[3],
                'total_36k_bram_used': res[2],
                'total_bram_block_power': consumption[0],
                'total_bram_interconnect_power': consumption[1],
                'messages': messages
            }
            schema = BramResourcesConsumptionSchema()
            return schema.dump(data)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

bram_api = Blueprint('bram_api', __name__)
api = Api(bram_api, errors=errors)
api.add_resource(BramsApi, '/devices/<string:device_id>/bram')
api.add_resource(BramApi, '/devices/<string:device_id>/bram/<int:rownum>')
api.add_resource(BramConsumptionApi, '/devices/<string:device_id>/bram/consumption')
