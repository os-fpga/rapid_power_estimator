import React from 'react';
import { FieldType } from '../../utils/common';
import ModalWindow from './ModalWindow';
import { useClockSelection } from '../../ClockSelectionProvider';
import { useGlobalState } from '../../GlobalStateProvider';

function FleModal({
  closeModal, onSubmit, defaultValue, title,
}) {
  const { clocks } = useClockSelection();
  const { GetOptions } = useGlobalState();
  const glitchFactor = GetOptions('Glitch_Factor');
  return (
    <ModalWindow
      title={title}
      closeModal={closeModal}
      onSubmit={onSubmit}
      defaultValue={defaultValue}
      fields={[
        {
          fieldType: FieldType.textarea,
          id: 'name',
          text: 'Name/Hierarchy',
          value: defaultValue.name,
        },
        {
          fieldType: FieldType.number,
          id: 'lut6',
          text: 'LUT6',
          value: defaultValue.lut6,
        },
        {
          fieldType: FieldType.number,
          id: 'flip_flop',
          text: 'FF/Latch',
          value: defaultValue.flip_flop,
        },
        {
          fieldType: FieldType.selectClock,
          id: 'clock',
          text: 'Clock',
          value: defaultValue.clock,
          values: clocks,
        },
        {
          fieldType: FieldType.float,
          step: '0.5',
          id: 'toggle_rate',
          text: 'Toggle Rate, %',
          value: defaultValue.toggle_rate,
        },
        {
          fieldType: FieldType.select,
          id: 'glitch_factor',
          text: 'Glitch Factor',
          value: defaultValue.glitch_factor,
          values: glitchFactor,
        },
        {
          fieldType: FieldType.float,
          step: '1',
          id: 'clock_enable_rate',
          text: 'Clock Enable, %',
          value: defaultValue.clock_enable_rate,
        },
      ]}
    />
  );
}

export default FleModal;
