import React from "react";
import { dsp_mode, pipelining } from "../../utils/dsp";
import { FieldType } from "../../utils/common";

import ModalWindow from "./ModalWindow";

const DspModal = ({ closeModal, onSubmit, defaultValue }) => {
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
          fieldType: FieldType.number,
          id: "number_of_multipliers",
          text: "XX",
          value: defaultValue.number_of_multipliers
        },
        {
          fieldType: FieldType.select,
          id: "dsp_mode",
          text: "DSP Mode",
          value: defaultValue.dsp_mode,
          values: dsp_mode
        },
        {
          fieldType: FieldType.number,
          id: "a_input_width",
          text: "A-Input Width",
          value: defaultValue.a_input_width
        },
        {
          fieldType: FieldType.number,
          id: "b_input_width",
          text: "B-Input Width",
          value: defaultValue.b_input_width
        },
        {
          fieldType: FieldType.textarea,
          id: "clock",
          text: "Clock",
          value: defaultValue.clock
        },
        {
          fieldType: FieldType.select,
          id: "pipelining",
          text: "Pipeline",
          value: defaultValue.pipelining,
          values: pipelining
        },
        {
          fieldType: FieldType.float,
          id: "toggle_rate",
          text: "Toggle Rate, %",
          value: defaultValue.toggle_rate
        },
      ]}
    />
  );
};

export default DspModal;