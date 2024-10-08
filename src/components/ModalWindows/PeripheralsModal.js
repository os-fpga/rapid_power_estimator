import React, { useEffect } from 'react';
import { FieldType, getPerformance } from '../../utils/common';
import ModalWindow from './ModalWindow';

function useDisableEnterKey() {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}

function getFields(defaultValue, index) {
  return [
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
  ];
}

function PeripheralsModal({
  closeModal, onSubmit, defaultValue, index,
}) {
  useDisableEnterKey();

  return (
    <ModalWindow
      closeModal={closeModal}
      onSubmit={onSubmit}
      defaultValue={defaultValue.data[index].data}
      title={defaultValue.data[index].data.name}
      fields={getFields(defaultValue, index)}
    />
  );
}

export default PeripheralsModal;
