import React from 'react';
import PropTypes from 'prop-types';
import { FieldType } from '../../utils/common';
import ModalWindow from './ModalWindow';
import { useGlobalState } from '../../GlobalStateProvider';

function MemoryModal({ closeModal, onSubmit, defaultValue }) {
  const { GetOptions } = useGlobalState();
  const memoryUsage = GetOptions('Peripherals_Usage');
  const memoryType = GetOptions('Memory_Type');
  return (
    <ModalWindow
      title={defaultValue.name}
      closeModal={closeModal}
      onSubmit={onSubmit}
      defaultValue={defaultValue}
      fields={[
        {
          fieldType: FieldType.select,
          id: 'usage',
          text: 'Usage',
          value: defaultValue.usage,
          values: memoryUsage,
        },
        {
          fieldType: FieldType.select,
          id: 'memory_type',
          text: 'Memory Type',
          value: defaultValue.memory_type,
          values: memoryType,
        },
        {
          fieldType: FieldType.number,
          id: 'data_rate',
          text: 'Data Rate',
          value: defaultValue.data_rate,
        },
        {
          fieldType: FieldType.number,
          id: 'width',
          text: 'Width',
          value: defaultValue.width,
        },
      ]}
    />
  );
}

MemoryModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  defaultValue: PropTypes.oneOfType([
    PropTypes.object,
  ]).isRequired,
};

export default MemoryModal;
