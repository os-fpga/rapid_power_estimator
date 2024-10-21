#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only

from unittest.mock import Mock
import pytest
from submodule.rs_power_config import (
    RsPowerConfig,
    ElementType, 
    ScenarioType, 
    PowerConfigCoeffNotFoundException, 
    PowerConfigFileNotFoundException, 
    PowerConfigParsingException, 
    PowerConfigSchemaValidationException, 
    PowerConfigComponentNotFoundException
)

def test_not_loaded():
    pwrcfg = RsPowerConfig()
    assert False == pwrcfg.is_loaded()

def test_invalid_power_config_filepath():
    with pytest.raises(PowerConfigFileNotFoundException):
        RsPowerConfig().load('abc.json')

def test_invalid_json_content():
    with pytest.raises(PowerConfigParsingException):
        RsPowerConfig().load('tests/data/invalid_power_config.json')

def test_invalid_json_ref():
    with pytest.raises(PowerConfigParsingException):
        RsPowerConfig().load('tests/data/invalid_json_ref_power_config.json')

def test_invalid_power_config_schema():
    with pytest.raises(PowerConfigSchemaValidationException):
        RsPowerConfig().load('tests/data/invalid_schema_power_config.json')

def test_get_coeff_with_not_exist_component():
    pwrcfg = RsPowerConfig()
    pwrcfg.load('tests/data/power_config.json')
    with pytest.raises(PowerConfigComponentNotFoundException):
        pwrcfg.get_coeff(ElementType.FABRIC_LE, "TEST1")

def test_get_coeff_with_not_exist_coeff():
    pwrcfg = RsPowerConfig()
    pwrcfg.load('tests/data/power_config.json')
    with pytest.raises(PowerConfigCoeffNotFoundException):
        pwrcfg.get_coeff(ElementType.DSP, "ABC")

def test_get_coeff():
    pwrcfg = RsPowerConfig()
    pwrcfg.load('tests/data/power_config.json')
    assert 0.1234 == pwrcfg.get_coeff(ElementType.DSP, "TEST1")

def test_get_polynomial_coeff():
    pwrcfg = RsPowerConfig()
    result = pwrcfg.load('tests/data/power_config.json')
    polynomials = pwrcfg.get_polynomial(ElementType.DSP, ScenarioType.TYPICAL)
    assert 1 == len(polynomials)
    assert True == result
    assert True == pwrcfg.is_loaded()
    assert 'Vcc_core (DSP)' == polynomials[0][0]
    assert True == isinstance(polynomials[0][1], list)
    assert 1 == len(polynomials[0][1])
    assert 54321.1 == polynomials[0][1][0].factor
    assert [0.1, 0.2, 0.3, 0.4, 0.5] == polynomials[0][1][0].coeffs
