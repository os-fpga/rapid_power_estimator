#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
from dataclasses import dataclass, field
from enum import Enum
from clock import Clock

class BRAM_Type(Enum):
    BRAM_18K_SDP = 0
    BRAM_36K_SDP = 1
    BRAM_18k_TDP = 2
    BRAM_36k_TDP = 3
    BRAM_18K_SP = 4
    BRAM_36K_SP = 5
    BRAM_18K_FIFO = 6
    BRAM_36K_FIFO = 7
    BRAM_18K_ROM = 8
    BRAM_36K_ROM = 9

@dataclass
class PortOutputProperties:
    clock_frequency: int = field(default=100000000)
    output_signal_rate: float = field(default=0.0)
    RAM_depth: int = field(default=1024)

    def __init__(self, clock_frequency: int = 100000000, output_signal_rate: float = 0.0, RAM_depth: int = 1024):
        self.clock_frequency = clock_frequency
        self.output_signal_rate = output_signal_rate
        self.RAM_depth = RAM_depth

@dataclass
class BRAM_output:
    port_A: PortOutputProperties = field(default_factory=PortOutputProperties)
    port_B: PortOutputProperties = field(default_factory=PortOutputProperties)
    block_power : float = field(default=0.0)
    interconnect_power : float = field(default=0.0)
    percentage : float = field(default=0.0)
    message : str = field(default='')

@dataclass
class PortProperties:
    clock: Clock = field(default=None)
    width: int = field(default=16)
    write_enable_percentage: float = field(default=50.0)
    toggle_rate: float = field(default=12.5)

@dataclass
class BRAM:
    _id_counter = 0  # Class variable to keep track of IDs
    id : int = field(init=False)
    enable : bool = field(default=False)
    name : str = field(default='')
    type : BRAM_Type = field(default=BRAM_Type.BRAM_18K_SDP)
    bram_used : int = field(default=0)
    port_A: PortProperties = field(default_factory=PortProperties)
    port_B: PortProperties = field(default_factory=PortProperties)
    estimated_power_output : BRAM_output = field(default=BRAM_output())

    def __init__(
        self,
        enable: bool = False,
        name: str = '',
        type: BRAM_Type = BRAM_Type.BRAM_18K_SDP,
        bram_used: int = 0,
        port_A: PortProperties = PortProperties(),
        port_B: PortProperties = PortProperties(),
        estimated_power_output: BRAM_output = BRAM_output(),
    ):
        self.id = self._generate_unique_id()
        self.enable = enable
        self.name = name
        self.type = type
        self.bram_used = bram_used
        self.port_A = port_A
        self.port_B = port_B
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
