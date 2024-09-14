#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import pytest
from dataclasses import is_dataclass
from device.device_resource import ResourceAttributes, InternalAttributes, Device, DeviceList

def test_resource_attributes_initialization():
    """Test that ResourceAttributes can be initialized correctly."""
    resource_attr = ResourceAttributes(type="BRAM", num=10, label="Block RAM")
    
    assert is_dataclass(resource_attr)  
    assert resource_attr.type == "BRAM"
    assert resource_attr.num == 10
    assert resource_attr.label == "Block RAM"

def test_internal_attributes_initialization():
    """Test that InternalAttributes can be initialized correctly."""
    internal_attr = InternalAttributes(type="PLL", name="MainPLL", file="pll.v", num="1")
    
    assert is_dataclass(internal_attr)
    assert internal_attr.type == "PLL"
    assert internal_attr.name == "MainPLL"
    assert internal_attr.file == "pll.v"
    assert internal_attr.num == "1"

def test_device_initialization():
    """Test that Device can be initialized with the correct attributes."""
    resources = {
        "BRAM": ResourceAttributes(type="BRAM", num=10, label="Block RAM"),
        "DSP": ResourceAttributes(type="DSP", num=5, label="DSP Blocks")
    }
    internals = {
        "PLL": InternalAttributes(type="PLL", name="MainPLL", file="pll.v", num="1")
    }
    device = Device(
        name="FPGA100",
        series="Series7",
        family="Artix",
        package="TQFP",
        pin_count="100",
        speedgrade="1",
        core_voltage="1.2V",
        filepath="/path/to/device.xml",
        resources=resources,
        internals=internals
    )
    
    assert is_dataclass(device)
    assert device.name == "FPGA100"
    assert device.series == "Series7"
    assert device.family == "Artix"
    assert device.package == "TQFP"
    assert device.pin_count == "100"
    assert device.speedgrade == "1"
    assert device.core_voltage == "1.2V"
    assert device.filepath == "/path/to/device.xml"
    
    # Checking resource attributes
    assert device.resources["BRAM"].type == "BRAM"
    assert device.resources["BRAM"].num == 10
    assert device.resources["BRAM"].label == "Block RAM"
    
    # Checking internal attributes
    assert device.internals["PLL"].type == "PLL"
    assert device.internals["PLL"].name == "MainPLL"
    assert device.internals["PLL"].file == "pll.v"
    assert device.internals["PLL"].num == "1"

def test_device_list_initialization():
    """Test that DeviceList can be initialized correctly."""
    resources = {
        "BRAM": ResourceAttributes(type="BRAM", num=10, label="Block RAM")
    }
    internals = {
        "PLL": InternalAttributes(type="PLL", name="MainPLL", file="pll.v", num="1")
    }
    device1 = Device(
        name="FPGA100",
        series="Series7",
        family="Artix",
        package="TQFP",
        pin_count="100",
        speedgrade="1",
        core_voltage="1.2V",
        filepath="/path/to/device1.xml",
        resources=resources,
        internals=internals
    )
    
    device2 = Device(
        name="FPGA200",
        series="Series7",
        family="Kintex",
        package="BGA",
        pin_count="400",
        speedgrade="2",
        core_voltage="1.0V",
        filepath="/path/to/device2.xml",
        resources=resources,
        internals=internals
    )
    
    device_list = DeviceList(devices=[device1, device2])
    
    assert is_dataclass(device_list)
    assert len(device_list.devices) == 2
    assert device_list.devices[0].name == "FPGA100"
    assert device_list.devices[1].name == "FPGA200"

def test_resource_attributes_defaults():
    """Test default values in ResourceAttributes."""
    resource_attr = ResourceAttributes()

    assert resource_attr.type is None
    assert resource_attr.num is None
    assert resource_attr.label is None

def test_internal_attributes_defaults():
    """Test default values in InternalAttributes."""
    internal_attr = InternalAttributes()

    assert internal_attr.type is None
    assert internal_attr.name is None
    assert internal_attr.file is None
    assert internal_attr.num is None
