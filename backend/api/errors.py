#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
class InternalServerError(Exception):
    pass

class DeviceNotExistsError(Exception):
    pass

class ClockNotExistsError(Exception):
    pass

class SchemaValidationError(Exception):
    pass

class ClockDescriptionPortValidationError(Exception):
    pass

class ClockMaxCountReachedException(Exception):
    pass

class DspNotExistsError(Exception):
    pass

class FabricLeNotExistsError(Exception):
    pass

class FabricLeDescriptionAlreadyExistsError(Exception):
    pass

class BramNotExistsError(Exception):
    pass

class IONotExistsError(Exception):
    pass

class PeripheralNotExistsError(Exception):
    pass

class InvalidPeripheralTypeError(Exception):
    pass

class PeripheralEndpointNotExistsError(Exception):
    pass

class PeripheralChannelNotExistsError(Exception):
    pass

class CreateProjectPermissionError(Exception):
    pass

class ProjectNotLoadedError(Exception):
    pass

errors = {
    "DeviceNotExistsError": {
        "message": "Device with given id doesn't exists",
        "status": 400
    },
    "ClockNotExistsError": {
        "message": "Clock with given index doesn't exists",
        "status": 400
    },
    "InternalServerError": {
        "message": "Something went wrong",
        "status": 500
    },
    "SchemaValidationError": {
        "message": "Request schema validation error",
        "status": 403
    },
    "ClockDescriptionPortValidationError": {
        "message": "Clock description or port already exists in the list of clocks",
        "status": 400
    },
    "ClockMaxCountReachedException": {
        "message": "Maximum number of clocks reached",
        "status": 403
    },
    "DspNotExistsError": {
        "message": "Dsp with given index doesn't exists",
        "status": 400
    },
    "FabricLeNotExistsError": {
        "message": "Fabric logic element with given index doesn't exists",
        "status": 400
    },
    "FabricLeDescriptionAlreadyExistsError": {
        "message": "Fabric logic element with same description already exists",
        "status": 400
    },
    "BramNotExistsError": {
        "message": "Block RAM with given index doesn't exists",
        "status": 400
    },
    "IONotExistsError": {
        "message": "IO with given index doesn't exists",
        "status": 400
    },
    "PeripheralNotExistsError": {
        "message": "Peripheral with given index doesn't exists",
        "status": 400
    },
    "InvalidPeripheralTypeError": {
        "message": "Invalid peripheral type",
        "status": 400
    },
    "PeripheralEndpointNotExistsError": {
        "message": "Peripheral endpoint with given index doesn't exists",
        "status": 400
    },
    "PeripheralChannelNotExistsError": {
        "message": "Peripheral channel with given index doesn't exists",
        "status": 400
    },
    "CreateProjectPermissionError": {
        "message": "Failed to create project file. Permission error",
        "status": 400
    },
    "ProjectNotLoadedError": {
        "message": "Project not loaded",
        "status": 400
    },
}
