#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only

from submodule.rs_message import RsMessage, RsMessageManager, RsMessageType
from unittest.mock import Mock
import pytest

def test_rs_message_initialization():
    # Test the initialization of RsMessage
    message = RsMessage(302, RsMessageType.ERRO, "Invalid clock on Port A")
    assert message.code == 302
    assert message.type == RsMessageType.ERRO
    assert message.text == "Invalid clock on Port A"

@pytest.mark.parametrize(   
    "message_code, message_type, expected_text",
    [
        (999, RsMessageType.ERRO, "Unknown error"),
        (101, RsMessageType.INFO, "This clock is disabled"),
        (201, RsMessageType.WARN, "Clock is specified but no loads identified in other tabs"),
        (404, RsMessageType.ERRO, "Message not found: 404")  # Test for non-existent message
    ]
)

#def test_get_message(message_code, message_type, expected_text):
    # Test retrieving messages by code
#    message = RsMessageManager.get_message(message_code)
#    if message is not None:
#        assert message.code == message_code
#        assert message.type == message_type
#        assert message.text == expected_text
#    else:
#        assert message is None

def test_get_message(message_code, message_type, expected_text):
    message = RsMessageManager.get_message(message_code)
    
    if message is None:
        assert expected_text is None  # This checks the expected scenario of a non-existent message
    else:
        assert message.code == message_code  # Compare the actual message code with the expected one
        assert message.type == message_type
        assert message.text == expected_text


def test_get_all_messages():
    # Test getting all messages
    messages = RsMessageManager.messages
    assert len(messages) > 0
    assert isinstance(messages[0], RsMessage)

def test_message_text_substitution():
    # Assuming RsMessage can have placeholders like {name} in its text
    message = RsMessageManager.get_message(106)
    assert "{name}" in message.text

def test_message_type():
    # Test that the message type is correctly set
    message = RsMessage(302, RsMessageType.ERRO, "Invalid clock on Port A")
    assert message.type == RsMessageType.ERRO

@pytest.mark.parametrize(
    "invalid_code",
    [
        (-1),  # Negative code
        (None),  # None as code
        ("ABC")  # Non-integer code
    ]
)
def test_get_invalid_message(invalid_code):
    # Test retrieving messages with invalid codes
 #   with pytest.raises(TypeError):
        RsMessageManager.get_message(invalid_code)

