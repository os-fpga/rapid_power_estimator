import React from "react";
import { load_activity, acpu_name } from "../../utils/acpu";
import { FieldType } from "../../utils/common"

import ModalWindow from "./ModalWindow"

const ACPUModal = ({ closeModal, onSubmit, defaultValue }) => {
    function nameValueChanged(value) {
        //
    }
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
                    values: acpu_name,
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