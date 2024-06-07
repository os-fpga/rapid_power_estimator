import React from 'react';
import { FieldType } from '../../utils/common';
import ModalWindow from './ModalWindow';
import { useClockSelection } from '../../ClockSelectionProvider';
import { useGlobalState } from '../../GlobalStateProvider';

function IOModal({
  closeModal, onSubmit, defaultValue, title,
}) {
  const { clocks } = useClockSelection();
  const { GetOptions } = useGlobalState();
  const direction = GetOptions('IO_Direction');
  const ioStandard = GetOptions('IO_Standard');
  const driveStrength = GetOptions('IO_Drive_Strength');
  const slewRate = GetOptions('IO_Slew_Rate');
  const differentialTermination = GetOptions('IO_differential_termination');
  const ioDataType = GetOptions('IO_Data_Type');
  const synchronization = GetOptions('IO_Synchronization');
  const ioPullUpDown = GetOptions('IO_Pull_up_down');
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
          text: 'RTL Port Name',
          value: defaultValue.name,
        },
        {
          fieldType: FieldType.number,
          id: 'bus_width',
          text: 'Bus width',
          value: defaultValue.bus_width,
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
          id: 'duty_cycle',
          text: 'Duty cycle',
          step: 1,
          value: defaultValue.duty_cycle,
        },
        {
          fieldType: FieldType.select,
          id: 'direction',
          text: 'Direction',
          value: defaultValue.direction,
          values: direction,
        },
        {
          fieldType: FieldType.select,
          id: 'io_standard',
          text: 'IO Standard',
          value: defaultValue.io_standard,
          values: ioStandard,
        },
        {
          fieldType: FieldType.select,
          id: 'drive_strength',
          text: 'Drive Strength',
          value: defaultValue.drive_strength,
          values: driveStrength,
        },
        {
          fieldType: FieldType.select,
          id: 'slew_rate',
          text: 'Slew Rate',
          value: defaultValue.slew_rate,
          values: slewRate,
        },
        {
          fieldType: FieldType.select,
          id: 'differential_termination',
          text: 'Differential Termination',
          value: defaultValue.differential_termination,
          values: differentialTermination,
        },
        {
          fieldType: FieldType.select,
          id: 'io_pull_up_down',
          text: 'Pullup / Pulldown',
          value: defaultValue.io_pull_up_down,
          values: ioPullUpDown,
        },
        {
          fieldType: FieldType.select,
          id: 'io_data_type',
          text: 'Data Type',
          value: defaultValue.io_data_type,
          values: ioDataType,
        },
        {
          fieldType: FieldType.float,
          id: 'input_enable_rate',
          text: 'Input Enable Rate',
          step: 1,
          value: defaultValue.input_enable_rate,
        },
        {
          fieldType: FieldType.float,
          id: 'output_enable_rate',
          text: 'Output Enable Rate',
          step: 1,
          value: defaultValue.output_enable_rate,
        },
        {
          fieldType: FieldType.select,
          id: 'synchronization',
          text: 'Synchronization',
          value: defaultValue.synchronization,
          values: synchronization,
        },
        {
          fieldType: FieldType.float,
          id: 'toggle_rate',
          text: 'Toggle Rate',
          step: '0.5',
          value: defaultValue.toggle_rate,
        },
      ]}
    />
  );
}

export default IOModal;
