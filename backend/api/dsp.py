#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from flask import Blueprint, request
from flask_restful import Api, Resource
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import ModuleType, DeviceNotFoundException, DspNotFoundException
from schema.device_dsp_schemas import DspSchema, DspResourcesConsumptionSchema
from .errors import DeviceNotExistsError, InternalServerError, DspNotExistsError
from .errors import errors

#-------------------------------------------------------------------------------------------#
# endpoints                               | methods                 | classes               #
#-------------------------------------------------------------------------------------------# 
# devices/<device_id>/dsp                 | get, post               | DspsApi               #
# devices/<device_id>/dsp/<rownum>        | get, patch, delete      | DspApi                #
# devices/<device_id>/dsp/consumption     | get                     | DspConsumptionApi     #
#-------------------------------------------------------------------------------------------#

class DspsApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns a list of dsp of a device
        ---
        tags:
            - Dsp
        description: Returns a list of dsp of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: [
                                        {
                                          "name": "test test 1",
                                          "enable": true,
                                          "number_of_multipliers": 11,
                                          "dsp_mode": 0,
                                          "a_input_width": 16,
                                          "b_input_width": 16,
                                          "clock": "CLK_100",
                                          "pipelining": 0,
                                          "toggle_rate": 0.125,
                                          "consumption": {
                                              "dsp_blocks_used": 11,
                                              "clock_frequency": 100000000,
                                              "output_signal_rate": 12.5,
                                              "block_power": 0.004301000000000001,
                                              "interconnect_power": 0.0002816,
                                              "percentage": 28.234086242299796,
                                              "messages": []
                                          }
                                        }
                                      ]
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
        This is an endpoint that create a dsp of a device
        ---
        tags:
            - Dsp
        description: Create a dsp of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "name": "test test 1",
                                        "enable": true,
                                        "number_of_multipliers": 11,
                                        "dsp_mode": 0,
                                        "a_input_width": 16,
                                        "b_input_width": 16,
                                        "clock": "CLK_100",
                                        "pipelining": 0,
                                        "toggle_rate": 0.125,
                                        "consumption": {
                                          "dsp_blocks_used": 11,
                                          "clock_frequency": 100000000,
                                          "output_signal_rate": 12.5,
                                          "block_power": 0.004301000000000001,
                                          "interconnect_power": 0.0002816,
                                          "percentage": 28.234086242299796,
                                          "messages": []
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            dsp_module = device.get_module(ModuleType.DSP)
            schema = DspSchema()
            dsp = dsp_module.add(schema.load(request.json))
            device.compute_output_power()
            return schema.dump(dsp)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class DspApi(Resource):
    def get(self, device_id : str, rownum : int):
        """
        This is an endpoint that returns a dsp details of a device 
        ---
        tags:
            - Dsp
        description: Returns dsp details of a device
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "name": "test test 1",
                                        "enable": true,
                                        "number_of_multipliers": 11,
                                        "dsp_mode": 0,
                                        "a_input_width": 16,
                                        "b_input_width": 16,
                                        "clock": "CLK_100",
                                        "pipelining": 0,
                                        "toggle_rate": 0.125,
                                        "consumption": {
                                          "dsp_blocks_used": 11,
                                          "clock_frequency": 100000000,
                                          "output_signal_rate": 12.5,
                                          "block_power": 0.004301000000000001,
                                          "interconnect_power": 0.0002816,
                                          "percentage": 28.234086242299796,
                                          "messages": []
                                        }
                                      }
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
        This is an endpoint that update a dsp of a device by index
        ---
        tags:
            - Dsp
        description: Update a dsp of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "name": "test test 1",
                                        "enable": true,
                                        "number_of_multipliers": 11,
                                        "dsp_mode": 0,
                                        "a_input_width": 16,
                                        "b_input_width": 16,
                                        "clock": "CLK_100",
                                        "pipelining": 0,
                                        "toggle_rate": 0.125,
                                        "consumption": {
                                          "dsp_blocks_used": 11,
                                          "clock_frequency": 100000000,
                                          "output_signal_rate": 12.5,
                                          "block_power": 0.004301000000000001,
                                          "interconnect_power": 0.0002816,
                                          "percentage": 28.234086242299796,
                                          "messages": []
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            dsp_module = device.get_module(ModuleType.DSP)
            schema = DspSchema()
            dsp = dsp_module.update(rownum, schema.load(request.json))
            device.compute_output_power()
            return schema.dump(dsp)
        except DspNotFoundException as e:
            raise DspNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def delete(self, device_id : str, rownum : int):
        """
        This is an endpoint that delete a dsp of a device by index
        ---
        tags:
            - Dsp
        description: Delete a dsp of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "name": "test test 1",
                                        "enable": true,
                                        "number_of_multipliers": 11,
                                        "dsp_mode": 0,
                                        "a_input_width": 16,
                                        "b_input_width": 16,
                                        "clock": "CLK_100",
                                        "pipelining": 0,
                                        "toggle_rate": 0.125,
                                        "consumption": {
                                          "dsp_blocks_used": 11,
                                          "clock_frequency": 100000000,
                                          "output_signal_rate": 12.5,
                                          "block_power": 0.004301000000000001,
                                          "interconnect_power": 0.0002816,
                                          "percentage": 28.234086242299796,
                                          "messages": []
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            dsp_module = device.get_module(ModuleType.DSP)
            schema = DspSchema()
            dsp = dsp_module.remove(rownum)
            device.compute_output_power()
            return schema.dump(dsp)
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
        description: returns overall dsp power consumption and resource utilization of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "total_dsp_blocks_available": 176,
                                        "total_dsp_blocks_used": 23,
                                        "total_dsp_block_power": 0.015233360000000003,
                                        "total_dsp_interconnect_power": 0.0009973760000000003,
                                        "messages": []
                                      }
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
