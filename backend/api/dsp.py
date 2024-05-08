#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from flask import Blueprint, request
from flask_restful import Api, Resource
from marshmallow import Schema, fields, ValidationError
from submodule.dsp import DSP_Mode, Pipelining
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import ModuleType, DeviceNotFoundException, DspNotFoundException
from schema.device_schemas import MessageSchema
from .errors import DeviceNotExistsError, InternalServerError, DspNotExistsError, \
    SchemaValidationError
from .errors import errors

#-------------------------------------------------------------------------------------------#
# endpoints                               | methods                 | classes               #
#-------------------------------------------------------------------------------------------# 
# devices/<device_id>/dsp                 | get, post               | DspsApi               #
# devices/<device_id>/dsp/<rownum>        | get, patch, delete      | DspApi                #
# devices/<device_id>/dsp/consumption     | get                     | DspConsumptionApi     #
#-------------------------------------------------------------------------------------------#

class DspResourcesConsumptionSchema(Schema):
    total_dsp_blocks_available = fields.Int()
    total_dsp_blocks_used = fields.Int()
    total_dsp_block_power = fields.Number()
    total_dsp_interconnect_power = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class DspOutputSchema(Schema):
    dsp_blocks_used = fields.Number()
    clock_frequency = fields.Int()
    output_signal_rate = fields.Number()
    block_power = fields.Number()
    interconnect_power = fields.Number()
    percentage = fields.Number()
    messages = fields.Nested(MessageSchema, many=True)

class DspSchema(Schema):
    name = fields.Str()
    enable = fields.Bool()
    number_of_multipliers = fields.Int()
    dsp_mode = fields.Enum(DSP_Mode, by_value=True)
    a_input_width = fields.Int()
    b_input_width = fields.Int()
    clock = fields.Str()
    pipelining = fields.Enum(Pipelining, by_value=True)
    toggle_rate = fields.Number()
    output = fields.Nested(DspOutputSchema, data_key="consumption")

class DspsApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns a list of dsp of a device
        ---
        tags:
            - Dsp
        description: Returns a list of dsp of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
        definitions:
            Dsp:
                type: object
                properties:
                    name:
                        type: string
                    enable:
                        type: boolean
                    number_of_multipliers:
                        type: integer
                    dsp_mode:
                        type: integer
                        minimum: 0
                        maximum: 2
                    a_input_width:
                        type: integer
                    b_input_width:
                        type: integer
                    clock:
                        type: string
                    pipelining:
                        type: integer
                        minimum: 0
                        maximum: 3
                    toggle_rate:
                        type: number
            DspOutput:
                type: object
                properties:
                    consumption:
                        allOf:
                            - type: object
                              properties:
                                dsp_blocks_used: 
                                    type: number
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
            DspConsumptionAndResourceUsage:
                allOf:
                    - type: object
                      properties:
                        total_dsp_blocks_available:
                            type: integer
                        total_dsp_blocks_used:
                            type: integer
                        total_dsp_block_power:
                            type: number
                        total_dsp_interconnect_power:
                            type: number
                    - $ref: '#/definitions/ItemMessage'
        responses:
            200:
                description: Successfully returned a list of dsp
                schema:
                    type: array
                    items:
                        allOf:
                            - $ref: '#/definitions/Dsp'
                            - $ref: '#/definitions/DspOutput'
            400:
                description: Invalid request
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            dsp_module = device.get_module(ModuleType.DSP)
            dsps = dsp_module.get_all()
            schema = DspSchema(many=True)
            return schema.dump(dsps)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def post(self, device_id : str):
        """
        This is an endpoint that creates a dsp of a device
        ---
        tags:
            - Dsp
        description: Create a dsp of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true 
            - name: dsp
              in: body
              description: Create a new dsp of a device
              schema:
                $ref: '#/definitions/Dsp'
        responses:
            201:
                description: Successfully created a new dsp
                schema:
                    allOf:
                        - $ref: '#/definitions/Dsp'
                        - $ref: '#/definitions/DspOutput'
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
            dsp_module = device.get_module(ModuleType.DSP)
            schema = DspSchema()
            dsp = dsp_module.add(schema.load(request.json))
            device.compute_output_power()
            return schema.dump(dsp), 201
        except ValidationError as e:
            raise SchemaValidationError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class DspApi(Resource):
    def get(self, device_id : str, rownum : int):
        """
        This is an endpoint that returns a dsp details of a device by its index
        ---
        tags:
            - Dsp
        description: Returns dsp details of a device by its index.
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
                description: Successfully returned a dsp details
                schema:
                    allOf:
                        - $ref: '#/definitions/Dsp'
                        - $ref: '#/definitions/DspOutput'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            dsp_module = device.get_module(ModuleType.DSP)
            dsp = dsp_module.get(rownum)
            schema = DspSchema()
            return schema.dump(dsp)
        except DspNotFoundException as e:
            raise DspNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def patch(self, device_id : str, rownum : int):
        """
        This is an endpoint that updates a dsp of a device by its index
        ---
        tags:
            - Dsp
        description: Update a dsp of a device by its index.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true 
            - name: rownum
              in: path 
              type: integer
              required: true
            - name: dsp
              in: body
              description: Update a dsp of a device
              schema:
                $ref: '#/definitions/Dsp'
        responses:
            200:
                description: Successfully updated the clock
                schema:
                    allOf:
                        - $ref: '#/definitions/Dsp'
                        - $ref: '#/definitions/DspOutput'
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
            dsp_module = device.get_module(ModuleType.DSP)
            schema = DspSchema()
            dsp = dsp_module.update(rownum, schema.load(request.json))
            device.compute_output_power()
            return schema.dump(dsp), 200
        except ValidationError as e:
            raise SchemaValidationError
        except DspNotFoundException as e:
            raise DspNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def delete(self, device_id : str, rownum : int):
        """
        This is an endpoint that delete a dsp of a device by its index
        ---
        tags:
            - Dsp
        description: Delete a dsp of a device its index.
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
                description: Successfully deleted the dsp
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            dsp_module = device.get_module(ModuleType.DSP)
            schema = DspSchema()
            dsp = dsp_module.remove(rownum)
            device.compute_output_power()
            return '', 204
        except DspNotFoundException as e:
            raise DspNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class DspConsumptionApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns overall dsp power consumption and resource utilization of a device
        ---
        tags:
            - Dsp
        description: Returns overall dsp power consumption and resource utilization of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
        responses:
            200:
                description: Successfully returned dsp power consumption and resource utilization
                schema:
                    $ref: '#/definitions/DspConsumptionAndResourceUsage'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            dsp_module = device.get_module(ModuleType.DSP)
            consumption = dsp_module.get_power_consumption()
            messages = dsp_module.get_all_messages()
            res = dsp_module.get_resources()
            data = {
                'total_dsp_blocks_available': res[1],
                'total_dsp_blocks_used': res[0],
                'total_dsp_block_power': consumption[0],
                'total_dsp_interconnect_power': consumption[1],
                'messages': messages
            }
            schema = DspResourcesConsumptionSchema()
            return schema.dump(data)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

dsp_api = Blueprint('dsp_api', __name__)
api = Api(dsp_api, errors=errors)
api.add_resource(DspsApi, '/devices/<string:device_id>/dsp')
api.add_resource(DspApi, '/devices/<string:device_id>/dsp/<int:rownum>')
api.add_resource(DspConsumptionApi, '/devices/<string:device_id>/dsp/consumption')
