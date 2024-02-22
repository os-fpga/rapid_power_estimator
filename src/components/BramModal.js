import React from "react";
import { bram_type } from "../assets/bram";
import { FieldType } from "../assets/common"

import ModalWindow from "./ModalWindow"

export const BramModal = ({ closeModal, onSubmit, defaultValue }) => {
  return (
    <ModalWindow
      closeModal={closeModal}
      onSubmit={onSubmit}
      defaultValue={defaultValue}
      fields={[
        {
          fieldType: FieldType.textarea,
          id: "name",
          text: "Name/Hierarchy",
          value: defaultValue.name
        },
        {
          fieldType: FieldType.select,
          id: "type",
          text: "BRAM Type",
          value: defaultValue.type,
          values: bram_type
        },
        {
          fieldType: FieldType.number,
          id: "bram_used",
          text: "Used",
          value: defaultValue.bram_used
        },
        {
          fieldType: FieldType.textarea,
          id: "port_a_clock",
          text: "Clock - Port A - Write",
          value: defaultValue.port_a_clock
        },
        {
          fieldType: FieldType.number,
          id: "port_a_width",
          text: "Width - Port A - Write",
          value: defaultValue.port_a_width
        },
        {
          fieldType: FieldType.number,
          id: "port_a_write_enable_rate",
          text: "Write Enable - Port A - Write",
          value: defaultValue.port_a_write_enable_rate
        },
        {
          fieldType: FieldType.number,
          id: "port_a_read_enable_rate",
          text: "Read Enable - Port A - Write",
          value: defaultValue.port_a_write_enable_rate
        },
        {
          fieldType: FieldType.number,
          id: "port_a_toggle_rate",
          text: "Toggle Rate - Port A - Write",
          value: defaultValue.port_a_toggle_rate
        },
        {
          fieldType: FieldType.textarea,
          id: "port_b_clock",
          text: "Clock - Port B - Read",
          value: defaultValue.port_b_clock
        },
        {
          fieldType: FieldType.number,
          id: "port_b_width",
          text: "Width - Port B - Read",
          value: defaultValue.port_b_width
        },
        {
          fieldType: FieldType.number,
          id: "port_b_write_enable_rate",
          text: "Write Enable - Port B - Read",
          value: defaultValue.port_b_write_enable_rate
        },
        {
          fieldType: FieldType.number,
          id: "port_b_read_enable_rate",
          text: "Read Enable - Port B - Read",
          value: defaultValue.port_b_write_enable_rate
        },
        {
          fieldType: FieldType.number,
          id: "port_b_toggle_rate",
          text: "Toggle Rate - Port B - Read",
          value: defaultValue.port_b_toggle_rate
        },
      ]
      }
    />
  );
};

export default BramModal;