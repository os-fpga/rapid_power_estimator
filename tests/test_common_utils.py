#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import pytest
from enum import Enum
from utilities.common_utils import RsCustomException, RsEnum, update_attributes, get_enum_by_value

def test_rs_custom_exception():
    with pytest.raises(RsCustomException, match="Test Exception"):
        raise RsCustomException("Test Exception")

class MyEnum(RsEnum):
    OPTION_ONE = (1, "First option")
    OPTION_TWO = (2, "Second option")

def test_rs_enum():
    option_one = MyEnum.OPTION_ONE
    option_two = MyEnum.OPTION_TWO

    assert option_one.value == 1
    assert option_one.description == "First option"
    assert option_two.value == 2
    assert option_two.description == "Second option"

def test_update_attributes():
    class DummyObject:
        def __init__(self):
            self.name = 'Initial'
            self.age = 25
            self.details = {'city': 'New York'}
            self.ports = 'port1'

    dummy = DummyObject()

    new_props = {
        'name': 'Updated',
        'age': 30,
        'details': {'city': 'San Francisco'},
        'ports': 'port2'  # should be excluded
    }

    updated_dummy = update_attributes(dummy, new_props)
    
    assert updated_dummy.name == 'Updated'
    assert updated_dummy.age == 30
    assert updated_dummy.details['city'] == 'New York'
    assert updated_dummy.ports == 'port1' 
    
def test_get_enum_by_value():
    result = get_enum_by_value(MyEnum, 1)
    assert result == MyEnum.OPTION_ONE

    result = get_enum_by_value(MyEnum, 3)
    assert result is None  
