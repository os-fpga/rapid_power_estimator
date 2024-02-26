import React from "react";
import {
    direction,
    io_standard,
    drive_strength,
    slew_rate,
    differential_termination,
    io_data_type,
    synchronization,
    io_pull_up_down
} from "../../utils/io"
import { FieldType } from "../../utils/common";
import ModalWindow from "./ModalWindow";

const IOModal = ({ closeModal, onSubmit, defaultValue }) => {
    return (
        <ModalWindow
            closeModal={closeModal}
            onSubmit={onSubmit}
            defaultValue={defaultValue}
            fields={[
                {
                    fieldType: FieldType.textarea,
                    id: "name",
                    text: "RTL Port Name",
                    value: defaultValue.name
                },
                {
                    fieldType: FieldType.number,
                    id: "bus_width",
                    text: "Bus width",
                    value: defaultValue.bus_width
                },
                {
                    fieldType: FieldType.textarea,
                    id: "clock",
                    text: "Clock",
                    value: defaultValue.clock
                },
                {
                    fieldType: FieldType.float,
                    id: "duty_cycle",
                    text: "Duty cycle",
                    step: 1,
                    value: defaultValue.duty_cycle
                },
                {
                    fieldType: FieldType.select,
                    id: "direction",
                    text: "Direction",
                    value: defaultValue.direction,
                    values: direction
                },
                {
                    fieldType: FieldType.select,
                    id: "io_standard",
                    text: "IO Standard",
                    value: defaultValue.io_standard,
                    values: io_standard
                },
                {
                    fieldType: FieldType.select,
                    id: "drive_strength",
                    text: "Drive Strength",
                    value: defaultValue.drive_strength,
                    values: drive_strength
                },
                {
                    fieldType: FieldType.select,
                    id: "slew_rate",
                    text: "Slew Rate",
                    value: defaultValue.slew_rate,
                    values: slew_rate
                },
                {
                    fieldType: FieldType.select,
                    id: "differential_termination",
                    text: "Differential Termination",
                    value: defaultValue.differential_termination,
                    values: differential_termination
                },
                {
                    fieldType: FieldType.select,
                    id: "io_pull_up_down",
                    text: "Pullup / Pulldown",
                    value: defaultValue.io_pull_up_down,
                    values: io_pull_up_down,
                },
                {
                    fieldType: FieldType.select,
                    id: "io_data_type",
                    text: "Data Type",
                    value: defaultValue.io_data_type,
                    values: io_data_type
                },
                {
                    fieldType: FieldType.float,
                    id: "input_enable_rate",
                    text: "Input Enable Rate",
                    step: 1,
                    value: defaultValue.input_enable_rate,
                },
                {
                    fieldType: FieldType.float,
                    id: "output_enable_rate",
                    text: "Output Enable Rate",
                    step: 1,
                    value: defaultValue.output_enable_rate,
                },
                {
                    fieldType: FieldType.select,
                    id: "synchronization",
                    text: "Synchronization",
                    value: defaultValue.synchronization,
                    values: synchronization
                },
                {
                    fieldType: FieldType.float,
                    id: "toggle_rate",
                    text: "Toggle Rate",
                    step: "0.5",
                    value: defaultValue.toggle_rate,
                },
            ]}
        />
    );
};

export default IOModal;