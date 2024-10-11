#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import argparse
import os
import sys
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

#
# Main entry point
#
def main():
    # create and parse command line args
    parser = argparse.ArgumentParser(description='Rapid Power Estimator Rest API Server command-line arguments.')
    parser.add_argument('device_file', type=str, help='Path to the input device xml file')
    parser.add_argument('--port', type=int, default=5000, help='Specify TCP Port to use for REST server')
    parser.add_argument('--debug', default=False, action='store_true', help='Enable/Disable debug mode')
    parser.add_argument('--logfile', type=str, default="rpe.log", help='Specify log file name')
    parser.add_argument('--maxbytes', type=int, default=2048, help='Specify maximun log file size in kilobytes before rollover')
    parser.add_argument('--backupcount', type=int, default=20, help='Specify no. of backup log files')
    args = parser.parse_args()

    # setup app logger
    log_setup(filename=args.logfile, max_bytes=args.maxbytes*1024, backup_count=args.backupcount)

    # Check if the device_file exists
    if os.path.exists(args.device_file) == False:
        log(f"Device file '{args.device_file}' does not exist.", RsLogLevel.ERROR)
        sys.exit(1)

    # Parse Device XML file into Device List
    devicemanager = RsDeviceManager.get_instance()
    devicemanager.load_xml(args.device_file)

    # create flask app object
    app = Flask(__name__)
    app.url_map.strict_slashes = False

    # auto generate restapi documentation
    template = {
        "swagger": "2.0",
        "info": {
            "title": "RPE Backend API",
            "description": "The RPE Backend APIs which consumed by the RPE frontend for power and thermal estimation of the Rapid Silicon devices.",
            "version": "0.1.0"
        }
    }
    swagger = Swagger(app, template=template)

    # bind device api objects onto the flask app
    app.register_blueprint(device_api)
    app.register_blueprint(clock_api)
    app.register_blueprint(dsp_api)
    app.register_blueprint(fabric_le_api)
    app.register_blueprint(bram_api)
    app.register_blueprint(io_api)
    app.register_blueprint(peripherals_api)
    app.register_blueprint(attrs_api)
    app.register_blueprint(project_api)

    # log app server started
    log("App server is running...")

    # Start Rest API server
    app.run(debug=args.debug, port=args.port)

if __name__ == "__main__":
    main()
