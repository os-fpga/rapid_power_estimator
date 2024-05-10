#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from flask import Blueprint
from flask_restful import Api, Resource
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import DeviceNotFoundException
from schema.device_schemas import DeviceSchema, DeviceConsumptionSchema
from .errors import DeviceNotExistsError, InternalServerError
from .errors import errors

#---------------------------------------------------------------------------#
# endpoints                       | methods         | classes               #
#---------------------------------------------------------------------------# 
# devices                         | get             | DevicesApi            #
# devices/<device_id>             | get             | DeviceApi             #
# devices/<device_id>/consumption | get             | DeviceConsumptionApi  #
#---------------------------------------------------------------------------#

class DevicesApi(Resource):
    def get(self):
        """
        This is an endpoint that returns a list of supported devices
        ---
        tags:
            - Device
        description: Returns a list of devices.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: [{"id": "MPW1", "series": "Gemini"}]
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
        This is an endpoint that returns details of a device
        ---
        tags:
            - Device
        description: Returns the details of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "id": "MPW1",
                                        "series": "Gemini",
                                        "logic_density": "",
                                        "package": "SBG484",
                                        "speedgrade": "1",
                                        "temperature_grade": "Industrial (-40 to 100 °C)"
                                      }
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
        This is an endpoint to retrieve the total device's power consumption
        ---
        tags:
            - Device
        description: Returns a device's power consumption.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "typical": {
                                            "total_power": 0.044426803487179485,
                                            "thermal": 0
                                        },
                                        "worsecase": {
                                            "total_power": 0.044426803487179485,
                                            "thermal": 0
                                        }
                                      }
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
