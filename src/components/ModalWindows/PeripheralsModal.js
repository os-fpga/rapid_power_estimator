import React from 'react';
import { FieldType, getPerformance } from '../../utils/common';
import ModalWindow from './ModalWindow';

function PeripheralsModal({
  closeModal, onSubmit, defaultValue, index,
}) {
  return (
    <ModalWindow
      closeModal={closeModal}
      onSubmit={onSubmit}
      defaultValue={defaultValue.data[index].data}
      title={defaultValue.data[index].data.name}
      fields={[
        {
          fieldType: FieldType.select,
          id: 'usage',
          text: 'Usage',
          value: defaultValue.data[index].data.usage,
          values: defaultValue.usage,
        },
        {
          fieldType: FieldType.select,
          id: defaultValue.performance_id,
          text: 'Performance',
          value: getPerformance(defaultValue.data[index].data),
          values: defaultValue.performance,
        },
        {
          disable: !defaultValue.io_used,
          fieldType: FieldType.number,
          id: 'io_used',
          text: 'IO Used',
          value: defaultValue.data.io_used,
        },
      ]}
    />
  );
}

export default PeripheralsModal;
