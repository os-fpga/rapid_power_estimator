import React from 'react';
import PropTypes from 'prop-types';
import { FieldType } from '../../utils/common';
import ModalWindow from './ModalWindow';

function DMAModal({
  closeModal, onSubmit, defaultValue, title, loadActivity, source,
}) {
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
          text: 'Channel Name',
          value: defaultValue.name,
        },
        {
          fieldType: FieldType.select,
          id: 'source',
          text: 'Source',
          value: defaultValue.source,
          values: source,
        },
        {
          fieldType: FieldType.select,
          id: 'destination',
          text: 'Destination',
          value: defaultValue.destination,
          values: source,
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

DMAModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  defaultValue: PropTypes.oneOfType([
    PropTypes.object,
  ]).isRequired,
};

export default DMAModal;
