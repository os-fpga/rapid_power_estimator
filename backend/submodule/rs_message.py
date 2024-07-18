#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from enum import Enum
from typing import Dict, Any
import copy

class RsMessageType(Enum):
    ERRO = "error"
    WARN = "warn"
    INFO = "info"

class RsMessage:
    def __init__(self, message_code, message_type, message_text):
        self.code = message_code
        self.type = message_type
        self.text = message_text

class RsMessageManager:
    messages = [
        RsMessage(999, RsMessageType.ERRO, "Unknown error"),
        RsMessage(101, RsMessageType.INFO, "This clock is disabled"),
        RsMessage(102, RsMessageType.INFO, "DSP is disabled"),
        RsMessage(103, RsMessageType.INFO, "Logic Element is disabled"),
        RsMessage(104, RsMessageType.INFO, "BRAM is disabled"),
        RsMessage(105, RsMessageType.INFO, "IO is disabled"),
        RsMessage(106, RsMessageType.INFO, "Peripheral '{name}' is disabled"),
        RsMessage(201, RsMessageType.WARN, "Clock is specified but no loads identified in other tabs"),
        RsMessage(202, RsMessageType.WARN, "Not enough {bank_type} banks powered at {voltage}V available"),
        RsMessage(203, RsMessageType.WARN, "Peripheral '{name}' is not connected"),
        RsMessage(204, RsMessageType.WARN, "DMA {name} source not specified"),
        RsMessage(205, RsMessageType.WARN, "DMA {name} destination not specified"),
        RsMessage(205, RsMessageType.WARN, "DMA {name} cannot have the same source and destination"),
        RsMessage(301, RsMessageType.ERRO, "Invalid clock '{clock}'"),
        RsMessage(302, RsMessageType.ERRO, "Invalid clock on Port A"),
        RsMessage(303, RsMessageType.ERRO, "Invalid clock on Port B"),
        RsMessage(304, RsMessageType.ERRO, "Peripheral '{name}' is selected but not enabled"),
        RsMessage(305, RsMessageType.ERRO, "Peripheral '{name}' not found"),
        RsMessage(306, RsMessageType.ERRO, "Device '{name}' not found"),
        RsMessage(307, RsMessageType.ERRO, "Load error: {message}"),
        RsMessage(308, RsMessageType.ERRO, "Load peripheral error: {message}"),
    ]

    @staticmethod
    def get_message(message_code: int, params : Dict[str, Any] = None) -> RsMessage:
        message = [m for m in RsMessageManager.messages if m.code == message_code]
        if message:
            copied_message = copy.deepcopy(message[0])
            if params is not None:
                copied_message.text = copied_message.text.format(**params)
            return copied_message
        return RsMessageManager.messages[0]
