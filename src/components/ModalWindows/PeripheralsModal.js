import React from 'react';
import { FieldType } from '../../utils/common';
import ModalWindow from './ModalWindow';

function PeripheralsModal({ closeModal, onSubmit, defaultValue }) {
  return (
    <ModalWindow
      closeModal={closeModal}
      onSubmit={onSubmit}
      defaultValue={defaultValue}
      title={defaultValue.name}
      fields={[
        {
          fieldType: FieldType.select,
          id: 'usage',
          text: 'Usage',
          value: defaultValue.usage,
          values: defaultValue.usage_values,
        },
        {
          fieldType: FieldType.select,
          id: 'performance',
          text: 'Performance',
          value: defaultValue.performance,
          values: defaultValue.performance_values,
        },
      ]}
    />
  );
}

export default PeripheralsModal;
