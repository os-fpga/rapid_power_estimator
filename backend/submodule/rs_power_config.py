from dataclasses import dataclass, field
from enum import Enum
import json
import sys
from typing import Any, List
import jsonref
import os

from marshmallow import Schema, fields, post_load, validate
from marshmallow.exceptions import ValidationError

# todo: define exceptions (in common module)

class ElementType(Enum):
    NONE = 'none'
    BRAM = 'bram'
    CLOCKING = 'clocking'
    DSP = 'dsp'
    FABRIC_LE = 'fabric_le'
    NOC = 'noc'
    CLB = 'clb'
    AUX = 'aux'
    MEM_SS = 'mem_ss'
    ACPU = 'acpu'
    CONFIG = 'config'
    VCC_BOOT_IO = 'vcc_boot_io'
    VCC_DDR_IO = 'vcc_ddr_io'
    VCC_SOC_IO = 'vcc_soc_io'
    VCC_GIGE_IO = 'vcc_gige_io'
    VCC_USB_IO = 'vcc_usb_io'
    VCC_BOOT_AUX = 'vcc_boot_aux'
    VCC_SOC_AUX = 'vcc_soc_aux'
    VCC_GIGE_AUX = 'vcc_gige_aux'
    VCC_USB_AUX = 'vcc_usb_aux'
    VCC_PUF = 'vcc_puf'
    VCC_RC_OSC = 'vcc_rc_osc'

class ScenarioType(Enum):
    NONE = 'none'
    TYPICAL = 'typical'
    WORSE = 'worse'

@dataclass
class RsStaticPowerPolynomial:
    length: int = field(default=0)
    coeffs: List[float] = field(default_factory=list)
    factor: float = field(default=0)

@dataclass
class RsStaticPowerScenario:
    type: ScenarioType = field(default=ScenarioType.NONE)
    polynomials: List[RsStaticPowerPolynomial] = field(default_factory=list)

@dataclass
class RsStaticPowerElement:
    type: ElementType = field(default=ElementType.NONE)
    scenarios: List[RsStaticPowerScenario] = field(default_factory=list)

@dataclass
class RsDynamicPowerCoeff:
    name: str = field(default='')
    value: float = field(default=0.0)

@dataclass
class RsDynamicPowerComponent:
    type: ElementType = field(default=ElementType.NONE)
    coeffs: List[RsDynamicPowerCoeff] = field(default_factory=list)

@dataclass
class RsPowerConfigData:
    static: List[RsStaticPowerElement] = field(default_factory=list)
    components: List[RsDynamicPowerComponent] = field(default_factory=list)

class RsStaticPowerPolynomialSchema(Schema):
    length = fields.Int()
    coeffs = fields.List(fields.Float())
    factor = fields.Float()

    @post_load
    def post_load(self, data, **kwargs):
        return RsStaticPowerPolynomial(**data)

class RsStaticPowerScenarioSchema(Schema):
    type = fields.Enum(ScenarioType, by_value=True, required=True)
    polynomials = fields.Nested(RsStaticPowerPolynomialSchema, many=True, validate=validate.Length(min=1), required=True)

    @post_load
    def post_load(self, data, **kwargs):
        return RsStaticPowerScenario(**data)
    
class RsStaticPowerElementSchema(Schema):
    type = fields.Enum(ElementType, by_value=True, required=True)
    scenarios = fields.Nested(RsStaticPowerScenarioSchema, many=True, required=True)

    @post_load
    def post_load(self, data, **kwargs):
        return RsStaticPowerElement(**data)

class RsDynamicPowerCoeffSchema(Schema):
    name = fields.Str(required=True)
    value = fields.Float(required=True)

    @post_load
    def post_load(self, data, **kwargs):
        return RsDynamicPowerCoeff(**data)

class RsDynamicPowerComponentSchema(Schema):
    type = fields.Enum(ElementType, by_value=True, required=True)
    coeffs = fields.Nested(RsDynamicPowerCoeffSchema, many=True, required=True)

    @post_load
    def post_load(self, data, **kwargs):
        return RsDynamicPowerComponent(**data)

class RsPowerConfigDataSchema(Schema):
    static = fields.Nested(RsStaticPowerElementSchema, many=True, required=True)
    components = fields.Nested(RsDynamicPowerComponentSchema, many=True, required=True)

    @post_load
    def post_load(self, data, **kwargs):
        return RsPowerConfigData(**data)

class RsPowerConfig:
    def __init__(self, filepath: str) -> None:
        self.filepath = filepath
        self.data: RsPowerConfigData = None
        self.load()

    def load(self) -> bool:
        try:
            # read the main power config json file
            with open(self.filepath, 'r') as fd:
                rawdata = json.load(fd)

            # resolve all $ref nodes
            resolved_data = jsonref.replace_refs(rawdata, base_uri='file:///' + os.path.abspath(os.path.dirname(self.filepath)).replace('\\', '/') + '/')

            # verify json structure
            data = RsPowerConfigDataSchema().load(resolved_data)

            # store data
            self.data = data

            # debug
            # print(f'{self.data = }', file=sys.stderr)

        # todo: translate system exception to app exception
        except FileNotFoundError as ex:
            raise ex
        except json.JSONDecodeError as ex:
            raise ex
        except jsonref.JsonRefError as ex:
            raise ex
        except ValidationError as ex:
            raise ex
        except Exception as ex:
            raise ex

    def get_static_component(self, type: ElementType) -> RsStaticPowerElement:
        comps = [c for c in self.data.static if c.type == type]
        if comps:
            return comps[0]
        raise ValueError(f"static component '{type.value}' not found") # todo: change to specific exception

    def get_component(self, type: ElementType) -> RsDynamicPowerComponent:
        comps = [c for c in self.data.components if c.type == type]
        if comps:
            return comps[0]
        raise ValueError(f"component '{type.value}' not found") # todo: change to specific exception

    def get_coeff(self, type: ElementType, name: str) -> float:
        coeffs = [c for c in self.get_component(type).coeffs if c.name == name]
        if coeffs:
            return coeffs[0].value
        raise ValueError(f'coeff {name} of {type.value} not found') # todo: change to specific exception

    def get_polynomial_coeff(self, type: ElementType, scenario: ScenarioType) -> List[RsStaticPowerPolynomial]:
        coeffs = [c for c in self.get_static_component(type).scenarios if c.type == scenario]
        if coeffs:
            return coeffs[0].polynomials
        raise ValueError(f'polynomial coeffs for {scenario.value} of {type.value} not found') # todo: change to specific exception
