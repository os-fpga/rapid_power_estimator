#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from flask import Blueprint, request
from flask_restful import Api, Resource
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import ModuleType, DeviceNotFoundException, ClockNotFoundException
from schema.device_clocking_schemas import ClockingSchema, ClockingResourcesConsumptionSchema
from .errors import DeviceNotExistsError, InternalServerError, ClockNotExistsError, \
    ClockDescriptionPortValidationError, \
    ClockMaxCountReachedException
from .errors import errors

#-------------------------------------------------------------------------------------------#
# endpoints                               | methods                 | classes               #
#-------------------------------------------------------------------------------------------# 
# devices/<device_id>/clock               | get, post               | ClocksApi             #
# devices/<device_id>/clock/<rownum>      | get, patch, delete      | ClockApi              #
# devices/<device_id>/clock/consumption   | get                     | ClockConsumptionApi   #
#-------------------------------------------------------------------------------------------#

class ClocksApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns a list of clocks of a device
        ---
        tags:
            - Clock
        description: Returns a list of clock of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: [
                                        {
                                            "enable": true,
                                            "description": "Default Clock",
                                            "port": "CLK_100",
                                            "source": 0,
                                            "frequency": 100000000,
                                            "state": 1,
                                            "consumption": {
                                                "fan_out": 77,
                                                "block_power": 0.001,
                                                "interconnect_power": 0.00023099999999999998,
                                                "percentage": 31.035543386731607,
                                                "messages": []
                                            }
                                        }
                                      ]
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            clock_module = device.get_module(ModuleType.CLOCKING)
            clocks = clock_module.get_all()
            schema = ClockingSchema(many=True)
            return schema.dump(clocks)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def post(self, device_id : str):
        """
        This is an endpoint that create a clock of a device
        ---
        tags:
            - Clock
        description: Create a clock of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "enable": true,
                                        "description": "Default Clock",
                                        "port": "CLK_100",
                                        "source": 0,
                                        "frequency": 100000000,
                                        "state": 1
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            clock_module = device.get_module(ModuleType.CLOCKING)
            schema = ClockingSchema()
            clock = clock_module.add(schema.load(request.json))
            device.compute_output_power()
            return schema.dump(clock)
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
        This is an endpoint that returns a clock details of a device 
        ---
        tags:
            - Clock
        description: Returns clock details of a device
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "enable": true,
                                        "description": "PLL Clock",
                                        "port": "CLK_233",
                                        "source": 0,
                                        "frequency": 233000000,
                                        "state": 1,
                                        "consumption": {
                                            "fan_out": 58,
                                            "block_power": 0.00233,
                                            "interconnect_power": 0.00040542,
                                            "percentage": 68.96445661326838,
                                            "messages": []
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            clock_module = device.get_module(ModuleType.CLOCKING)
            clock = clock_module.get(rownum)
            schema = ClockingSchema()
            return schema.dump(clock)
        except ClockNotFoundException as e:
            raise ClockNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def patch(self, device_id : str, rownum : int):
        """
        This is an endpoint that update a clock of a device by index
        ---
        tags:
            - Clock
        description: Update a clock of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "enable": true,
                                        "description": "Default Clock",
                                        "port": "CLK_100",
                                        "source": 0,
                                        "frequency": 100000000,
                                        "state": 1,
                                        "consumption": {
                                            "fan_out": 58,
                                            "block_power": 0.00233,
                                            "interconnect_power": 0.00040542,
                                            "percentage": 68.96445661326838,
                                            "messages": []
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            clock_module = device.get_module(ModuleType.CLOCKING)
            schema = ClockingSchema()
            clock = clock_module.update(rownum, schema.load(request.json))
            device.compute_output_power()
            return schema.dump(clock)
        except ClockNotFoundException as e:
            raise ClockNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def delete(self, device_id : str, rownum : int):
        """
        This is an endpoint that delete a clock of a device by index
        ---
        tags:
            - Clock
        description: Delete a clock of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "enable": true,
                                        "description": "Default Clock",
                                        "port": "CLK_100",
                                        "source": 0,
                                        "frequency": 100000000,
                                        "state": 1,
                                        "consumption": {
                                            "fan_out": 58,
                                            "block_power": 0.00233,
                                            "interconnect_power": 0.00040542,
                                            "percentage": 68.96445661326838,
                                            "messages": []
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            clock_module = device.get_module(ModuleType.CLOCKING)
            schema = ClockingSchema()
            clock = clock_module.remove(rownum)
            device.compute_output_power()
            return schema.dump(clock)
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
        description: returns overall clock power consumption and resource utilization of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "total_clocks_available": 16,
                                        "total_clocks_used": 2,
                                        "total_plls_available": 4,
                                        "total_plls_used": 0,
                                        "total_clock_block_power": 0.00333,
                                        "total_clock_interconnect_power": 0.00063642,
                                        "total_pll_power": 0,
                                        "messages": []
                                      }
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
            schema = ClockingResourcesConsumptionSchema()
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
