#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from flask import Blueprint, request
from flask_restful import Api, Resource
from utilities.common_utils import get_enum_by_value
from submodule.peripherals import PeripheralType
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device_resources import ModuleType, DeviceNotFoundException, PeripheralNotFoundException, \
    InvalidPeripheralTypeException, PeripheralEndpointNotFoundException
from schema.device_peripheral_schemas import PeripheralUrlSchema, PeripheralConsumptionSchema, \
    PeripheralSchema, EndpointSchema, FpgaComplexEndpointSchema
from .errors import DeviceNotExistsError, InternalServerError, PeripheralNotExistsError, \
    InvalidPeripheralTypeError, PeripheralEndpointNotExistsError
from .errors import errors

#------------------------------------------------------------------------------------------------------------#
# endpoints                                                        | methods     | classes                   #
#------------------------------------------------------------------------------------------------------------# 
# devices/<device_id>/peripherals                                  | get         | PeripheralsApi            #
# devices/<device_id>/peripherals/consumption                      | get         | PeripheralsConsumptionApi #
# devices/<device_id>/peripherals/<periph>/<rownum>                | get, patch  | PeripheralApi             #
# devices/<device_id>/peripherals/<periph>/<rownum>/ep/<endpoint>  | get, patch  | PeripheralEndpointApi     #
#------------------------------------------------------------------------------------------------------------#

class PeripheralsApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns a list of soc peripherals of a device
        ---
        tags:
            - Peripherals
        description: Returns a list of soc peripherals of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "spi": [
                                            {
                                                "href": "spi/0",
                                                "name": "SPI/QSPI"
                                            }
                                        ],
                                        "jtag": [
                                            {
                                                "href": "jtag/0",
                                                "name": "JTAG"
                                            }
                                        ],
                                        "i2c": [
                                            {
                                                "href": "i2c/0",
                                                "name": "I2C"
                                            }
                                        ],
                                        "uart": [
                                            {
                                                "href": "uart/0",
                                                "name": "UART0 (BCPU)"
                                            },
                                            {
                                                "href": "uart/1",
                                                "name": "UART1 (ACPU)"
                                            }
                                        ],
                                        "usb2": [
                                            {
                                                "href": "usb2/0",
                                                "name": "USB 2.0"
                                            }
                                        ],
                                        "gige": [
                                            {
                                                "href": "gige/0",
                                                "name": "GigE"
                                            }
                                        ],
                                        "gpio": [
                                            {
                                                "href": "gpio/0",
                                                "name": "GPIO (BCPU)"
                                            },
                                            {
                                                "href": "gpio/1",
                                                "name": "GPIO (ACPU)"
                                            },
                                            {
                                                "href": "gpio/2",
                                                "name": "GPIO (Fabric)"
                                            }
                                        ],
                                        "pwm": [
                                            {
                                                "href": "pwm/0",
                                                "name": "PWM"
                                            }
                                        ],
                                        "dma": [
                                            {
                                                "href": "dma/0",
                                                "name": "Channel 1"
                                            },
                                            {
                                                "href": "dma/1",
                                                "name": "Channel 2"
                                            },
                                            {
                                                "href": "dma/2",
                                                "name": "Channel 3"
                                            },
                                            {
                                                "href": "dma/3",
                                                "name": "Channel 4"
                                            }
                                        ],
                                        "bcpu": [
                                            {
                                                "href": "bcpu/0",
                                                "name": "N22 RISC-V"
                                            }
                                        ],
                                        "acpu": [
                                            {
                                                "href": "acpu/0",
                                                "name": "A45 RISC-V"
                                            }
                                        ],
                                        "memory": [
                                            {
                                                "href": "memory/0",
                                                "name": "DDR"
                                            },
                                            {
                                                "href": "memory/1",
                                                "name": "OCM"
                                            }
                                        ],
                                        "fpga_complex": [
                                            {
                                                "href": "fpga_complex/0",
                                                "name": "FPGA Complex"
                                            }
                                        ]
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            periph_module = device.get_module(ModuleType.SOC_PERIPHERALS)
            peripherals = periph_module.get_all()
            peripherals_by_type = {}
            # group peripherals by their type
            for item in peripherals:
                if item.peripheral_type.value in peripherals_by_type:
                    peripherals_by_type[item.peripheral_type.value].append(item)
                else:
                    peripherals_by_type[item.peripheral_type.value] = [item]
            schema = PeripheralUrlSchema()
            return schema.dump(peripherals_by_type)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class PeripheralsConsumptionApi(Resource):
    def get(self, device_id : str):
        """
        This is an endpoint that returns overall soc peripherals power consumption and resource utilization of a device
        ---
        tags:
            - Peripherals
        description: returns overall soc peripherals power consumption and resource utilization of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "total_acpu_power": 0.013,
                                        "total_bcpu_power": 0.003,
                                        "total_dma_power": 0.001,
                                        "total_memory_power": 0.347,
                                        "total_noc_interconnect_power": 0.0001,
                                        "total_peripherals_power": 0.024,
                                        "total_soc_io_available": 20,
                                        "total_soc_io_used": 40,
                                        "messages": []
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            periph_module = device.get_module(ModuleType.SOC_PERIPHERALS)
            consumption = periph_module.get_power_consumption()
            messages = periph_module.get_all_messages()
            res = periph_module.get_resources()
            data = {
                'total_memory_power': consumption[0],
                'total_peripherals_power': consumption[1],
                'total_acpu_power': consumption[2],
                'total_dma_power': consumption[3],
                'total_noc_interconnect_power': consumption[4],
                'total_bcpu_power': consumption[5],
                'total_soc_io_available': res[0],
                'total_soc_io_used': res[1],
                'messages': messages
            }
            schema = PeripheralConsumptionSchema()
            return schema.dump(data)
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class PeripheralApi(Resource):
    def get(self, device_id : str, periph : str, rownum : int):
        """
        This is an endpoint that returns a peripheral details of a device 
        ---
        tags:
            - Peripherals
        description: Returns peripheral details of a device
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "name": "A45 RISC-V",
                                        "enable": false,
                                        "frequency": 0,
                                        "load": 2,
                                        "ports": [
                                            {
                                                "href": "ep/0",
                                                "name": ""
                                            },
                                            {
                                                "href": "ep/1",
                                                "name": ""
                                            },
                                            {
                                                "href": "ep/2",
                                                "name": ""
                                            },
                                            {
                                                "href": "ep/3",
                                                "name": ""
                                            }
                                        ],
                                        "consumption": {
                                            "block_power": 0
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            periph_module = device.get_module(ModuleType.SOC_PERIPHERALS)
            peripheral = periph_module.get_peripheral(get_enum_by_value(PeripheralType, periph), rownum)
            schema = PeripheralSchema.create_schema(peripheral.peripheral_type)
            return schema.dump(peripheral)
        except InvalidPeripheralTypeException as e:
            raise InvalidPeripheralTypeError
        except PeripheralNotFoundException as e:
            raise PeripheralNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def patch(self, device_id : str, periph : str, rownum : int):
        """
        This is an endpoint that update a peripheral details of a device by index
        ---
        tags:
            - Peripherals
        description: Update a peripheral details of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "name": "JTAG",
                                        "enable": true,
                                        "usage": 1,
                                        "clock_frequency": 0,
                                        "consumption": {
                                            "calculated_bandwidth": 0,
                                            "block_power": 0,
                                            "percentage": 0,
                                            "messages": []
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            periph_module = device.get_module(ModuleType.SOC_PERIPHERALS)
            schema = PeripheralSchema.create_schema(get_enum_by_value(PeripheralType, periph))
            peripheral = periph_module.update_peripheral(get_enum_by_value(PeripheralType, periph), rownum, schema.load(request.json))
            device.compute_output_power()
            return schema.dump(peripheral)
        except InvalidPeripheralTypeException as e:
            raise InvalidPeripheralTypeError
        except PeripheralNotFoundException as e:
            raise PeripheralNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

class PeripheralEndpointApi(Resource):
    def get(self, device_id : str, periph : str, rownum : int, endpoint : int):
        """
        This is an endpoint that returns an endpoint of a peripheral of a device
        ---
        tags:
            - Peripherals
        description: Returns an endpoints of a peripheral of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "name": "",
                                        "activity": 0,
                                        "read_write_rate": 0.5,
                                        "toggle_rate": 0.125,
                                        "consumption": {
                                            "calculated_bandwidth": 0,
                                            "noc_power": 0,
                                            "messages": []
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            periph_module = device.get_module(ModuleType.SOC_PERIPHERALS)
            ep = periph_module.get_endpoint(get_enum_by_value(PeripheralType, periph), rownum, endpoint)
            if get_enum_by_value(PeripheralType, periph) == PeripheralType.FPGA_COMPLEX:
                schema = FpgaComplexEndpointSchema()
            else:
                schema = EndpointSchema()
            return schema.dump(ep)
        except PeripheralEndpointNotFoundException as e:
            raise PeripheralEndpointNotExistsError
        except InvalidPeripheralTypeException as e:
            raise InvalidPeripheralTypeError
        except PeripheralNotFoundException as e:
            raise PeripheralNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

    def patch(self, device_id : str, periph : str, rownum : int, endpoint : int):
        """
        This is an endpoint that updates an endpoint of a peripheral of a device
        ---
        tags:
            - Peripherals
        description: Updates an endpoints of a peripheral of a device.
        responses:
            200:
                description: A successful response
                examples:
                    application/json: {
                                        "name": "test 1",
                                        "activity": 0,
                                        "read_write_rate": 0.5,
                                        "toggle_rate": 0.125,
                                        "consumption": {
                                            "calculated_bandwidth": 0,
                                            "noc_power": 0,
                                            "messages": []
                                        }
                                      }
        """
        try:
            device_mgr = RsDeviceManager.get_instance()
            device = device_mgr.get_device(device_id)
            periph_module = device.get_module(ModuleType.SOC_PERIPHERALS)
            if get_enum_by_value(PeripheralType, periph) == PeripheralType.FPGA_COMPLEX:
                schema = FpgaComplexEndpointSchema()
            else:
                schema = EndpointSchema()
            ep = periph_module.update_endpoint(get_enum_by_value(PeripheralType, periph), rownum, endpoint, schema.load(request.json))
            device.compute_output_power()
            return schema.dump(ep)
        except PeripheralEndpointNotFoundException as e:
            raise PeripheralEndpointNotExistsError
        except InvalidPeripheralTypeException as e:
            raise InvalidPeripheralTypeError
        except PeripheralNotFoundException as e:
            raise PeripheralNotExistsError
        except DeviceNotFoundException as e:
            raise DeviceNotExistsError
        except Exception as e:
            raise InternalServerError

peripherals_api = Blueprint('peripheral_api', __name__)
api = Api(peripherals_api, errors=errors)
api.add_resource(PeripheralsApi, '/devices/<string:device_id>/peripherals')
api.add_resource(PeripheralsConsumptionApi, '/devices/<string:device_id>/peripherals/consumption')
api.add_resource(PeripheralApi, '/devices/<string:device_id>/peripherals/<string:periph>/<int:rownum>')
api.add_resource(PeripheralEndpointApi, '/devices/<string:device_id>/peripherals/<string:periph>/<int:rownum>/ep/<int:endpoint>')
