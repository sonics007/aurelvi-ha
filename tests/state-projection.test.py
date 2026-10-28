"""Regression coverage for nullable Home Assistant light/device readings."""
import importlib.util
import json
import sys
import types
from pathlib import Path
from types import SimpleNamespace
import unittest

_pkg=types.ModuleType('aurelvi_pkg');_pkg.__path__=[str(Path(__file__).resolve().parents[1]/'custom_components/aurelvi')];sys.modules['aurelvi_pkg']=_pkg
spec=importlib.util.spec_from_file_location('aurelvi_pkg.models',Path(__file__).resolve().parents[1]/'custom_components/aurelvi/models.py')
models=importlib.util.module_from_spec(spec);sys.modules['aurelvi_pkg.models']=models;spec.loader.exec_module(models)

def state(value='off',**attrs):
    return SimpleNamespace(entity_id='light.ceiling',state=value,attributes=attrs)

class Projection(unittest.TestCase):
    def test_null_brightness_keeps_real_on_and_availability(self):
        for value in ['on','off','unknown','unavailable']:
            with self.subTest(value=value):
                doc=models.mirror(state(value,brightness=None))
                self.assertNotIn('brightness',doc)
                self.assertEqual(doc['on'],value=='on')
                self.assertEqual(doc['available'],value not in {'unknown','unavailable'})
    def test_missing_brightness_is_not_zero(self):self.assertNotIn('brightness',models.mirror(state()))
    def test_zero_and_valid_numeric_strings_are_preserved(self):
        for value,expected in [(0,0),(128,.502),(255,1),('128',.502),(-1,0),(999,1)]:
            with self.subTest(value=value):self.assertEqual(models.mirror(state(brightness=value))['brightness'],expected)
    def test_invalid_brightness_is_absent_and_json_safe(self):
        for value in [None,'','unknown','unavailable','bad',[],{},True,float('nan'),float('inf'),-float('inf'),10**400]:
            with self.subTest(value=repr(value)):
                doc=models.mirror(state(brightness=value));self.assertNotIn('brightness',doc);json.dumps(doc,allow_nan=False)
    def test_nullable_and_invalid_color_temperature(self):
        for value in [None,0,-1,'bad',[],True,float('nan'),float('inf'),1e-320]:
            with self.subTest(value=repr(value)):
                doc=models.mirror(state(color_temp_kelvin=None,color_temp=value));self.assertNotIn('color_temp_kelvin',doc);json.dumps(doc,allow_nan=False)
    def test_temperature_fallback_and_valid_kelvin(self):
        self.assertEqual(models.mirror(state(color_temp_kelvin=None,color_temp=250))['color_temp_kelvin'],4000)
        self.assertEqual(models.mirror(state(color_temp_kelvin=3000,color_temp=250))['color_temp_kelvin'],3000)
        self.assertEqual(models.mirror(state(color_temp_kelvin='bad',color_temp='250'))['color_temp_kelvin'],4000)
    def test_other_numeric_attributes_cannot_emit_nan(self):
        for name in ['percentage','supported_features','temperature','current_temperature','humidity','wind_speed','volume_level']:
            for value in [None,'unknown',float('nan'),float('inf')]:
                with self.subTest(name=name,value=value):
                    doc=models.mirror(state(**{name:value}));self.assertNotIn(name,doc);json.dumps(doc,allow_nan=False)
    def test_valid_non_numeric_and_boolean_attributes_survive(self):
        doc=models.mirror(state(oscillating=False,direction='reverse',preset_modes=['low','high'],temperature=-5))
        self.assertFalse(doc['oscillating']);self.assertEqual(doc['direction'],'reverse');self.assertEqual(doc['preset_modes'],['low','high']);self.assertEqual(doc['temperature'],-5)

if __name__=='__main__':unittest.main(verbosity=2)
