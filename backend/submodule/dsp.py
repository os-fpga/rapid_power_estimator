#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from dataclasses import dataclass, field
from enum import Enum
from clock import Clock

class Pipelining(Enum):
    INPUT_AND_OUTPUT = 0
    INPUT_ONLY = 1
    OUTPUT_ONLY = 2
    NONE = 3

class DSP_Mode(Enum):
    MULTIPLY_ACCUMULATE = 0
    MULTIPLY_ADD_SUB = 1
    MULTIPLY = 2

@dataclass
class DSP_output:
    dsp_blocks_used : int = field(default=0)
    clock_frequency : int = field(default=100000000)
    output_signal_rate : float = field(default=0.0)
    block_power : float = field(default=0.0)
    interconnect_power : float = field(default=0.0)
    percentage : float = field(default=0.0)
    message : str = field(default='')

    def __init__(
        self,
        dsp_blocks_used: int = 0,
        clock_frequency: int = 100000000,
        output_signal_rate: float = 0.0,
        block_power: float = 0.0,
        interconnect_power: float = 0.0,
        percentage: float = 0.0,
        message: str = '',
    ):
        self.dsp_blocks_used = dsp_blocks_used
        self.clock_frequency = clock_frequency
        self.output_signal_rate = output_signal_rate
        self.block_power = block_power
        self.interconnect_power = interconnect_power
        self.percentage = percentage
        self.message = message

@dataclass
class DSP:
    _id_counter = 0  # Class variable to keep track of IDs
    id : int = field(init=False)
    enable : bool = field(default=False)
    name : str = field(default='')
    number_of_multipliers : int = field(default=0)
    dsp_mode : DSP_Mode = field(default=DSP_Mode.MULTIPLY_ACCUMULATE)
    a_input_width : int = field(default=16)
    b_input_width : int = field(default=16)
    clock : Clock = field(default=None)
    pipelining : Pipelining = field(default=Pipelining.INPUT_AND_OUTPUT)
    toggle_rate : float = field(default=12.5)
    estimated_power_output : DSP_output = field(default=DSP_output())

    def __init__(
        self,
        enable: bool = False,
        name: str = '',
        number_of_multipliers: int = 0,
        dsp_mode: DSP_Mode = DSP_Mode.MULTIPLY_ACCUMULATE,
        a_input_width: int = 16,
        b_input_width: int = 16,
        clock: Clock = None,
        pipelining: Pipelining = Pipelining.INPUT_AND_OUTPUT,
        toggle_rate: float = 12.5,
        estimated_power_output: DSP_output = DSP_output(),
    ):
        self.id = self._generate_unique_id()
        self.enable = enable
        self.name = name
        self.number_of_multipliers = number_of_multipliers
        self.dsp_mode = dsp_mode
        self.a_input_width = a_input_width
        self.b_input_width = b_input_width
        self.clock = clock
        self.pipelining = pipelining
        self.toggle_rate = toggle_rate
        self.estimated_power_output = estimated_power_output

    @classmethod
    def _generate_unique_id(cls):
        cls._id_counter += 1
        return cls._id_counter

    def compute_dynamic_power(self):
        if self.enable:
            # todo
            pass
        else:
            return 0
