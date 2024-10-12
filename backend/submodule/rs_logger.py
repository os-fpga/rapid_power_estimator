from enum import Enum
from typing import Union
import os
import logging
import logging.handlers

class RsLogLevel(Enum):
    DEBUG = 'DEBUG'
    INFO = 'INFO'
    WARNING = 'WARNING'
    ERROR = 'ERROR'

def get_formatter() -> logging.Formatter:
    return logging.Formatter(fmt='%(asctime)s.%(msecs)03d - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

def get_file_handler(filename: str, max_bytes: int, backup_count: int) -> logging.Handler:
    handler = logging.handlers.RotatingFileHandler(os.path.join(os.path.expanduser("~"), filename), mode="a", encoding="utf-8", maxBytes=max_bytes, backupCount=backup_count)
    handler.setFormatter(get_formatter())
    return handler

def get_console_handler() -> logging.Handler:
    handler = logging.StreamHandler()
    handler.setFormatter(get_formatter())
    return handler

def log_setup(filename: str = 'app.log', max_bytes: int = 0, backup_count: int = 0) -> None:
    logger = logging.getLogger("rs_logger")
    if not logger.handlers:
        logger.addHandler(get_file_handler(filename, max_bytes, backup_count))
        logger.addHandler(get_console_handler())
        logger.setLevel(logging.DEBUG)

def log(msg: str, level: RsLogLevel = RsLogLevel.INFO, *, exc_info: Union[Exception, bool] = False) -> None:
    logger = logging.getLogger("rs_logger")
    if level == RsLogLevel.DEBUG:
        logger.debug(msg, exc_info=exc_info)
    elif level == RsLogLevel.WARNING:
        logger.warning(msg, exc_info=exc_info)
    elif level == RsLogLevel.ERROR:
        logger.error(msg, exc_info=exc_info)
    else:
        logger.info(msg, exc_info=exc_info)
