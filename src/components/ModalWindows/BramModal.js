import React from "react";
import { bram_type } from "../../utils/bram";
import { FieldType } from "../../utils/common"

import ModalWindow from "./ModalWindow"

const BramModal = ({ closeModal, onSubmit, defaultValue }) => {
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
          text: "Port A - Write",
          id: "Port A - Write",
          internal: [
            {
              fieldType: FieldType.textarea,
              id: "port_a_clock",
              text: "Clock",
              value: defaultValue.port_a_clock
            },
            {
              fieldType: FieldType.number,
              id: "port_a_width",
              text: "Width",
              value: defaultValue.port_a_width
            },
            {
              fieldType: FieldType.float,
              id: "port_a_write_enable_rate",
              text: "Write Enable",
              value: defaultValue.port_a_write_enable_rate
            },
            {
              fieldType: FieldType.float,
              id: "port_a_read_enable_rate",
              text: "Read Enable",
              value: defaultValue.port_a_write_enable_rate
            },
            {
              fieldType: FieldType.float,
              id: "port_a_toggle_rate",
              text: "Toggle Rate",
              value: defaultValue.port_a_toggle_rate
            },
          ]
        },
        {
          text: "Port B - Read",
          id: "Port B - Read",
          internal: [
            {
              fieldType: FieldType.textarea,
              id: "port_b_clock",
              text: "Clock",
              value: defaultValue.port_b_clock
            },
            {
              fieldType: FieldType.number,
              id: "port_b_width",
              text: "Width",
              value: defaultValue.port_b_width
            },
            {
              fieldType: FieldType.float,
              id: "port_b_write_enable_rate",
              text: "Write Enable",
              value: defaultValue.port_b_write_enable_rate
            },
            {
              fieldType: FieldType.float,
              id: "port_b_read_enable_rate",
              text: "Read Enable",
              value: defaultValue.port_b_write_enable_rate
            },
            {
              fieldType: FieldType.float,
              id: "port_b_toggle_rate",
              text: "Toggle Rate",
              value: defaultValue.port_b_toggle_rate
            },
          ]
        }
      ]
      }
    />
  );
};

export default BramModal;