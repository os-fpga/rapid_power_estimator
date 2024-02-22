import React from "react";
import { glitch_factor } from "./../assets/fle"
import { FieldType } from "../assets/common";
import ModalWindow from "./ModalWindow";

export const FleModal = ({ closeModal, onSubmit, defaultValue }) => {
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
          id: "lut6",
          text: "LUT6",
          value: defaultValue.lut6
        },
        {
          fieldType: FieldType.number,
          id: "flip_flop",
          text: "FF/Latch",
          value: defaultValue.flip_flop
        },
        {
          fieldType: FieldType.textarea,
          id: "clock",
          text: "Clock",
          value: defaultValue.clock
        },
        {
          fieldType: FieldType.number,
          id: "toggle_rate",
          text: "Toggle Rate",
          value: defaultValue.toggle_rate
        },
        {
          fieldType: FieldType.select,
          id: "glitch_factor",
          text: "Glitch Factor",
          value: defaultValue.glitch_factor,
          values: glitch_factor
        },
      ]}
    />
  );
};

export default FleModal;