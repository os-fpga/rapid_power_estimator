#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import argparse
import os
import sys
import signal
from flask import Flask, request, jsonify
from flasgger import Swagger
from submodule.rs_device_manager import RsDeviceManager
from submodule.rs_logger import log_setup, log, RsLogLevel
from api.device import device_api
from api.clock import clock_api
from api.dsp import dsp_api
from api.fabric_le import fabric_le_api
from api.bram import bram_api
from api.io import io_api
from api.peripherals import peripherals_api
from api.utils import attrs_api
from api.project import project_api

# Create Flask app
app = Flask(__name__)
app.url_map.strict_slashes = False

# Set up Swagger for API documentation
swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "RPE Backend API",
        "description": "The RPE Backend APIs which consumed by the RPE frontend for power and thermal estimation of the Rapid Silicon devices.",
        "version": "0.1.0"
    }
}
swagger = Swagger(app, template=swagger_template)

# Register API blueprints with the Flask app
app.register_blueprint(device_api)
app.register_blueprint(clock_api)
app.register_blueprint(dsp_api)
app.register_blueprint(fabric_le_api)
app.register_blueprint(bram_api)
app.register_blueprint(io_api)
app.register_blueprint(peripherals_api)
app.register_blueprint(attrs_api)
app.register_blueprint(project_api)

# Hook up request signal to log request by UI
@app.before_request
def before_request():
    log(f"{request.method} {request.url}")

@app.after_request
def after_request(response):
    log(f"{request.method} {request.url} {response.status_code} - DONE")
    return response

# Graceful shutdown function
def shutdown_server():
    log("Shutting down server...")
    func = request.environ.get('werkzeug.server.shutdown')
    if func is not None:
        func()

# Signal handler for smooth shutdown
def signal_handler(signal_received, frame):
    log("Signal received, initiating shutdown...")
    shutdown_server()
    sys.exit(0)

# Register the signal handler for SIGINT (Ctrl+C) and SIGTERM
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Rapid Power Estimator REST API Server command-line arguments.')
    parser.add_argument('device_file', type=str, help='Path to the input device XML file')
    parser.add_argument('--port', type=int, default=5000, help='Specify TCP Port to use for REST server')
    parser.add_argument('--debug', default=False, action='store_true', help='Enable/Disable debug mode')
    parser.add_argument('--logfile', type=str, default="rpe.log", help='Specify log file name')
    parser.add_argument('--maxbytes', type=int, default=2048, help='Specify maximum log file size in kilobytes before rollover')
    parser.add_argument('--backupcount', type=int, default=20, help='Specify number of backup log files')
    args = parser.parse_args()

    # Set up logger
    log_setup(filename=args.logfile, max_bytes=args.maxbytes * 1024, backup_count=args.backupcount)

    # Check if the device_file exists
    if not os.path.exists(args.device_file):
        log(f"Device file '{args.device_file}' does not exist.", RsLogLevel.ERROR)
        sys.exit(1)

    # Parse Device XML file into Device List
    devicemanager = RsDeviceManager.get_instance()
    devicemanager.load_xml(args.device_file)

    # Log server start message
    log("App server is running...")

    # Start the Flask app
    app.run(debug=args.debug, port=args.port)

if __name__ == "__main__":
    main()
