import React from 'react';
import { connectivityNames } from '../../utils/cpu';
import { FieldType } from '../../utils/common';
import { useClockSelection } from '../../ClockSelectionProvider';
import { useGlobalState } from '../../GlobalStateProvider';

import ModalWindow from './ModalWindow';

function ConnectivityModal({
  closeModal, onSubmit, defaultValue, title,
}) {
  const { clocks } = useClockSelection();
  const { GetOptions } = useGlobalState();
  const loadActivity = GetOptions('Port_Activity');
  return (
    <ModalWindow
      title={title}
      closeModal={closeModal}
      onSubmit={onSubmit}
      defaultValue={defaultValue}
      fields={[
        {
          fieldType: FieldType.selectClock,
          id: 'clock',
          text: 'Clock',
          value: defaultValue.clock,
          values: clocks,
        },
        {
          fieldType: FieldType.select,
          id: 'name',
          text: 'Endpoint',
          value: defaultValue.name,
          values: connectivityNames,
        },
        {
          fieldType: FieldType.select,
          id: 'activity',
          text: 'Activity',
          value: defaultValue.activity,
          values: loadActivity,
        },
        {
          fieldType: FieldType.float,
          step: 1,
          id: 'read_write_rate',
          text: 'Read/Write Rate',
          value: defaultValue.read_write_rate,
        },
        {
          fieldType: FieldType.float,
          step: 0.5,
          id: 'toggle_rate',
          text: 'Toggle Rate',
          value: defaultValue.toggle_rate,
        },
      ]}
    />
  );
}

export default ConnectivityModal;
