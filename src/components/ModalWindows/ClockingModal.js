import React from 'react';
import { sources, states } from '../../utils/clocking';
import { FieldType } from '../../utils/common';
import ModalWindow from './ModalWindow';

function ClockingModal({
  closeModal, onSubmit, defaultValue, title,
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
          id: 'source',
          text: 'Source',
          value: defaultValue.source,
          values: sources,
        },
        {
          fieldType: FieldType.textarea,
          id: 'description',
          text: 'Description',
          value: defaultValue.description,
        },
        {
          fieldType: FieldType.textarea,
          id: 'port',
          text: 'Port/Signal name',
          value: defaultValue.port,
        },
        {
          fieldType: FieldType.number,
          id: 'frequency',
          text: 'Frequency',
          value: defaultValue.frequency,
        },
        {
          fieldType: FieldType.select,
          id: 'state',
          text: 'State',
          value: defaultValue.state,
          values: states,
        },
      ]}
    />
  );
}

export default ClockingModal;
