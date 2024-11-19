=============
SoC Input
=============

This section will document SoC input for Rapid Power Estimator.

Peripherals
###########

To begin inputting SoC information the user must start with selecting peripherals needed for boot, debug & application. The peripherals input section is located on the bottom of the input interface. 

Selecting the Peripheral section will display a list of available peripherals on the target device. 

.. image:: figures/peripherals-figures-peripherals_selected.JPG

Use the checkboxes on left side to enable/disable peripherals.
Then click on each enabled peripheral's action column button to configure the peripheral. 

.. image:: figures/peripherals-figures-input_pwm_info.JPG

For each peripheral, select it's usage as well as performance. 

*Note:* For PWM, selecting an IO is also required to drive the PWM signal.

BCPU - Boot Central Processing Unit
#######################################

The BCPU section is found at the top of the SoC input section, to the left of the SoC Total power display.

Selecting the BCPU section will display the name of the CPU "N22 RISC-V", followed by it's configuration fields.

.. image:: figures/SoC-figures-BCPU-BPCU_selected.JPG

Enable/Disable encryption using the checkbox.

Select Boot Mode, SPI is selected by default. 
*note:* SPI is currently the only available mode.

Select Clock, BOOT CLK is selected by default.

Click on the "Add" button to connect peripherals with BCPU. These will be primarily used for debug and accessing memory.

.. image:: figures/SoC-figures-BCPU-input_BPCU_info.JPG

Select peripheral under the "Endpoint" dropdown, then enter it's active state, Read/Write Rate & Toggle Rate. Repeat this step for each peripheral.

Connectivity
############

The Connectivity section is found below the BCPU section & SoC Total power display.

.. image:: figures/SoC-figures-connectivity-connectivity_selected.JPG

Selecting the Connectivity section will display an empty table, click on the "Add" button above the table to connect peripherals to the FPGA fabric.

.. image:: figures/SoC-figures-connectivity-input_connectivity_info.JPG

For each peripheral, first pick one of the clocks inputted from the FPGA clocking section. 

Under the Endpoint dropdown, select the peripheral to connect to the FPGA fabric, followed by active state, read/write rate & toggle rate. Repeat for each FPGA fabric connection needed.

Memory
########

The memory section is found below the FPGA input section.

.. image:: figures/memory-figures-memory_selected.JPG

Selecting the memory section will display a table below with the available memory options, click the "Add" button above the table to configure each memory.

.. image:: figures/memory-figures-input_OCM_memory_info.JPG

For each memory, select it's usage, then Memory Type, followed by required Data Rate & channel width. 

*Note:* All devices will have OCM - on chip memory, DDR memory is only available on specific devices.

.. image:: figures/memory-figures-input_DDR_memory_info.JPG

ACPU - Application Central Processing Unit
###########################################

The ACPU section is found on the top left of the SoC input display. 

.. image:: figures/SoC-figures-ACPU-ACPU_selected.JPG

Selecting the ACPU section will display the name of the CPU, followed by it's operating frequency & Load selection. *Note:* Application CPU is not available on all devices.

Toggle the ACPU Power toggle switch on left hand side to enable ACPU, then select the load required from the Load dropdown. 

Click the "Add" button above the empty table to connect peripherals to the ACPU.

.. image:: figures/SoC-figures-ACPU-input_ACPU_info.JPG

For each peripheral, select peripheral under Endpoint, then select active state, read/write rate & toggle rate. 

DMA - Direct Memory Access
###########################

The DMA section is found below the ACPU section, clicking it will display a 4 channel table on the display.

.. image:: figures/SoC-figures-DMA-DMA_selected.JPG

Enable/disable each channel using the checkboxes under the Enable column, then click on the action column buttons to configure the channel connections.

.. image:: figures/SoC-figures-DMA-put_DMA_info.JPG

For each channel, select a source & destination, typically a peripheral will be connected to a memory or vice-versa. Then select the active state, read/write rate & toggle rate.

