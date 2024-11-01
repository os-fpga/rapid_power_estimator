from dataclasses import dataclass, field
from enum import Enum
from marshmallow import Schema, fields, post_load, validate
from marshmallow.exceptions import ValidationError
from utilities.common_utils import RsCustomException
from typing import List, Tuple
import json
import jsonref
import os

class PowerConfigFileNotFoundException(RsCustomException):
    def __init__(self, filepath: str):
        super().__init__(f"Power config file '{filepath}' not found")

class PowerConfigComponentNotFoundException(RsCustomException):
    def __init__(self, component: str):
        super().__init__(f"Component '{component}' not found")

class PowerConfigCoeffNotFoundException(RsCustomException):
    def __init__(self, component: str, name: str):
        super().__init__(f"Coeff '{name}' of component '{component}' not found")

class PowerConfigParsingException(RsCustomException):
    def __init__(self, error_message: str):
        super().__init__(f"Parsing Error: {error_message}")

class PowerConfigSchemaValidationException(RsCustomException):
    def __init__(self, ex: ValidationError):
        super().__init__(f"Parsing Error: {ex.messages}")

class PowerConfigNotAvailable(RsCustomException):
    def __init__(self):
        super().__init__(f"Power config data not available")

class ElementType(Enum):
    BRAM = 'bram'
    CLOCKING = 'clocking'
    DSP = 'dsp'
    FABRIC_LE = 'fabric_le'
    IO = 'io'
    NOC = 'noc'
    ACPU = 'acpu'
    UART = 'uart'
    SPI = 'spi'
    BCPU = 'bcpu'
    JTAG = 'jtag'
    I2C = 'i2c'
    USB2 = 'usb2'
    GIGE = 'gige'
    GPIO = 'gpio'
    DDR = 'ddr'
    SRAM = 'sram'
    PWM = 'pwm'
    REGULATOR = 'regulator'
    PUFFCC = 'puffcc'
    RC_OSC = 'rc_osc'

class ScenarioType(Enum):
    TYPICAL = 'typical'
    WORSE = 'worse'

@dataclass
class PowerValue:
    type: str
    value: float

@dataclass
class RsDynamicPowerCoeff:
    name: str = field(default='')
    value: float = field(default=0.0)

@dataclass
class RsStaticPowerScenario:
    type: ScenarioType
    coeffs: List[float]
    factor: float

@dataclass
class RsStaticPowerConfig:
    rail_type: str
    domain: str
    scenarios: List[RsStaticPowerScenario] = field(default_factory=list)

@dataclass
class RsComponent:
    type: ElementType
    coeffs: List[RsDynamicPowerCoeff] = field(default_factory=list)
    static_power: List[RsStaticPowerConfig] = field(default_factory=list)

@dataclass
class RsPowerConfigData:
    components: List[RsComponent] = field(default_factory=list)

class RsDynamicPowerCoeffSchema(Schema):
    name = fields.Str(required=True)
    value = fields.Float(required=True)

    @post_load
    def post_load(self, data, **kwargs):
        return RsDynamicPowerCoeff(**data)

class RsStaticPowerScenarioSchema(Schema):
    type = fields.Enum(ScenarioType, by_value=True, required=True)
    coeffs = fields.List(fields.Float, required=True)
    factor = fields.Float(required=True)

    @post_load
    def post_load(self, data, **kwargs):
        return RsStaticPowerScenario(**data)

class RsStaticPowerConfigSchema(Schema):
    rail_type = fields.Str(required=True)
    domain = fields.Str(required=True)
    scenarios = fields.Nested(RsStaticPowerScenarioSchema, many=True, required=True)

    @post_load
    def post_load(self, data, **kwargs):
        return RsStaticPowerConfig(**data)

class RsComponentSchema(Schema):
    type = fields.Enum(ElementType, by_value=True, required=True)
    coeffs = fields.Nested(RsDynamicPowerCoeffSchema, many=True, required=False)
    static_power = fields.Nested(RsStaticPowerConfigSchema, many=True, required=False)

    @post_load
    def post_load(self, data, **kwargs):
        return RsComponent(**data)

class RsPowerConfigDataSchema(Schema):
    components = fields.Nested(RsComponentSchema, many=True, required=True)

    @post_load
    def post_load(self, data, **kwargs):
        return RsPowerConfigData(**data)

class RsPowerConfig:
    def __init__(self) -> None:
        self.filepath = None
        self.data: RsPowerConfigData = None
        self.loaded = False

    def load(self, filepath: str) -> bool:
        try:
            # read the main power config json file
            with open(filepath, 'r') as fd:
                rawdata = json.load(fd)

            # resolve all $ref nodes
            resolved_data = jsonref.replace_refs(rawdata, base_uri='file:///' + os.path.abspath(os.path.dirname(filepath)).replace('\\', '/') + '/')

            # verify json structure
            data = RsPowerConfigDataSchema().load(resolved_data)

            # store data
            self.filepath, self.data, self.loaded = filepath, data, True

        except FileNotFoundError as ex:
            raise PowerConfigFileNotFoundException(self.filepath)
        except json.JSONDecodeError as ex:
            raise PowerConfigParsingException(ex.msg)
        except jsonref.JsonRefError as ex:
            raise PowerConfigParsingException(ex.message)
        except ValidationError as ex:
            raise PowerConfigSchemaValidationException(ex)
        except Exception as ex:
            raise ex
        return True

    def is_loaded(self) -> bool:
        return self.loaded

    def get_component(self, type: ElementType) -> RsComponent:
        # raise power data not available exception
        if not self.loaded:
            raise PowerConfigNotAvailable()

        comps = [c for c in self.data.components if c.type == type]
        if comps:
            return comps[0]
        raise PowerConfigComponentNotFoundException(type.value)

    def get_coeff(self, type: ElementType, name: str) -> float:
        values = [c.value for c in self.get_component(type).coeffs if c.name == name]
        if values:
            return sum(values) / len(values)
        raise PowerConfigCoeffNotFoundException(type.value, name)

    def get_polynomial(self, type: ElementType, scenario: ScenarioType = None, rail_type: str = None) -> List[Tuple[str, List[RsStaticPowerScenario]]]:
        mylist = []
        for sp in self.get_component(type).static_power:
            if rail_type is None or sp.rail_type == rail_type:
                scene_list = []
                for scene in sp.scenarios:
                    if scenario is None or scene.type == scenario:
                        scene_list.append(scene)
                mylist.append((sp.rail_type, scene_list))
        return mylist
