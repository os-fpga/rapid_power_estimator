#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from flask import Blueprint
from flask_restful import Api, Resource
from marshmallow import Schema, fields
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import DeviceNotFoundException
from submodule.rs_message import RsMessageType
from .errors import DeviceNotExistsError, InternalServerError
from .errors import errors

#---------------------------------------------------------------------------#
# endpoints                       | methods         | classes               #
#---------------------------------------------------------------------------# 
# devices                         | get             | DevicesApi            #
# devices/<device_id>             | get             | DeviceApi             #
# devices/<device_id>/consumption | get             | DeviceConsumptionApi  #
#---------------------------------------------------------------------------#

class MessageSchema(Schema):
    type = fields.Enum(RsMessageType, by_value=True)
    text = fields.Str()

class DeviceSchema(Schema):
    id = fields.Str()
    series = fields.Str()
    logic_density = fields.Str()
    package = fields.Str()
    speedgrade = fields.Str()
    temperature_grade = fields.Str()

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
                    $ref: '#/definitions/Device'
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
