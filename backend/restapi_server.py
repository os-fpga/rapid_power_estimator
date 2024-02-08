#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import argparse
import os
import sys
from submodule.device_manager import DeviceManager
from schema.device_schema import DeviceSchema
from schema.device_clocking_schema import DeviceClockingSchema
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

@app.route('/devices/<device_id>/clocking', methods=['GET'], strict_slashes=False)
def get_device_clocking_all(device_id):
    try:
        clocks = devicemanager.get_device_clocking_all(device_id)
        schema = DeviceClockingSchema(many=True)
        return schema.dump(clocks)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/clocking', methods=['POST'], strict_slashes=False)
def add_device_clocking(device_id):
    try:
        schema = DeviceClockingSchema()
        data = schema.load(request.json)
        clock = devicemanager.add_device_clocking(device_id, data)
        return schema.dump(clock)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/clocking/<int:row_number>', methods=['GET'], strict_slashes=False)
def get_device_clocking(device_id, row_number):
    try:
        clock = devicemanager.get_device_clocking(device_id, row_number)
        schema = DeviceClockingSchema()
        return schema.dump(clock)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/clocking/<int:row_number>', methods=['PATCH'], strict_slashes=False)
def update_device_clocking(device_id, row_number):
    try:
        schema = DeviceClockingSchema()
        data = schema.load(request.json)
        updated_clock = devicemanager.update_device_clocking(device_id, row_number, data)
        return schema.dump(updated_clock)
    except ValueError as e:
        return f"Error: {e}", 404

@app.route('/devices/<device_id>/clocking/<int:row_number>', methods=['DELETE'], strict_slashes=False)
def delete_device_clocking(device_id, row_number):
    try:
        deleted_clock = devicemanager.delete_device_clocking(device_id, row_number)
        schema = DeviceClockingSchema()
        return schema.dump(deleted_clock)
    except ValueError as e:
        return f"Error: {e}", 404

#
# Main entry point
#
def main():
    # create and parse command line args
    parser = argparse.ArgumentParser(description='Rapid Power Estimator Rest API Server command-line arguments.')
    parser.add_argument('device_file', type=str, help='Path to the input device xml file')
    args = parser.parse_args()

    # Check if the device_file exists
    if os.path.exists(args.device_file) == False:
        print(f"ERROR: The file '{args.device_file}' does not exist.")
        sys.exit(1)

    # Parse Device XML file into Device List
    global devicemanager
    devicemanager = DeviceManager(args.device_file)

    # Start Rest API server
    app.run(debug=False)

if __name__ == "__main__":
    main()
