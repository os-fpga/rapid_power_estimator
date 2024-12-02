==========================
Setting up an RPE Project
==========================

This section will document how to setup a project on Rapid Power Estimator.

Launching RPE
##############

To launch the Rapid Power Estimator, simply navigate to your start menu and search for "Rapid Power Estimator". Once the application is found, click on the application icon to launch the tool.

.. image:: figures/setup-figures-launching_RPE_from_windows_start_menu_v2.JPG
    :alt: RPE icon on windows start menu

The Rapid Power Estimator will display the following screen upon launch.

.. image:: figures/setup-figures-launch_RPE-start_screen.JPG
    :alt: Start screen

Device Selection
#################

The first step in beginning an RPE project is to select the FPGA device, once selected this device should not be changed during the project. 

To view the devices supported on RPE, click on the Device dropdown labelled "Select a device" on the top left of the screen.

.. image:: figures/setup-figures-device_selection-device_info_display.JPG
    :alt: Device Selection dropdown menu

Once a device is selected, logic density, package, spreedgrade and temperature grade range will be displayed. Check to make sure the selected device matches the one you plan to evaluate or currently are using with Raptor Design Suite.

.. image:: figures/setup-figures-device_selection-MPW1_device_info.JPG

Project Creation
#################

Once a device has been selected, it is reccommended to save the project before continuing. To save your work as a .rpe project, simply click the "file" tab on the top left of the window and click the "save as" option.

.. image:: figures/setup-figures-project_creation-file_save_as.JPG
   :width: 260px
   :height: 320px
   :alt: save as option


A window will be opened prompting the user to select a location to save the RPE project as well as provide a name for the project. After setting the location and name, click "Save Project Folder"

.. image:: figures/setup-figures-project_creation-create_project_folder.JPG
    :alt: save project folder

While working on the RPE project, the user can save their project's progress using either the save option under the file tab or the floppy disk save icon found above the FPGA Complex and Core Power display. 

.. image:: figures/setup-figures-project_creation-file_save.JPG
   :alt: save option

.. image:: figures/setup-figures-project_creation-file_save_icon.JPG
   :alt: save icon

In order to open an RPE project after closing and re-launching Raptor, the user should click the file tab and click on "Open Project"

.. image:: figures/setup-figures-project_creation-open_project_option.JPG
    :alt: open project option

.. image:: figures/setup-figures-project_creation-open_project.JPG
    :alt: open project

The user will find their RPE project folder and inside find the .rpe project file. 

.. image:: figures/setup-figures-project_creation-open_project_file.JPG
    :alt: open project file

Select the project file, then click the open button on the window to open the project and continue working from where you left off. 