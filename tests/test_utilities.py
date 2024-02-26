#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import pytest

from utilities.common_utils import update_attributes

# test_update_attributes.py
class TestUpdateAttributes:

    def test_update_existing_attribute(self):
        obj = type('Obj', (object,), {'attr1': 'old'})()
        updated = update_attributes(obj, {'attr1': 'new'})
        assert updated.attr1 == 'new'

    def test_non_existing_attribute(self):
        obj = type('Obj', (object,), {})()
        updated = update_attributes(obj, {'invalid': 'value'})
        assert not hasattr(updated, 'invalid')

    def test_no_change(self):
        obj = type('Obj', (object,), {'attr': 'value'})()
        updated = update_attributes(obj, {})
        assert updated.attr == 'value'
