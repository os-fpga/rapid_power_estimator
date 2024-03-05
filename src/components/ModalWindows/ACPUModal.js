import React from "react";
import { load_activity, acpu_name } from "../../utils/cpu";
import { FieldType } from "../../utils/common"

import ModalWindow from "./ModalWindow"

const ACPUModal = ({ closeModal, onSubmit, defaultValue, names }) => {
    return (
        <ModalWindow
            closeModal={closeModal}
            onSubmit={onSubmit}
            defaultValue={defaultValue}
            fields={[
                {
                    fieldType: FieldType.select,
                    id: "name",
                    text: "Endpoint",
                    value: defaultValue.name,
                    values: names,
                },
                {
                    fieldType: FieldType.select,
                    id: "activity",
                    text: "Activity",
                    value: defaultValue.activity,
                    values: load_activity
                },
                {
                  fieldType: FieldType.float,
                  step: 1,
                  id: "read_write_rate",
                  text: "Read/Write Rate",
                  value: defaultValue.read_write_rate
                },
                {
                  fieldType: FieldType.float,
                  id: "toggle_rate",
                  text: "Toggle Rate",
                  value: defaultValue.toggle_rate
                },
            ]
            }
        />
    );
};

export default ACPUModal;