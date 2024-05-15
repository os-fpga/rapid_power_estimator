from enum import Enum

class DeviceNotFoundException(Exception):
    pass

class ClockNotFoundException(Exception):
    pass

class ClockDescriptionPortValidationException(Exception):
    pass

class ClockMaxCountReachedException(Exception):
    pass

class DspNotFoundException(Exception):
    pass

class FabricLeNotFoundException(Exception):
    pass

class FabricLeDescriptionAlreadyExistsException(Exception):
    pass

class BramNotFoundException(Exception):
    pass

class IONotFoundException(Exception):
    pass

class PeripheralNotFoundException(Exception):
    pass

class InvalidPeripheralTypeException(Exception):
    pass

class PeripheralEndpointNotFoundException(Exception):
    pass

class ModuleType(Enum):
    CLOCKING = 0
    FABRIC_LE = 1
    DSP = 2
    BRAM = 3
    IO = 4
    SOC_PERIPHERALS = 5
    REGULATOR = 6

class RsDeviceResources:

    def __init__(self, device):
        self.device = device
        self.modules = [None, None, None, None, None, None, None]

    def get_attr(self, name) -> int:
        return int(self.device.resources[name].num)

    def get_num_Clocks(self):
        # NOTE:
        #   The no. of clock resource is not available in device.xml.
        #   Thus, hardcode here till this is available 
        return 16

    def get_num_PLLs(self) -> int:
        # NOTE:
        #   The no. of PLL resource is not available in device.xml.
        #   Thus, hardcode here till this is available 
        series = self.device.series
        if series in ('Gemini', 'Orion', 'Lyra', 'Vega'):
            return 4
        elif series == 'Virgo':
            return 2

    def get_num_DSP_BLOCKs(self) -> int:
        # return self.get_attr('dsp')
        return 176 # overwrite for test purpose

    def get_num_18K_BRAM(self) -> int:
        # return self.get_attr('bram')
        return self.get_num_36K_BRAM() * 2 # overwrite for test purpose

    def get_num_36K_BRAM(self) -> int:
        # return self.get_attr('bram')
        return 176 # overwrite for test purpose

    def get_series(self):
        return self.device.series

    def get_device_name(self):
        return self.device.name

    def get_package(self):
        return self.device.package

    def get_speedgrade(self):
        return self.device.speedgrade

    def get_logic_density(self):
        return ''

    def get_temperature_grade(self):
        return "Industrial (-40 to 100 °C)"

    def get_num_LUTs(self) -> int:
        return self.get_attr('lut')

    def get_num_FFs(self) -> int:
        return self.get_attr('ff')

    def get_num_CLBs(self) -> int:
        # return int(self.get_num_LUTs() / 8)
        return 5676

    def get_num_HP_Banks(self) -> int:
        # todo: how to get number of hp banks?
        return 3

    def get_num_HR_Banks(self) -> int:
        # todo: how to get number of hr banks?
        return 6

    def get_num_BOOT_IOs(self) -> int:
        # todo: how to get number of boot IOs?
        return 15

    def get_num_SOC_IOs(self) -> int:
        # todo: how to get number of SoC IOs?
        return 40

    def get_num_DDR_IOs(self) -> int:
        # todo: how to get number of DDR IOs?
        return 84

    def get_num_GIGE_IOs(self) -> int:
        # todo: how to get number of DDR IOs?
        return 14

    def get_num_USB_IOs(self) -> int:
        # todo: how to get number of Gige peripheral?
        return 5

    def get_CLK_CAP(self) -> float:
        # todo: read from power data. Coeffient to calculate clock block power
        return 0.00001

    def get_CLK_INT_CAP(self) -> float:
        # todo: read from power data. Coeffient to calculate clock interconnect power
        return 0.00000003

    def get_PLL_INT(self) -> float:
        # todo: read from power data. Coeffient to calculate PLL power (VCC Core)
        return 0.0009

    def get_PLL_AUX(self) -> float:
        # todo: read from power data. Coeffient to calculate PLL power (Aux Int)
        return 0.01

    def get_LUT_CAP(self) -> float:
        # todo: read from power data. Coeffient to calculate FLE block power
        return 0.0000003

    def get_FF_CAP(self) -> float:
        # todo: read from power data. Coeffient to calculate FLE block power
        return 0.00000035

    def get_FF_CLK_CAP(self) -> float:
        # todo: read from power data. Coeffient to calculate FLE block power
        return 2.91375291375291E-09

    def get_LUT_INT_CAP(self) -> float:
        # todo: read from power data. Coeffient to calculate FLE interconnect power
        return 0.00000002

    def get_FF_INT_CAP(self) -> float:
        # todo: read from power data. Coeffient to calculate FLE interconnect power
        return 0.00000004

    def get_DSP_MULT_CAP(self) -> float:
        # todo: read from power data. Coeffient to calculate DSP block power
        return 0.0000015

    def get_DSP_MULT_CAP2(self) -> float:
        # todo: read from power data. Coeffient to calculate DSP block power (only used for MULTIPLY_ACCUMULATE & MULTIPLY_ADD_SUB DSP Modes)
        return 0.00000007

    def get_DSP_INT_CAP(self) -> float:
        # todo: read from power data. Coeffient to calculate DSP interconnect power
        return 0.0000001

    def get_VCC_CORE(self) -> float:
        # todo: should read from regulator module
        return 0.8

    def get_VCC_AUX(self) -> float:
        # todo: should read from regulator module
        return 1.8

    def get_VCC_BOOT_IO(self) -> float:
        # todo: should read from regulator module
        return 1.8

    def get_VCC_DDR_IO(self) -> float:
        # todo: should read from regulator module
        return 0.0

    def get_VCC_SOC_IO(self) -> float:
        # todo: should read from regulator module
        return 1.8

    def get_VCC_GBE_IO(self) -> float:
        # todo: should read from regulator module
        return 0.0

    def get_VCC_USB_IO(self) -> float:
        # todo: should read from regulator module
        return 0.0

    def get_VCC_BOOT_AUX(self) -> float:
        # todo: should read from regulator module
        return 1.8

    def get_VCC_SOC_AUX(self) -> float:
        # todo: should read from regulator module
        return 1.8

    def get_VCC_GBE_AUX(self) -> float:
        # todo: should read from regulator module
        return 0.0

    def get_VCC_USB_AUX(self) -> float:
        # todo: should read from regulator module
        return 0.0

    def get_VCC_PUF(self) -> float:
        # todo: should read from regulator module
        return 1.8

    def get_VCC_RC_OSC(self) -> float:
        # todo: should read from regulator module
        return 0.0

    def get_BRAM_INT_CAP(self) -> float:
        # todo: should read from power data
        return 0.00000035
    
    def get_BRAM_WRITE_CAP(self) -> float:
        # todo: should read from power data
        return 0.000002

    def get_BRAM_READ_CAP(self) -> float:
        # todo: should read from power data
        return 0.0000025

    def get_BRAM_FIFO_CAP(self) -> float:
        # todo: should read from power data
        return 0.0000007

    def get_divfactor_coeff_CLB(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            return 0.8, [[0.000000000000002, -0.0000000000001, 0.00000000001, 0.0000000008, 0.00000006, 0.000002]]
        else:
            return 0.8, [[0.0000000000003, -0.00000000001, 0.0000000001, 0.00000006, 0.0000007]]

    def get_divfactor_coeff_BRAM(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            return 0.8, [[0.000000000001, -0.00000000003, 0.00000000006, 0.0000004, 0.00001]]
        else:
            return 0.8, [[0.000000000001, -0.00000000006, 0.0000000005, 0.0000002, 0.000003]]

    def get_divfactor_coeff_DSP(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            return 0.8, [[0.000000000002, -0.00000000004, 0.00000000008, 0.0000005, 0.00001]]
        else:
            return 0.8, [[0.000000000002, -0.00000000008, 0.0000000007, 0.0000003, 0.000004]]

    def get_divfactor_coeff_GEARBOX_IO_bank_type(self, bank_type : int, worsecase : bool) -> (float, [[float]]):
        if bank_type == 0: # HP
            if worsecase:
                return 0.8, [[0.00000000003, -0.0000000006, 0.000000001, 0.000006, 0.0002]]
            else:
                return 0.8, [[0.00000000002, -0.000000001, 0.00000001, 0.000004, 0.00005]]
        elif bank_type == 1: # HR
            if worsecase:
                return 0.8, [[0.00000000003, -0.0000000007, 0.000000001, 0.000007, 0.0002]]
            else:
                return 0.8, [[0.00000000003, -0.0000000008, 0.000000001, 0.000008, 0.0002]]

    def get_divfactor_coeff_IO_bank_type(self, bank_type : int, worsecase : bool) -> (float, [[float]]):
        if bank_type == 0: # HP
            if worsecase:
                return 0.8, [[0.0001]]
            else:
                return 0.8, [[0.00005]]
        elif bank_type == 1: # HR
            if worsecase:
                return 0.8, [[0.00005]]
            else:
                return 0.8, [[0.00001]]

    def get_divfactor_coeff_AUX(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            # return 1.8, [[0.000000003, 0.0000002, 0.00004, 0.0224], [0.0000000004, 0.0000001, 0.000005, 0.0033]] # from doc
            return 1.8, [[0.00000001, -0.0000003, 0.00004,  0.0332], [0.000000002, 0.0000004, 0.00002, 0.0133]] # from excel
        else:
            return 1.8, [[0.000000003, 0.0000002, 0.00004, 0.0224], [0.0000000004, 0.0000001, 0.000005, 0.0033]]

    def get_divfactor_coeff_NOC(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            return 0.8, [[0.00000000005, -0.000000001, 0.000000002, 0.00001, 0.0003]]
        else:
            return 0.8, [[0.00000000003, -0.000000001, 0.00000001, 0.000005, 0.00006]]

    def get_divfactor_coeff_Mem_SS(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            return 0.8, [[0.0000000001, -0.000000003, 0.000000005, 0.00003, 0.0009]]
        else:
            return 0.8, [[0.0000000001, -0.000000006, 0.00000005, 0.00002, 0.0003]]

    def get_divfactor_coeff_A45(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            return 0.8, [[0.00000000000008, -0.000000000004, 0.0000000004, 0.00000003, 0.000002, 0.00008]]
        else:
            return 0.8, [[0.000000000006, -0.000000000006, -0.000000005, 0.0000007, 0.00002]]

    def get_divfactor_coeff_Config(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            return 0.8, [[0.0000000001, -0.000000002, 0.000000004, 0.00002, 0.0007]]
        else:
            return 0.8, [[0.0000000000005, -0.00000000002, 0.000000003, 0.0000002, 0.00001, 0.0013]]

    def get_divfactor_coeff_Aux_bank_type(self, bank_type : int , worsecase : bool) -> (float, [[float]]): 
        if bank_type == 0: # HP
            if worsecase:
                return 1.8, [[0.0000000008, 0.0000002, 0.00001, 0.007]]
            else:
                return 1.8, [[0.000000001, 0.0000002, 0.00021, 0.0003]]
        elif bank_type == 1: # HR
            if worsecase:
                return 1.8, [[0.0000000008, 0.0000002, 0.00001, 0.007]]
            else:
                return 1.8, [[0.000000001, 0.0000002, 0.00021, 0.0003]]

    def get_divfactor_coeff_IO_bank_type_voltage(self, bank_type : int, voltage : float, worsecase : bool = True) -> (float, [[float]]):
        # todo: should read from power data
        if bank_type == 1: # HR
            if voltage == 1.8:
                if worsecase:
                    return 0.8, [[0.000000000001, -0.00000000003, 0.00000000006, 0.0000003, 0.00001]]
                else:
                    return 0.8, [[0.000000000001, -0.00000000006, 0.0000000005, 0.0000002, 0.000003]]
            elif voltage == 2.5:
                if worsecase:
                    return 0.8, [[0.000000000001, -0.00000000003, 0.00000000006, 0.0000003, 0.000009]]
                else:
                    return 0.8, [[0.000000000001, -0.00000000006, 0.0000000005, 0.0000002, 0.000003]]
            elif voltage == 3.3:
                if worsecase:
                    return 0.8, [[0.000000000001, -0.00000000003, 0.00000000006, 0.0000003, 0.000009]]
                else:
                    return 0.8, [[0.000000000001, -0.00000000006, 0.0000000005, 0.0000002, 0.000003]]
        elif bank_type == 0: # HP
            if voltage == 1.2:
                if worsecase:
                    return 0.8, [[0.000000000001, -0.00000000003, 0.00000000006, 0.0000003, 0.000009]]
                else:
                    return 0.8, [[0.000000000001, -0.00000000006, 0.0000000005, 0.0000002, 0.000003]]
            elif voltage == 1.5:
                if worsecase:
                    return 0.8, [[0.000000000001, -0.00000000003, 0.00000000006, 0.0000003, 0.000009]]
                else:
                    return 0.8, [[0.000000000001, -0.00000000006, 0.0000000005, 0.0000002, 0.000003]]
            elif voltage == 1.8:
                if worsecase:
                    return 0.8, [[0.000000000001, -0.00000000003, 0.00000000006, 0.0000003, 0.000009]]
                else:
                    return 0.8, [[0.000000000001, -0.00000000006, 0.0000000005, 0.0000002, 0.000003]]

    def get_divfactor_coeff_VCC_BOOT_IO(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            return 0.8, [[0.000000000001, -0.00000000003, 0.00000000006, 0.0000003, 0.000009]]
        else:
            return 0.8, [[0.000000000001, -0.00000000006, 0.0000000005, 0.0000002, 0.000003]]

    def get_divfactor_coeff_VCC_DDR_IO(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            return 0.8, [[0.000000000001, -0.00000000003, 0.00000000006, 0.0000003, 0.000009]]
        else:
            return 0.8, [[0.000000000001, -0.00000000006, 0.0000000005, 0.0000002, 0.000003]]

    def get_divfactor_coeff_VCC_SOC_IO(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            return 0.8, [[0.000000000001, -0.00000000003, 0.00000000006, 0.0000003, 0.000009]]
        else:
            return 0.8, [[0.000000000001, -0.00000000006, 0.0000000005, 0.0000002, 0.000003]]

    def get_divfactor_coeff_VCC_GIGE_IO(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            return 0.8, [[0.000000000001, -0.00000000003, 0.00000000006, 0.0000003, 0.000009]]
        else:
            return 0.8, [[0.000000000001, -0.00000000006, 0.0000000005, 0.0000002, 0.000003]]

    def get_divfactor_coeff_VCC_USB_IO(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            return 0.8, [[0.000000000001, -0.00000000003, 0.00000000006, 0.0000003, 0.000009]]
        else:
            return 0.8, [[0.000000000001, -0.00000000006, 0.0000000005, 0.0000002, 0.000003]]

    def get_divfactor_coeff_VCC_BOOT_AUX(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            return 1.8, [[0.0000000008, 0.0000002, 0.00001, 0.007]]
        else:
            return 1.8, [[0.0000000008, 0.0000002, 0.00001, 0.007]]

    def get_divfactor_coeff_VCC_SOC_AUX(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            return 1.8, [[0.0000000008, 0.0000002, 0.00001, 0.007]]
        else:
            return 1.8, [[0.0000000008, 0.0000002, 0.00001, 0.007]]

    def get_divfactor_coeff_VCC_GIGE_AUX(self, worsecase: bool) -> (float, [[float]]):
        if worsecase:
            return 1.8, [[0.0000000008, 0.0000002, 0.00001, 0.007]]
        else:
            return 1.8, [[0.0000000008, 0.0000002, 0.00001, 0.007]]

    def get_divfactor_coeff_VCC_USB_AUX(self, worsecase: bool) -> (float, [[float]]):
        if worsecase:
            return 1.8, [[0.0000000008, 0.0000002, 0.00001, 0.007]]
        else:
            return 1.8, [[0.000000001, 0.0000002, 0.00021, 0.0003]]

    def get_divfactor_coeff_VCC_PUF(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            return 1.8, [[0.001]]
        else:
            return 1.8, [[0.0005]]

    def get_divfactor_coeff_VCC_RC_OSC(self, worsecase : bool) -> (float, [[float]]):
        if worsecase:
            return 1.8, [[0.0005]]
        else:
            return 1.8, [[0.0001]]

    def register_module(self, modtype, module):
        self.modules[modtype.value] = module
        return module

    def get_modules(self):
        return self.modules

    def get_module(self, modtype):
        return self.modules[modtype.value]

    def get_clock(self, clkname):
        clock_module = self.get_module(ModuleType.CLOCKING)
        if clock_module != None:
            for clock in clock_module.get_all():
                if clock.port == clkname:
                    return clock
        return None
