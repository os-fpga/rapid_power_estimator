import React from 'react';
import { loadActivity } from '../../utils/cpu';
import { FieldType } from '../../utils/common';

import ModalWindow from './ModalWindow';

function ABCPUModal({
  closeModal, onSubmit, defaultValue, endpoints, title,
}) {
  return (
    <ModalWindow
      title={title}
      closeModal={closeModal}
      onSubmit={onSubmit}
      defaultValue={defaultValue}
      fields={[
        {
          fieldType: FieldType.select,
          id: 'name',
          text: 'Endpoint',
          value: defaultValue.name,
          values: endpoints,
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

export default ABCPUModal;
