import signal
import sys
from flask import Blueprint, request, jsonify
from submodule.rs_logger import log

shutdown_api = Blueprint('shutdown_api', __name__)

def shutdown_server():
    """Function to gracefully shut down the server."""
    log("Shutting down server...")
    func = request.environ.get('werkzeug.server.shutdown')
    if func is not None:
        func()
    else:
        log("Server shutdown function not found.", level="ERROR")
    sys.exit(0)

def signal_handler(signal_received, frame):
    """Handles signals for graceful shutdown."""
    log(f"Signal {signal_received} received, initiating shutdown...")
    shutdown_server()

@shutdown_api.route('/shutdown', methods=['POST'])
def trigger_shutdown():
    """API endpoint to trigger a server shutdown."""
    log("Shutdown API called by user request.")
    shutdown_server()
    return jsonify({"message": "Server is shutting down..."}), 200

# Register the signal handler for SIGINT and SIGTERM
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)
