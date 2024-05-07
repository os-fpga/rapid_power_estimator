#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from flask import Blueprint, request
from flask_restful import Api, Resource
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import ModuleType, DeviceNotFoundException, BramNotFoundException
from schema.device_bram_schemas import BramSchema, BramResourcesConsumptionSchema
from .errors import DeviceNotExistsError, InternalServerError, BramNotExistsError
from .errors import errors

#-------------------------------------------------------------------------------------------#
# endpoints                               | methods                 | classes               #
#-------------------------------------------------------------------------------------------# 
# devices/<device_id>/bram                | get, post               | BramsApi              #
# devices/<device_id>/bram/<rownum>       | get, patch, delete      | BramApi               #
# devices/<device_id>/bram/consumption    | get                     | BramConsumptionApi    #
#-------------------------------------------------------------------------------------------#

class BramsApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns a list of block ram of a device
        ---
        tags:
            - Block RAM
        description: Returns a list of block ram of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: [
                                        {
                                          "enable": true,
                                          "name": "test 1",
                                          "type": 2,
                                          "bram_used": 16,
                                          "port_a": {
                                            "clock": "CLK_100",
                                            "width": 16,
                                            "write_enable_rate": 0.5,
                                            "read_enable_rate": 0.5,
                                            "toggle_rate": 0.125
                                          },
                                          "port_b": {
                                            "clock": "CLK_233",
                                            "width": 16,
                                            "write_enable_rate": 0.5,
                                            "read_enable_rate": 0.5,
                                            "toggle_rate": 0.125
                                          },
                                          "consumption": {
                                            "port_a": {
                                              "clock_frequency": 100000000,
                                              "output_signal_rate": 6.25,
                                              "ram_depth": 1024
                                            },
                                            "port_b": {
                                              "clock_frequency": 233000000,
                                              "output_signal_rate": 14.5625,
                                              "ram_depth": 1024
                                            },
                                            "block_power": 0.023975999999999997,
                                            "interconnect_power": 0,
                                            "percentage": 61.044912923923,
                                            "messages": []
                                          }
                                        }
                                      ]
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
        This is an endpoint that create a block ram of a device
        ---
        tags:
            - Block RAM
        description: Create a block ram of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "enable": true,
                                        "name": "test 2",
                                        "type": 2,
                                        "bram_used": 17,
                                        "port_a": {
                                          "clock": "CLK_100",
                                          "width": 16,
                                          "write_enable_rate": 0.5,
                                          "read_enable_rate": 0.5,
                                          "toggle_rate": 0.125
                                        },
                                        "port_b": {
                                          "clock": "CLK_100",
                                          "width": 16,
                                          "write_enable_rate": 0.5,
                                          "read_enable_rate": 0.5,
                                          "toggle_rate": 0.125
                                        },
                                        "consumption": {
                                          "port_a": {
                                            "clock_frequency": 100000000,
                                            "output_signal_rate": 6.25,
                                            "ram_depth": 1024
                                          },
                                          "port_b": {
                                            "clock_frequency": 100000000,
                                            "output_signal_rate": 6.25,
                                            "ram_depth": 1024
                                          },
                                          "block_power": 0.0153,
                                          "interconnect_power": 0,
                                          "percentage": 38.95508707607699,
                                          "messages": []
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            bram_module = device.get_module(ModuleType.BRAM)
            schema = BramSchema()
            bram = bram_module.add(schema.load(request.json))
            device.compute_output_power()
            return schema.dump(bram)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class BramApi(Resource):
    def get(self, device_id : str, rownum : int):
        """
        This is an endpoint that returns a block ram details of a device 
        ---
        tags:
            - Block RAM
        description: Returns block ram details of a device
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "enable": true,
                                        "name": "test 2",
                                        "type": 2,
                                        "bram_used": 17,
                                        "port_a": {
                                          "clock": "CLK_100",
                                          "width": 16,
                                          "write_enable_rate": 0.5,
                                          "read_enable_rate": 0.5,
                                          "toggle_rate": 0.125
                                        },
                                        "port_b": {
                                          "clock": "CLK_100",
                                          "width": 16,
                                          "write_enable_rate": 0.5,
                                          "read_enable_rate": 0.5,
                                          "toggle_rate": 0.125
                                        },
                                        "consumption": {
                                          "port_a": {
                                            "clock_frequency": 100000000,
                                            "output_signal_rate": 6.25,
                                            "ram_depth": 1024
                                          },
                                          "port_b": {
                                            "clock_frequency": 100000000,
                                            "output_signal_rate": 6.25,
                                            "ram_depth": 1024
                                          },
                                          "block_power": 0.0153,
                                          "interconnect_power": 0,
                                          "percentage": 38.95508707607699,
                                          "messages": []
                                        }
                                      }
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
        This is an endpoint that update a block ram of a device by index
        ---
        tags:
            - Block RAM
        description: Update a block ram of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "enable": true,
                                        "name": "test 2",
                                        "type": 2,
                                        "bram_used": 17,
                                        "port_a": {
                                          "clock": "CLK_100",
                                          "width": 16,
                                          "write_enable_rate": 0.5,
                                          "read_enable_rate": 0.5,
                                          "toggle_rate": 0.125
                                        },
                                        "port_b": {
                                          "clock": "CLK_100",
                                          "width": 16,
                                          "write_enable_rate": 0.5,
                                          "read_enable_rate": 0.5,
                                          "toggle_rate": 0.125
                                        },
                                        "consumption": {
                                          "port_a": {
                                            "clock_frequency": 100000000,
                                            "output_signal_rate": 6.25,
                                            "ram_depth": 1024
                                          },
                                          "port_b": {
                                            "clock_frequency": 100000000,
                                            "output_signal_rate": 6.25,
                                            "ram_depth": 1024
                                          },
                                          "block_power": 0.0153,
                                          "interconnect_power": 0,
                                          "percentage": 38.95508707607699,
                                          "messages": []
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            bram_module = device.get_module(ModuleType.BRAM)
            schema = BramSchema()
            bram = bram_module.update(rownum, schema.load(request.json))
            device.compute_output_power()
            return schema.dump(bram)
        except BramNotFoundException as e:
            raise BramNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def delete(self, device_id : str, rownum : int):
        """
        This is an endpoint that delete a block ram of a device by index
        ---
        tags:
            - Block RAM
        description: Delete a block ram of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "enable": true,
                                        "name": "test 2",
                                        "type": 2,
                                        "bram_used": 17,
                                        "port_a": {
                                          "clock": "CLK_100",
                                          "width": 16,
                                          "write_enable_rate": 0.5,
                                          "read_enable_rate": 0.5,
                                          "toggle_rate": 0.125
                                        },
                                        "port_b": {
                                          "clock": "CLK_100",
                                          "width": 16,
                                          "write_enable_rate": 0.5,
                                          "read_enable_rate": 0.5,
                                          "toggle_rate": 0.125
                                        },
                                        "consumption": {
                                          "port_a": {
                                            "clock_frequency": 100000000,
                                            "output_signal_rate": 6.25,
                                            "ram_depth": 1024
                                          },
                                          "port_b": {
                                            "clock_frequency": 100000000,
                                            "output_signal_rate": 6.25,
                                            "ram_depth": 1024
                                          },
                                          "block_power": 0.0153,
                                          "interconnect_power": 0,
                                          "percentage": 38.95508707607699,
                                          "messages": []
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            bram_module = device.get_module(ModuleType.BRAM)
            schema = BramSchema()
            bram = bram_module.remove(rownum)
            device.compute_output_power()
            return schema.dump(bram)
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
        description: returns overall block ram power consumption and resource utilization of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "total_18k_bram_available": 256,
                                        "total_18k_bram_used": 33,
                                        "total_36k_bram_available": 128,
                                        "total_36k_bram_used": 0,
                                        "total_bram_block_power": 0.039276,
                                        "total_bram_interconnect_power": 0,
                                        "messages": []
                                      }
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
