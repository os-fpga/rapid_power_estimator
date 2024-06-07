#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import sys
from flask import Blueprint, request
from flask_restful import Api, Resource
from marshmallow import Schema, fields, ValidationError
from submodule.clock import Clock_State, Source
from submodule.fabric_logic_element import Glitch_Factor
from submodule.dsp import Pipelining, DSP_Mode
from submodule.bram import BRAM_Type
from submodule.rs_device_resources import IO_BankType, IO_Standard
from submodule.io import IO_Direction, IO_Drive_Strength, IO_Slew_Rate, IO_differential_termination, \
    IO_Data_Type, IO_Synchronization, IO_Pull_up_down
from submodule.peripherals import Peripherals_Usage, Qspi_Performance_Mbps, Jtag_Clock_Frequency, Cpu, Baud_Rate, \
    I2c_Speed, Usb_Speed, Gige_Speed, GpioStandard, Gpio_Type, N22_RISC_V_Clock, Port_Activity, A45_Load, \
    Memory_Type, Dma_Activity, Dma_Source_Destination

#--------------------------------------------------------------#
# endpoints         | methods          | classes               #
#--------------------------------------------------------------#
# /attributes       | get              | AttributesApi         #
#--------------------------------------------------------------#

class AttributesApi(Resource):
    def get(self):
        """
        This is an endpoint that returns a list of attributes and their options used in the device \
            sub modules e.g. Clock_State, Glitch_Factor etc.
        ---
        tags:
            - Utilities
        description: Returns a list of attributes and options used in the device sub modules.
        definitions:
            Option:
                type: object
                properties:
                    text:
                        type: string
                    value:
                        type: string
            Attribute:
                type: object
                properties:
                    id:
                        type: string
                    options:
                        type: array
                        items:
                            $ref: '#/definitions/Option'
        responses:
            200:
                description: Successfully returned a list of attributes and their options
                schema:
                    type: array
                    items:
                        $ref: '#/definitions/Attribute'
        """
        module_attrbs = [
                            # Clock
                            Clock_State, Source,
                            # Fabric LE
                            Glitch_Factor,
                            # DSP
                            Pipelining, DSP_Mode,
                            # BRAM
                            BRAM_Type,
                            # IO
                            IO_BankType, IO_Standard, IO_Direction, IO_Drive_Strength, IO_Slew_Rate,
                            IO_differential_termination, IO_Data_Type, IO_Synchronization,
                            IO_Pull_up_down,
                            # Peripherals
                            Peripherals_Usage, Qspi_Performance_Mbps, Jtag_Clock_Frequency, Cpu,
                            Baud_Rate, I2c_Speed, Usb_Speed, Gige_Speed, GpioStandard,
                            Gpio_Type, N22_RISC_V_Clock, Port_Activity, A45_Load,
                            Memory_Type, Dma_Activity, Dma_Source_Destination
                        ]
        attrb_list = []
        for a in module_attrbs:
            attrb = {}
            attrb['id'] = a.__name__
            attrb['options'] = [{ 'text' : elem.description if hasattr(elem, 'description') else elem.name, 'id' : str(elem.value) } \
                for elem in a]
            attrb_list.append(attrb)
        return attrb_list

attrs_api = Blueprint('attrs_api', __name__)
api = Api(attrs_api)
api.add_resource(AttributesApi, '/attributes')
