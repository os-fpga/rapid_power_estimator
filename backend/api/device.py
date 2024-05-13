#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from flask import Blueprint, request
from flask_restful import Api, Resource
from marshmallow import Schema, fields, ValidationError
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import DeviceNotFoundException
from submodule.rs_message import RsMessageType
from .errors import DeviceNotExistsError, InternalServerError, SchemaValidationError
from .errors import errors

#---------------------------------------------------------------------------#
# endpoints                       | methods         | classes               #
#---------------------------------------------------------------------------# 
# devices                         | get             | DevicesApi            #
# devices/<device_id>             | get, patch      | DeviceApi             #
# devices/<device_id>/consumption | get             | DeviceConsumptionApi  #
#---------------------------------------------------------------------------#

class MessageSchema(Schema):
    type = fields.Enum(RsMessageType, by_value=True)
    text = fields.Str()

class AmbientSchema(Schema):
    typical = fields.Number()
    worsecase = fields.Number()

class ThermalSpecSchema(Schema):
    theta_ja = fields.Number()
    ambient = fields.Nested(AmbientSchema)

class TypicalDynamicScalingSchema(Schema):
    fpga_complex = fields.Number()
    processing_complex = fields.Number()

class PowerSpecSchema(Schema):
    budget = fields.Number()
    typical_dynamic_scaling = fields.Nested(TypicalDynamicScalingSchema)

class SpecificationSchema(Schema):
    thermal = fields.Nested(ThermalSpecSchema)
    power = fields.Nested(PowerSpecSchema)

class DeviceSchema(Schema):
    id = fields.Str()
    series = fields.Str()
    logic_density = fields.Str()
    package = fields.Str()
    speedgrade = fields.Str()
    temperature_grade = fields.Str()
    specification = fields.Nested(SpecificationSchema)

class DevicePowerThermalSchema(Schema):
    total_power = fields.Number()
    thermal = fields.Number()

class DeviceConsumptionSchema(Schema):
    worsecase = fields.Nested(DevicePowerThermalSchema)
    typical = fields.Nested(DevicePowerThermalSchema)

class DevicesApi(Resource):
    def get(self):
        """
        This is an endpoint that returns a list of supported devices
        ---
        tags:
            - Device
        description: Return a list of devices.
        definitions:
            HTTPErrorMessage:
                type: object
                properties:
                    message:
                        type: string
            Message:
                type: object
                properties:
                    type:
                        type: string
                    text:
                        type: string
            ItemMessage:
                type: object
                properties:
                    messages:
                        type: array
                        items:
                            $ref: '#/definitions/Message'
            DeviceSummary:
                type: object
                properties:
                    id:
                        type: string
                    series:
                        type: string
            Device:
                type: object
                properties:
                    id:
                        type: string
                    series:
                        type: string
                    logic_density:
                        type: string
                    package:
                        type: string
                    speedgrade:
                        type: string
                    temperature_grade:
                        type: string
            DevicePowerThermal:
                type: object
                properties:
                    total_power:
                        type: number
                    thermal:
                        type: number
            DeviceConsumption:
                type: object
                properties:
                    worsecase:
                        $ref: '#/definitions/DevicePowerThermal'
                    typical:
                        $ref: '#/definitions/DevicePowerThermal'
            Ambient:
                type: object
                properties:
                    typical:
                        type: number
                    worsecase:
                        type: number
            TypicalDynamicScaling:
                type: object
                properties:
                    fpga_complex:
                        type: number
                    processing_complex:
                        type: number
            Thermal:
                type: object
                properties:
                    theta_ja:
                        type: number
                    ambient:
                        $ref: '#/definitions/Ambient'
            Power:
                type: object
                properties:
                    budget:
                        type: number
                    typical_dynamic_scaling:
                        $ref: '#/definitions/TypicalDynamicScaling'
            Specification:
                type: object
                properties:
                    specification:
                        type: object
                        properties:
                            thermal:
                                $ref: '#/definitions/Thermal'
                            power:
                                $ref: '#/definitions/Power'
        responses:
            200:
                description: Successfully returned a list of devices
                schema:
                    type: array
                    items:
                        $ref: '#/definitions/DeviceSummary'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            schema = DeviceSchema(many=True, only=('id', 'series'))
            return schema.dump(device_mgr.get_device_all())
        except Exception as e:
            raise InternalServerError

class DeviceApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns the details of a device
        ---
        tags:
            - Device
        description: Return the details of a device.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
        responses:
            200:
                description: Successfully returned the details of a device
                schema:
                    allOf:
                        - $ref: '#/definitions/Device'
                        - $ref: '#/definitions/Specification'
            400:
                description: Invalid request
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            schema = DeviceSchema()
            return schema.dump(device)
        except DeviceNotFoundException as e:
           raise DeviceNotExistsError
        except Exception as e:
           raise InternalServerError

    def patch(self, device_id : str):
        """
        This is an endpoint that updates the power and thermal spec of a device
        ---
        tags:
            - Device
        description: Update the power and thermal spec of a device.
        parameters:
            - name: device_id
              in: path
              type: string
              required: true
            - name: spec
              in: body
              description: Update the power and thermal spec of a device
              schema:
                $ref: '#/definitions/Specification'
        responses:
            200:
                description: Successfully updated the power and thermal spec
                schema:
                    allOf:
                        - $ref: '#/definitions/Device'
                        - $ref: '#/definitions/Specification'
            400:
                description: Invalid request
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            schema = DeviceSchema()
            device.update_spec(schema.load(request.json))
            return schema.dump(device), 200
        except ValidationError as e:
            raise SchemaValidationError
        except DeviceNotFoundException as e:
           raise DeviceNotExistsError
        except Exception as e:
           raise InternalServerError

class DeviceConsumptionApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns the total power consumption of a device
        ---
        tags:
            - Device
        description: Returns the total power consumption.
        parameters:
            - name: device_id
              in: path 
              type: string
              required: true
        responses:
            200:
                description: Successfully returned the total power consumption
                schema:
                    $ref: '#/definitions/DeviceConsumption'
            400:
                description: Invalid request
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            schema = DeviceConsumptionSchema()
            return schema.dump(device.get_power_consumption())
        except DeviceNotFoundException as e:
           raise DeviceNotExistsError
        except Exception as e:
           raise InternalServerError

device_api = Blueprint('device_api', __name__)
api = Api(device_api, errors=errors)
api.add_resource(DevicesApi, '/devices')
api.add_resource(DeviceApi, '/devices/<string:device_id>')
api.add_resource(DeviceConsumptionApi, '/devices/<string:device_id>/consumption')
