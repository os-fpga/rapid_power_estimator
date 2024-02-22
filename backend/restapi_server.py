#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import argparse
import os
import sys
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_device import ModuleType
from schema.device_schemas import DeviceSchema
from schema.device_clocking_schemas import ClockingSchema, ClockingResourcesConsumptionSchema
from schema.device_fabric_logic_element_schemas import FabricLogicElementSchema, FabricLogicElementResourcesConsumptionSchema
from schema.device_dsp_schemas import DspSchema, DspResourcesConsumptionSchema
from schema.device_bram_schemas import BramSchema, BramResourcesConsumptionSchema
from schema.device_io_schemas import IoSchema, IoResourcesConsumptionSchema
from flask import Flask, request, jsonify

app = Flask(__name__)
devicemanager = None

#
# REST API Endpoint definitions
#
@app.route('/devices', methods=['GET'], strict_slashes=False)
def get_device_all():
    try:
        schema = DeviceSchema(many=True, only=('id', 'series'))
        return schema.dump(devicemanager.get_device_all())
    except Exception as e:
        return f"An exception occurred: {type(e).__name__}: {e}", 500

@app.route('/devices/<device_id>', methods=['GET'], strict_slashes=False)
def get_device(device_id):
    try:
        device = devicemanager.get_device(device_id)
        schema = DeviceSchema()
        return schema.dump(device)
    except ValueError as e:
        return f"Error: {e}", 404

#
# Device Clocking APIs
#
@app.route('/devices/<device_id>/clocking', methods=['GET'], strict_slashes=False)
def get_device_clocking_all(device_id):
    try:
        itemlist = devicemanager.get_all(ModuleType.CLOCKING, device_id)
        schema = ClockingSchema(many=True)
        return schema.dump(itemlist)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/clocking', methods=['POST'], strict_slashes=False)
def add_device_clocking(device_id):
    try:
        schema = ClockingSchema()
        item = devicemanager.add(ModuleType.CLOCKING, device_id, schema.load(request.json))
        return schema.dump(item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/clocking/<int:row_number>', methods=['GET'], strict_slashes=False)
def get_device_clocking(device_id, row_number):
    try:
        item = devicemanager.get(ModuleType.CLOCKING, device_id, row_number)
        schema = ClockingSchema()
        return schema.dump(item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/clocking/<int:row_number>', methods=['PATCH'], strict_slashes=False)
def update_device_clocking(device_id, row_number):
    try:
        schema = ClockingSchema()
        updated_item = devicemanager.update(ModuleType.CLOCKING, device_id, row_number, schema.load(request.json))
        return schema.dump(updated_item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/clocking/<int:row_number>', methods=['DELETE'], strict_slashes=False)
def delete_device_clocking(device_id, row_number):
    try:
        removed_item = devicemanager.remove(ModuleType.CLOCKING, device_id, row_number)
        schema = ClockingSchema()
        return schema.dump(removed_item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/clocking/consumption', methods=['GET'], strict_slashes=False)
def get_device_clocking_power_consumption(device_id):
    try:
        consumption = devicemanager.get_power_consumption(ModuleType.CLOCKING, device_id)
        res = devicemanager.get_resources(ModuleType.CLOCKING, device_id)
        data = {
            'total_clocks_available': res[0],
            'total_clocks_used': res[2],
            'total_plls_available': res[1],
            'total_plls_used': res[3],
            'total_clock_block_power': consumption[0],
            'total_clock_interconnect_power': consumption[1],
            'total_pll_power': consumption[2],
        }
        schema = ClockingResourcesConsumptionSchema()
        return schema.dump(data)
    except ValueError as e:
        return f"Error: {e}", 404

#
# Device Fabric Logic Element APIs
#
@app.route('/devices/<device_id>/fabric_le', methods=['GET'], strict_slashes=False)
def get_device_fabric_le_all(device_id):
    try:
        itemlist = devicemanager.get_all(ModuleType.FABRIC_LE, device_id)
        schema = FabricLogicElementSchema(many=True)
        return schema.dump(itemlist)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/fabric_le', methods=['POST'], strict_slashes=False)
def add_device_fabric_le(device_id):
    try:
        schema = FabricLogicElementSchema()
        item = devicemanager.add(ModuleType.FABRIC_LE, device_id, schema.load(request.json))
        return schema.dump(item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/fabric_le/<int:row_number>', methods=['GET'], strict_slashes=False)
def get_device_fabric_le(device_id, row_number):
    try:
        item = devicemanager.get(ModuleType.FABRIC_LE, device_id, row_number)
        schema = FabricLogicElementSchema()
        return schema.dump(item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/fabric_le/<int:row_number>', methods=['PATCH'], strict_slashes=False)
def update_device_fabric_le(device_id, row_number):
    try:
        schema = FabricLogicElementSchema()
        updated_item = devicemanager.update(ModuleType.FABRIC_LE, device_id, row_number, schema.load(request.json))
        return schema.dump(updated_item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/fabric_le/<int:row_number>', methods=['DELETE'], strict_slashes=False)
def delete_device_fabric_le(device_id, row_number):
    try:
        removed_item = devicemanager.remove(ModuleType.FABRIC_LE, device_id, row_number)
        schema = FabricLogicElementSchema()
        return schema.dump(removed_item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/fabric_le/consumption', methods=['GET'], strict_slashes=False)
def get_device_fabric_le_power_consumption(device_id):
    try:
        consumption = devicemanager.get_power_consumption(ModuleType.FABRIC_LE, device_id)
        res = devicemanager.get_resources(ModuleType.FABRIC_LE, device_id)
        data = {
            "total_lut6_available": res[1],
            "total_lut6_used": res[0],
            "total_flip_flop_available" : res[3],
            "total_flip_flop_used" : res[2],
            "total_block_power": consumption[0],
            "total_interconnect_power": consumption[1]
        }
        schema = FabricLogicElementResourcesConsumptionSchema()
        return schema.dump(data)
    except ValueError as e:
        return f"Error: {e}", 404

#
# Device DSP APIs
#
@app.route('/devices/<device_id>/dsp', methods=['GET'], strict_slashes=False)
def get_device_dsp_all(device_id):
    try:
        itemlist = devicemanager.get_all(ModuleType.DSP, device_id)
        schema = DspSchema(many=True)
        return schema.dump(itemlist)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/dsp', methods=['POST'], strict_slashes=False)
def add_device_dsp(device_id):
    try:
        schema = DspSchema()
        item = devicemanager.add(ModuleType.DSP, device_id, schema.load(request.json))
        return schema.dump(item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/dsp/<int:row_number>', methods=['GET'], strict_slashes=False)
def get_device_dsp(device_id, row_number):
    try:
        item = devicemanager.get(ModuleType.DSP, device_id, row_number)
        schema = DspSchema()
        return schema.dump(item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/dsp/<int:row_number>', methods=['PATCH'], strict_slashes=False)
def update_device_dsp(device_id, row_number):
    try:
        schema = DspSchema()
        updated_item = devicemanager.update(ModuleType.DSP, device_id, row_number, schema.load(request.json))
        return schema.dump(updated_item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/dsp/<int:row_number>', methods=['DELETE'], strict_slashes=False)
def delete_device_dsp(device_id, row_number):
    try:
        removed_item = devicemanager.remove(ModuleType.DSP, device_id, row_number)
        schema = DspSchema()
        return schema.dump(removed_item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/dsp/consumption', methods=['GET'], strict_slashes=False)
def get_device_dsp_power_consumption(device_id):
    try:
        consumption = devicemanager.get_power_consumption(ModuleType.DSP, device_id)
        res = devicemanager.get_resources(ModuleType.DSP, device_id)
        data = {
            "total_dsp_blocks_available": res[1],
            "total_dsp_blocks_used": res[0],
            "total_dsp_block_power" : consumption[0],
            "total_dsp_interconnect_power" : consumption[1]
        }
        schema = DspResourcesConsumptionSchema()
        return schema.dump(data)
    except ValueError as e:
        return f"Error: {e}", 404

#
# Device BRAM APIs
#
@app.route('/devices/<device_id>/bram', methods=['GET'], strict_slashes=False)
def get_device_bram_all(device_id):
    try:
        itemlist = devicemanager.get_all(ModuleType.BRAM, device_id)
        schema = BramSchema(many=True)
        return schema.dump(itemlist)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/bram', methods=['POST'], strict_slashes=False)
def add_device_bram(device_id):
    try:
        schema = BramSchema()
        item = devicemanager.add(ModuleType.BRAM, device_id, schema.load(request.json))
        return schema.dump(item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/bram/<int:row_number>', methods=['GET'], strict_slashes=False)
def get_device_bram(device_id, row_number):
    try:
        item = devicemanager.get(ModuleType.BRAM, device_id, row_number)
        schema = BramSchema()
        return schema.dump(item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/bram/<int:row_number>', methods=['PATCH'], strict_slashes=False)
def update_device_bram(device_id, row_number):
    try:
        schema = BramSchema()
        updated_item = devicemanager.update(ModuleType.BRAM, device_id, row_number, schema.load(request.json))
        return schema.dump(updated_item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/bram/<int:row_number>', methods=['DELETE'], strict_slashes=False)
def delete_device_bram(device_id, row_number):
    try:
        removed_item = devicemanager.remove(ModuleType.BRAM, device_id, row_number)
        schema = BramSchema()
        return schema.dump(removed_item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/bram/consumption', methods=['GET'], strict_slashes=False)
def get_device_bram_power_consumption(device_id):
    try:
        consumption = devicemanager.get_power_consumption(ModuleType.BRAM, device_id)
        res = devicemanager.get_resources(ModuleType.BRAM, device_id)
        data = {
            "total_18k_bram_available": res[1],
            "total_18k_bram_used": res[0],
            "total_36k_bram_available": res[3],
            "total_36k_bram_used": res[2],
            "total_bram_block_power" : consumption[0],
            "total_bram_interconnect_power" : consumption[1]
        }
        schema = BramResourcesConsumptionSchema()
        return schema.dump(data)
    except ValueError as e:
        return f"Error: {e}", 404

#
# Device IO APIs
#
@app.route('/devices/<device_id>/io', methods=['GET'], strict_slashes=False)
def get_device_io_all(device_id):
    try:
        itemlist = devicemanager.get_all(ModuleType.IO, device_id)
        schema = IoSchema(many=True)
        return schema.dump(itemlist)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/io', methods=['POST'], strict_slashes=False)
def add_device_io(device_id):
    try:
        schema = IoSchema()
        item = devicemanager.add(ModuleType.IO, device_id, schema.load(request.json))
        return schema.dump(item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/io/<int:row_number>', methods=['GET'], strict_slashes=False)
def get_device_io(device_id, row_number):
    try:
        item = devicemanager.get(ModuleType.IO, device_id, row_number)
        schema = IoSchema()
        return schema.dump(item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/io/<int:row_number>', methods=['PATCH'], strict_slashes=False)
def update_device_io(device_id, row_number):
    try:
        schema = IoSchema()
        updated_item = devicemanager.update(ModuleType.IO, device_id, row_number, schema.load(request.json))
        return schema.dump(updated_item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/io/<int:row_number>', methods=['DELETE'], strict_slashes=False)
def delete_device_io(device_id, row_number):
    try:
        removed_item = devicemanager.remove(ModuleType.IO, device_id, row_number)
        schema = IoSchema()
        return schema.dump(removed_item)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/io/consumption', methods=['GET'], strict_slashes=False)
def get_device_io_power_consumption(device_id):
    try:
        consumption = devicemanager.get_power_consumption(ModuleType.IO, device_id)
        res = devicemanager.get_resources(ModuleType.IO, device_id)
        data = {
            "total_block_power" : consumption[0],
            "total_interconnect_power" : consumption[1],
            "total_on_die_termination_power" : consumption[1],
            "io_usage" : res[0],
            "io_on_die_termination": res[1]
        }
        schema = IoResourcesConsumptionSchema()
        return schema.dump(data)
    except ValueError as e:
        return f"Error: {e}", 404

#
# Main entry point
#
def main():
    # create and parse command line args
    parser = argparse.ArgumentParser(description='Rapid Power Estimator Rest API Server command-line arguments.')
    parser.add_argument('device_file', type=str, help='Path to the input device xml file')
    parser.add_argument('--port', type=int, default=5000, help='Specify TCP Port to use for REST server')
    parser.add_argument('--debug', default=False, action='store_true', help='Enable/Disable debug mode')
    args = parser.parse_args()

    # Check if the device_file exists
    if os.path.exists(args.device_file) == False:
        print(f"ERROR: The file '{args.device_file}' does not exist.")
        sys.exit(1)

    # Parse Device XML file into Device List
    global devicemanager
    devicemanager = RsDeviceManager(args.device_file)

    # Start Rest API server
    app.run(debug=args.debug, port=args.port)

if __name__ == "__main__":
    main()
