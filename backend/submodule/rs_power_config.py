from dataclasses import dataclass, field
from enum import Enum
from marshmallow import Schema, fields, post_load, validate
from marshmallow.exceptions import ValidationError
from utilities.common_utils import RsCustomException
from typing import Any, List
import json
import jsonref
import os

class PowerConfigFileNotFoundException(RsCustomException):
    def __init__(self, filepath: str):
        super().__init__(f"Power config file '{filepath}' not found")

class PowerConfigStaticComponentNotFoundException(RsCustomException):
    def __init__(self, component: str):
        super().__init__(f"Static component '{component}' not found")

class PowerConfigComponentNotFoundException(RsCustomException):
    def __init__(self, component: str):
        super().__init__(f"Component '{component}' not found")

class PowerConfigCoeffNotFoundException(RsCustomException):
    def __init__(self, component: str, name: str):
        super().__init__(f"Coeff '{name}' of component '{component}' not found")

class PowerConfigPolynomialNotFoundException(RsCustomException):
    def __init__(self, component: str, scenario: str):
        super().__init__(f"Polynomial '{component}' for '{scenario}' case not found")

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
    GEARBOX_IO_HP = 'gearbox_io_hp'
    GEARBOX_IO_HR = 'gearbox_io_hr'
    AUX_HP = 'aux_hp'
    AUX_HR = 'aux_hr'
    IO_HP = 'io_hp'
    IO_HR = 'io_hr'
    IO_HP_1_2V = 'io_hp_1_2v'
    IO_HP_1_5V = 'io_hp_1_5v'
    IO_HP_1_8V = 'io_hp_1_8v'
    IO_HR_1_8V = 'io_hr_1_8v'
    IO_HR_2_5V = 'io_hr_2_5v'
    IO_HR_3_3V = 'io_hr_3_3v'
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

class ScenarioType(Enum):
    TYPICAL = 'typical'
    WORSE = 'worse'

@dataclass
class RsStaticPowerPolynomial:
    length: int = field(default=0)
    coeffs: List[float] = field(default_factory=list)
    factor: float = field(default=0)

@dataclass
class RsStaticPowerScenario:
    type: ScenarioType
    polynomials: List[RsStaticPowerPolynomial] = field(default_factory=list)

@dataclass
class RsStaticPowerElement:
    type: ElementType
    scenarios: List[RsStaticPowerScenario] = field(default_factory=list)

@dataclass
class RsDynamicPowerCoeff:
    name: str = field(default='')
    value: float = field(default=0.0)

@dataclass
class RsDynamicPowerComponent:
    type: ElementType
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

    def get_static_component(self, type: ElementType) -> RsStaticPowerElement:
        # raise power data not available exception
        if not self.loaded:
            raise PowerConfigNotAvailable()

        comps = [c for c in self.data.static if c.type == type]
        if comps:
            return comps[0]
        raise PowerConfigStaticComponentNotFoundException(type.value)

    def get_component(self, type: ElementType) -> RsDynamicPowerComponent:
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

    def get_polynomial_coeff(self, type: ElementType, scenario: ScenarioType) -> List[RsStaticPowerPolynomial]:
        coeffs = [c for c in self.get_static_component(type).scenarios if c.type == scenario]
        if coeffs:
            return coeffs[0].polynomials
        raise PowerConfigPolynomialNotFoundException(type.value, scenario.value)
