#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import argparse
import os
import sys
from submodule.device_manager import DeviceManager
from schema.device_schemas import DeviceSchema
from schema.device_clocking_schemas import ClockingSchema, ClockingResourcesConsumptionSchema
from schema.device_fabric_logic_element_schemas import FabricLogicElementSchema, FabricLogicElementResourcesConsumptionSchema
from schema.device_dsp_schemas import DspSchema, DspResourcesConsumptionSchema
from schema.device_bram_schemas import BramSchema, BramResourcesConsumptionSchema
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
        clocks = devicemanager.get_device_clocking_all(device_id)
        schema = ClockingSchema(many=True)
        return schema.dump(clocks)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/clocking', methods=['POST'], strict_slashes=False)
def add_device_clocking(device_id):
    try:
        schema = ClockingSchema()
        data = schema.load(request.json)
        clock = devicemanager.add_device_clocking(device_id, data)
        return schema.dump(clock)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/clocking/<int:row_number>', methods=['GET'], strict_slashes=False)
def get_device_clocking(device_id, row_number):
    try:
        clock = devicemanager.get_device_clocking(device_id, row_number)
        schema = ClockingSchema()
        return schema.dump(clock)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/clocking/<int:row_number>', methods=['PATCH'], strict_slashes=False)
def update_device_clocking(device_id, row_number):
    try:
        schema = ClockingSchema()
        data = schema.load(request.json)
        updated_clock = devicemanager.update_device_clocking(device_id, row_number, data)
        return schema.dump(updated_clock)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/clocking/<int:row_number>', methods=['DELETE'], strict_slashes=False)
def delete_device_clocking(device_id, row_number):
    try:
        deleted_clock = devicemanager.delete_device_clocking(device_id, row_number)
        schema = ClockingSchema()
        return schema.dump(deleted_clock)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/clocking/consumption', methods=['GET'], strict_slashes=False)
def get_device_clocking_power_consumption(device_id):
    try:
        consumption = devicemanager.get_device_clocking_power_consumption(device_id)
        res = devicemanager.get_device_clocking_resources(device_id)
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
        fabric_les = devicemanager.get_device_fabric_le_all(device_id)
        schema = FabricLogicElementSchema(many=True)
        return schema.dump(fabric_les)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/fabric_le', methods=['POST'], strict_slashes=False)
def add_device_fabric_le(device_id):
    try:
        schema = FabricLogicElementSchema()
        data = schema.load(request.json)
        clock = devicemanager.add_device_fabric_le(device_id, data)
        return schema.dump(clock)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/fabric_le/<int:row_number>', methods=['GET'], strict_slashes=False)
def get_device_fabric_le(device_id, row_number):
    try:
        fabric_le = devicemanager.get_device_fabric_le(device_id, row_number)
        schema = FabricLogicElementSchema()
        return schema.dump(fabric_le)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/fabric_le/<int:row_number>', methods=['PATCH'], strict_slashes=False)
def update_device_fabric_le(device_id, row_number):
    try:
        schema = FabricLogicElementSchema()
        data = schema.load(request.json)
        fabric_le = devicemanager.update_device_fabric_le(device_id, row_number, data)
        return schema.dump(fabric_le)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/fabric_le/<int:row_number>', methods=['DELETE'], strict_slashes=False)
def delete_device_fabric_le(device_id, row_number):
    try:
        deleted_fabric_le = devicemanager.delete_device_fabric_le(device_id, row_number)
        schema = FabricLogicElementSchema()
        return schema.dump(deleted_fabric_le)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/fabric_le/consumption', methods=['GET'], strict_slashes=False)
def get_device_fabric_le_power_consumption(device_id):
    try:
        consumption = devicemanager.get_device_fabric_le_power_consumption(device_id)
        res = devicemanager.get_device_fabric_le_resources(device_id)
        data = {
            "total_lut6_available": res[2],
            "total_lut6_used": res[0],
            "total_flip_flop_available" : res[6],
            "total_flip_flop_used" : res[4],
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
        dsplist = devicemanager.get_device_dsp_all(device_id)
        schema = DspSchema(many=True)
        return schema.dump(dsplist)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/dsp', methods=['POST'], strict_slashes=False)
def add_device_dsp(device_id):
    try:
        schema = DspSchema()
        data = schema.load(request.json)
        dsp = devicemanager.add_device_dsp(device_id, data)
        return schema.dump(dsp)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/dsp/<int:row_number>', methods=['GET'], strict_slashes=False)
def get_device_dsp(device_id, row_number):
    try:
        dsp = devicemanager.get_device_dsp(device_id, row_number)
        schema = DspSchema()
        return schema.dump(dsp)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/dsp/<int:row_number>', methods=['PATCH'], strict_slashes=False)
def update_device_dsp(device_id, row_number):
    try:
        schema = DspSchema()
        data = schema.load(request.json)
        updated_dsp = devicemanager.update_device_dsp(device_id, row_number, data)
        return schema.dump(updated_dsp)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/dsp/<int:row_number>', methods=['DELETE'], strict_slashes=False)
def delete_device_dsp(device_id, row_number):
    try:
        deleted_dsp = devicemanager.delete_device_dsp(device_id, row_number)
        schema = DspSchema()
        return schema.dump(deleted_dsp)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/dsp/consumption', methods=['GET'], strict_slashes=False)
def get_device_dsp_power_consumption(device_id):
    try:
        consumption = devicemanager.get_device_dsp_power_consumption(device_id)
        res = devicemanager.get_device_dsp_resources(device_id)
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
        bramlist = devicemanager.get_device_bram_all(device_id)
        schema = BramSchema(many=True)
        return schema.dump(bramlist)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/bram', methods=['POST'], strict_slashes=False)
def add_device_bram(device_id):
    try:
        schema = BramSchema()
        data = schema.load(request.json)
        bram = devicemanager.add_device_bram(device_id, data)
        return schema.dump(bram)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/bram/<int:row_number>', methods=['GET'], strict_slashes=False)
def get_device_bram(device_id, row_number):
    try:
        bram = devicemanager.get_device_bram(device_id, row_number)
        schema = BramSchema()
        return schema.dump(bram)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/bram/<int:row_number>', methods=['PATCH'], strict_slashes=False)
def update_device_bram(device_id, row_number):
    try:
        schema = BramSchema()
        data = schema.load(request.json)
        updated_bram = devicemanager.update_device_bram(device_id, row_number, data)
        return schema.dump(updated_bram)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/bram/<int:row_number>', methods=['DELETE'], strict_slashes=False)
def delete_device_bram(device_id, row_number):
    try:
        deleted_bram = devicemanager.delete_device_bram(device_id, row_number)
        schema = BramSchema()
        return schema.dump(deleted_bram)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/bram/consumption', methods=['GET'], strict_slashes=False)
def get_device_bram_power_consumption(device_id):
    try:
        consumption = devicemanager.get_device_bram_power_consumption(device_id)
        res = devicemanager.get_device_bram_resources(device_id)
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
# Main entry point
#
def main():
    # create and parse command line args
    parser = argparse.ArgumentParser(description='Rapid Power Estimator Rest API Server command-line arguments.')
    parser.add_argument('device_file', type=str, help='Path to the input device xml file')
    parser.add_argument('--port', type=int, default=5000, help='Specify TCP Port to use for REST server')
    args = parser.parse_args()

    # Check if the device_file exists
    if os.path.exists(args.device_file) == False:
        print(f"ERROR: The file '{args.device_file}' does not exist.")
        sys.exit(1)

    # Parse Device XML file into Device List
    global devicemanager
    devicemanager = DeviceManager(args.device_file)

    # Start Rest API server
    app.run(debug=False, port=args.port)

if __name__ == "__main__":
    main()
