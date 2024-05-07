#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from flask import Blueprint, request
from flask_restful import Api, Resource
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import ModuleType, DeviceNotFoundException, IONotFoundException
from schema.device_io_schemas import IoSchema, IoResourcesConsumptionSchema
from .errors import DeviceNotExistsError, InternalServerError, IONotExistsError
from .errors import errors

#-------------------------------------------------------------------------------------------#
# endpoints                               | methods                 | classes               #
#-------------------------------------------------------------------------------------------# 
# devices/<device_id>/io                  | get, post               | IosApi                #
# devices/<device_id>/io/<rownum>         | get, patch, delete      | IoApi                 #
# devices/<device_id>/io/consumption      | get                     | IoConsumptionApi      #
#-------------------------------------------------------------------------------------------#

class IosApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns a list of IO of a device
        ---
        tags:
            - IO
        description: Returns a list of IO of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: [
                                        {
                                            "enable": true,
                                            "name": "test 1",
                                            "bus_width": 1,
                                            "direction": 0,
                                            "io_standard": 3,
                                            "drive_strength": 6,
                                            "slew_rate": 1,
                                            "differential_termination": 0,
                                            "io_data_type": 2,
                                            "clock": "CLK_100",
                                            "toggle_rate": 0.125,
                                            "duty_cycle": 0.5,
                                            "synchronization": 1,
                                            "input_enable_rate": 1,
                                            "output_enable_rate": 0,
                                            "io_pull_up_down": 0,
                                            "consumption": {
                                                "bank_type": 0,
                                                "bank_number": 0,
                                                "vccio_voltage": 1.8,
                                                "io_signal_rate": 0,
                                                "block_power": 0,
                                                "interconnect_power": 0,
                                                "percentage": 0,
                                                "messages": []
                                            }
                                        }
                                      ]
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            io_module = device.get_module(ModuleType.IO)
            ios = io_module.get_all()
            schema = IoSchema(many=True)
            return schema.dump(ios)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def post(self, device_id : str):
        """
        This is an endpoint that create a IO of a device
        ---
        tags:
            - IO
        description: Create a IO of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "enable": true,
                                        "name": "test 1",
                                        "bus_width": 1,
                                        "direction": 0,
                                        "io_standard": 3,
                                        "drive_strength": 6,
                                        "slew_rate": 1,
                                        "differential_termination": 0,
                                        "io_data_type": 2,
                                        "clock": "CLK_100",
                                        "toggle_rate": 0.125,
                                        "duty_cycle": 0.5,
                                        "synchronization": 1,
                                        "input_enable_rate": 1,
                                        "output_enable_rate": 0,
                                        "io_pull_up_down": 0,
                                        "consumption": {
                                            "bank_type": 0,
                                            "bank_number": 0,
                                            "vccio_voltage": 1.8,
                                            "io_signal_rate": 0,
                                            "block_power": 0,
                                            "interconnect_power": 0,
                                            "percentage": 0,
                                            "messages": []
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            io_module = device.get_module(ModuleType.IO)
            schema = IoSchema()
            io = io_module.add(schema.load(request.json))
            device.compute_output_power()
            return schema.dump(io)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class IoApi(Resource):
    def get(self, device_id : str, rownum : int):
        """
        This is an endpoint that returns a IO details of a device 
        ---
        tags:
            - IO
        description: Returns IO details of a device
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "enable": false,
                                        "name": "test 2",
                                        "bus_width": 1,
                                        "direction": 0,
                                        "io_standard": 3,
                                        "drive_strength": 6,
                                        "slew_rate": 1,
                                        "differential_termination": 0,
                                        "io_data_type": 2,
                                        "clock": "CLK_233",
                                        "toggle_rate": 0.125,
                                        "duty_cycle": 0.5,
                                        "synchronization": 1,
                                        "input_enable_rate": 1,
                                        "output_enable_rate": 0,
                                        "io_pull_up_down": 0,
                                        "consumption": {
                                            "bank_type": 0,
                                            "bank_number": 0,
                                            "vccio_voltage": 1.8,
                                            "io_signal_rate": 0,
                                            "block_power": 0,
                                            "interconnect_power": 0,
                                            "percentage": 0,
                                            "messages": [
                                                {
                                                    "type": "info",
                                                    "text": "IO is disabled"
                                                }
                                            ]
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            io_module = device.get_module(ModuleType.IO)
            io = io_module.get(rownum)
            schema = IoSchema()
            return schema.dump(io)
        except IONotFoundException as e:
            raise IONotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def patch(self, device_id : str, rownum : int):
        """
        This is an endpoint that update a IO of a device by index
        ---
        tags:
            - IO
        description: Update a IO of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "enable": false,
                                        "name": "test 2",
                                        "bus_width": 1,
                                        "direction": 0,
                                        "io_standard": 3,
                                        "drive_strength": 6,
                                        "slew_rate": 1,
                                        "differential_termination": 0,
                                        "io_data_type": 2,
                                        "clock": "CLK_233",
                                        "toggle_rate": 0.125,
                                        "duty_cycle": 0.5,
                                        "synchronization": 1,
                                        "input_enable_rate": 1,
                                        "output_enable_rate": 0,
                                        "io_pull_up_down": 0,
                                        "consumption": {
                                            "bank_type": 0,
                                            "bank_number": 0,
                                            "vccio_voltage": 1.8,
                                            "io_signal_rate": 0,
                                            "block_power": 0,
                                            "interconnect_power": 0,
                                            "percentage": 0,
                                            "messages": [
                                                {
                                                    "type": "info",
                                                    "text": "IO is disabled"
                                                }
                                            ]
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            io_module = device.get_module(ModuleType.IO)
            schema = IoSchema()
            io = io_module.update(rownum, schema.load(request.json))
            device.compute_output_power()
            return schema.dump(io)
        except IONotFoundException as e:
            raise IONotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def delete(self, device_id : str, rownum : int):
        """
        This is an endpoint that delete a IO of a device by index
        ---
        tags:
            - IO
        description: Delete a IO of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "enable": false,
                                        "name": "test 2",
                                        "bus_width": 1,
                                        "direction": 0,
                                        "io_standard": 3,
                                        "drive_strength": 6,
                                        "slew_rate": 1,
                                        "differential_termination": 0,
                                        "io_data_type": 2,
                                        "clock": "CLK_233",
                                        "toggle_rate": 0.125,
                                        "duty_cycle": 0.5,
                                        "synchronization": 1,
                                        "input_enable_rate": 1,
                                        "output_enable_rate": 0,
                                        "io_pull_up_down": 0,
                                        "consumption": {
                                            "bank_type": 0,
                                            "bank_number": 0,
                                            "vccio_voltage": 1.8,
                                            "io_signal_rate": 0,
                                            "block_power": 0,
                                            "interconnect_power": 0,
                                            "percentage": 0,
                                            "messages": [
                                                {
                                                    "type": "info",
                                                    "text": "IO is disabled"
                                                }
                                            ]
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            io_module = device.get_module(ModuleType.IO)
            schema = IoSchema()
            io = io_module.remove(rownum)
            device.compute_output_power()
            return schema.dump(io)
        except IONotFoundException as e:
            raise IONotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class IoConsumptionApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns overall IO power consumption and resource utilization of a device
        ---
        tags:
            - IO
        description: returns overall IO power consumption and resource utilization of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "total_block_power": 0,
                                        "total_interconnect_power": 0,
                                        "total_on_die_termination_power": 0,
                                        "io_usage": [
                                            {
                                                "type": "HP",
                                                "total_banks_available": 0,
                                                "total_io_available": 0,
                                                "usage": [
                                                    {
                                                        "voltage": 1.2,
                                                        "banks_used": 0,
                                                        "io_used": 0,
                                                        "io_available": 0
                                                    },
                                                    {
                                                        "voltage": 1.5,
                                                        "banks_used": 0,
                                                        "io_used": 0,
                                                        "io_available": 0
                                                    },
                                                    {
                                                        "voltage": 1.8,
                                                        "banks_used": 0,
                                                        "io_used": 0,
                                                        "io_available": 0
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "HR",
                                                "total_banks_available": 0,
                                                "total_io_available": 0,
                                                "usage": [
                                                    {
                                                        "voltage": 1.8,
                                                        "banks_used": 0,
                                                        "io_used": 0,
                                                        "io_available": 0
                                                    },
                                                    {
                                                        "voltage": 2.5,
                                                        "banks_used": 0,
                                                        "io_used": 0,
                                                        "io_available": 0
                                                    },
                                                    {
                                                        "voltage": 3.3,
                                                        "banks_used": 0,
                                                        "io_used": 0,
                                                        "io_available": 0
                                                    }
                                                ]
                                            }
                                        ],
                                        "io_on_die_termination": [
                                            {
                                                "bank_number": 1,
                                                "odt": false,
                                                "power": 0
                                            },
                                            {
                                                "bank_number": 2,
                                                "odt": false,
                                                "power": 0
                                            },
                                            {
                                                "bank_number": 3,
                                                "odt": false,
                                                "power": 0
                                            }
                                        ],
                                        "messages": [
                                            {
                                                "type": "info",
                                                "text": "IO is disabled"
                                            }
                                        ]
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            io_module = device.get_module(ModuleType.IO)
            consumption = io_module.get_power_consumption()
            messages = io_module.get_all_messages()
            res = io_module.get_resources()
            data = {
                'total_block_power': consumption[0],
                'total_interconnect_power': consumption[1],
                'total_on_die_termination_power': consumption[1],
                'io_usage': res[0],
                'io_on_die_termination': res[1],
                'messages': messages
            }
            schema = IoResourcesConsumptionSchema()
            return schema.dump(data)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

io_api = Blueprint('io_api', __name__)
api = Api(io_api, errors=errors)
api.add_resource(IosApi, '/devices/<string:device_id>/io')
api.add_resource(IoApi, '/devices/<string:device_id>/io/<int:rownum>')
api.add_resource(IoConsumptionApi, '/devices/<string:device_id>/io/consumption')
