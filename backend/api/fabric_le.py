#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from flask import Blueprint, request
from flask_restful import Api, Resource
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import ModuleType, DeviceNotFoundException, FabricLeNotFoundException, \
    FabricLeDescriptionAlreadyExistsException
from schema.device_fabric_logic_element_schemas import FabricLogicElementSchema, FabricLogicElementResourcesConsumptionSchema
from .errors import DeviceNotExistsError, InternalServerError, FabricLeNotExistsError, \
    FabricLeDescriptionAlreadyExistsError
from .errors import errors

#------------------------------------------------------------------------------------------------#
# endpoints                                  | methods                 | classes                 #
#------------------------------------------------------------------------------------------------# 
# devices/<device_id>/fabric_le              | get, post               | Fabric_LesApi           #
# devices/<device_id>/fabric_le/<rownum>     | get, patch, delete      | Fabric_LeApi            #
# devices/<device_id>/fabric_le/consumption  | get                     | Fabric_LeConsumptionApi #
#------------------------------------------------------------------------------------------------#

class Fabric_LesApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns a list of fabric logic elements of a device
        ---
        tags:
            - Fabric Logic Element
        description: Returns a list of fabric logic elements of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: [
                                        {
                                          "enable": true,
                                          "name": "Test 1",
                                          "lut6": 20,
                                          "flip_flop": 50,
                                          "clock": "CLK_100",
                                          "toggle_rate": 0.125,
                                          "glitch_factor": 0,
                                          "clock_enable_rate": 0.5,
                                          "consumption": {
                                              "clock_frequency": 100000000,
                                              "output_signal_rate": 6.25,
                                              "block_power": 0.00009866200466200468,
                                              "interconnect_power": 0.000009600000000000003,
                                              "percentage": 42.682072614185145,
                                              "messages": []
                                          }
                                        }
                                      ]
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
        This is an endpoint that create a fabric logic element of a device
        ---
        tags:
            - Fabric Logic Element
        description: Create a dsp of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "enable": true,
                                        "name": "Test 1",
                                        "lut6": 20,
                                        "flip_flop": 50,
                                        "clock": "CLK_100",
                                        "toggle_rate": 0.125,
                                        "glitch_factor": 0,
                                        "clock_enable_rate": 0.5,
                                        "consumption": {
                                            "clock_frequency": 100000000,
                                            "output_signal_rate": 6.25,
                                            "block_power": 0.00009866200466200468,
                                            "interconnect_power": 0.000009600000000000003,
                                            "percentage": 42.682072614185145,
                                            "messages": []
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            fle_module = device.get_module(ModuleType.FABRIC_LE)
            schema = FabricLogicElementSchema()
            logic_element = fle_module.add(schema.load(request.json))
            device.compute_output_power()
            return schema.dump(logic_element)
        except FabricLeDescriptionAlreadyExistsException as e:
            raise FabricLeDescriptionAlreadyExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class Fabric_LeApi(Resource):
    def get(self, device_id : str, rownum : int):
        """
        This is an endpoint that returns the fabric logic element details of a device 
        ---
        tags:
            - Fabric Logic Element
        description: Returns a fabric logic element details of a device
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "enable": true,
                                        "name": "Test 1",
                                        "lut6": 20,
                                        "flip_flop": 50,
                                        "clock": "CLK_100",
                                        "toggle_rate": 0.125,
                                        "glitch_factor": 0,
                                        "clock_enable_rate": 0.5,
                                        "consumption": {
                                            "clock_frequency": 100000000,
                                            "output_signal_rate": 6.25,
                                            "block_power": 0.00009866200466200468,
                                            "interconnect_power": 0.000009600000000000003,
                                            "percentage": 42.682072614185145,
                                            "messages": []
                                        }
                                      }
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
        This is an endpoint that update a fabric logic element of a device by index
        ---
        tags:
            - Fabric Logic Element
        description: Update a fabric Logic element of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "enable": true,
                                        "name": "Test 1",
                                        "lut6": 20,
                                        "flip_flop": 50,
                                        "clock": "CLK_100",
                                        "toggle_rate": 0.125,
                                        "glitch_factor": 0,
                                        "clock_enable_rate": 0.5,
                                        "consumption": {
                                            "clock_frequency": 100000000,
                                            "output_signal_rate": 6.25,
                                            "block_power": 0.00009866200466200468,
                                            "interconnect_power": 0.000009600000000000003,
                                            "percentage": 42.682072614185145,
                                            "messages": []
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            fle_module = device.get_module(ModuleType.FABRIC_LE)
            schema = FabricLogicElementSchema()
            logic_element = fle_module.update(rownum, schema.load(request.json))
            device.compute_output_power()
            return schema.dump(logic_element)
        except FabricLeNotFoundException as e:
            raise FabricLeNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def delete(self, device_id : str, rownum : int):
        """
        This is an endpoint that delete a fabric logic element of a device by index
        ---
        tags:
            - Fabric Logic Element
        description: Delete a fabric logic element of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "enable": true,
                                        "name": "Test 1",
                                        "lut6": 20,
                                        "flip_flop": 50,
                                        "clock": "CLK_100",
                                        "toggle_rate": 0.125,
                                        "glitch_factor": 0,
                                        "clock_enable_rate": 0.5,
                                        "consumption": {
                                            "clock_frequency": 100000000,
                                            "output_signal_rate": 6.25,
                                            "block_power": 0.00009866200466200468,
                                            "interconnect_power": 0.000009600000000000003,
                                            "percentage": 42.682072614185145,
                                            "messages": []
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            fle_module = device.get_module(ModuleType.FABRIC_LE)
            schema = FabricLogicElementSchema()
            logic_element = fle_module.remove(rownum)
            device.compute_output_power()
            return schema.dump(logic_element)
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
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "total_lut6_available": 160,
                                        "total_lut6_used": 30,
                                        "total_flip_flop_available": 320,
                                        "total_flip_flop_used": 80,
                                        "total_block_power": 0.0002309994871794872,
                                        "total_interconnect_power": 0.000022648000000000004,
                                        "messages": []
                                      }
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
