import React, { useState } from 'react';
import { Modal } from 'antd';
import { Dropdown } from '../ComponentsLib';

import { FieldType } from '../../utils/common';

import '../style/Modal.css';

function ModalWindow({
  title, defaultValue, onSubmit, closeModal, fields,
}) {
  const [formState, setFormState] = useState(defaultValue);
  const handleChange = (name, val) => {
    setFormState({ ...formState, [name]: val });
  };

  function generateField(item) {
    if (item.fieldType === FieldType.textarea) {
      return (
        <div key={item.id} className="form-group">
          <label>{item.text}</label>
          <input
            type="text"
            onChange={(e) => handleChange(item.id, e.target.value)}
            value={formState[item.id]}
          />
        </div>
      );
    } if (item.fieldType === FieldType.number) {
      return (
        <div key={item.id} className="form-group">
          <label>{item.text}</label>
          <input
            type="number"
            min={0}
            onChange={(e) => handleChange(item.id, e.target.value)}
            value={formState[item.id]}
          />
        </div>
      );
    } if (item.fieldType === FieldType.float) {
      return (
        <div key={item.id} className="form-group">
          <label>{item.text}</label>
          <input
            type="number"
            step={item.step ? item.step : 1}
            min={0}
            onChange={(e) => handleChange(item.id, e.target.value / 100)}
            // eslint-disable-next-line no-nested-ternary
            value={(formState[item.id] * 100).toFixed(item.step ? (item.step >= 1 ? 0 : 1) : 1)}
          />
        </div>
      );
    } if (item.fieldType === FieldType.selectClock) {
      const value = formState[item.id];
      const found = item.values.indexOf(value);
      let { values } = item;
      if (found === -1) values = [value, ...item.values];
      return (
        <div key={item.id} className="form-group">
          <label>{item.text}</label>
          <select
            id={item.id}
            value={value}
            onChange={(e) => handleChange(item.id, e.target.value)}
          >
            {
              values.map((it) => <option key={it} value={it}>{it}</option>)
            }
          </select>
        </div>
      );
    }
    return (
      <div key={item.id} className="form-group">
        <label>{item.text}</label>
        <Dropdown
          value={formState[item.id]}
          onChangeHandler={(value) => handleChange(item.id, value)}
          items={item.values}
        />
      </div>
    );
  }

  const handleOk = () => {
    onSubmit(formState);
    closeModal();
  };

  return (
    <Modal
      title={title}
      open
      onOk={handleOk}
      onCancel={closeModal}
    >
      <div className="modal">
        <form>
          {
          fields.map((item) => {
            if (Object.prototype.hasOwnProperty.call(item, 'internal')) {
              return (
                <div key={item.id} className="form-group">
                  <fieldset>
                    <legend>{item.text}</legend>
                    {
                      item.internal.map((i) => generateField(i))
                    }
                  </fieldset>
                </div>
              );
            }
            return generateField(item);
          })
        }
        </form>
      </div>
    </Modal>
  );
}

export default ModalWindow;
