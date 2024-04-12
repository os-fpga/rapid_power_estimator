#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from enum import Enum

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
    messages = {
        101: RsMessage(101, RsMessageType.INFO, "This clock is disabled"),
        102: RsMessage(102, RsMessageType.INFO, "DSP is disabled"),
        201: RsMessage(201, RsMessageType.WARN, "Clock is specified but no loads identified in other tabs"),
        301: RsMessage(301, RsMessageType.ERRO, "Invalid clock"),
        999: RsMessage(999, RsMessageType.ERRO, "Unknown error")
    }

    @staticmethod
    def get_message(message_code: int) -> RsMessage:
        message = RsMessageManager.messages.get(message_code)
        if message is not None:
            return message
        return RsMessageManager.messages[999]
