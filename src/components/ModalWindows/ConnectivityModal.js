import React from 'react';
import { loadActivity, connectivityNames } from '../../utils/cpu';
import { FieldType } from '../../utils/common';

import ModalWindow from './ModalWindow';

function ConnectivityModal({
  closeModal, onSubmit, defaultValue,
}) {
  return (
    <ModalWindow
      closeModal={closeModal}
      onSubmit={onSubmit}
      defaultValue={defaultValue}
      fields={[
        {
          fieldType: FieldType.textarea,
          id: 'clock',
          text: 'Clock',
          value: defaultValue.clock,
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
          id: 'toggle_rate',
          text: 'Toggle Rate',
          value: defaultValue.toggle_rate,
        },
      ]}
    />
  );
}

export default ConnectivityModal;
