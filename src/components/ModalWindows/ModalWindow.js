import React, { useState } from 'react';

import { FieldType } from '../../utils/common';

import '../style/Modal.css';

function ModalWindow({
  title, defaultValue, onSubmit, closeModal, fields,
}) {
  const [formState, setFormState] = useState(defaultValue);
  const handleChange = (name, val) => {
    setFormState({ ...formState, [name]: val });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const state = formState;
    if (Object.prototype.hasOwnProperty.call(state, 'consumption')) {
      delete state.consumption;
    }
    onSubmit(state);
    closeModal();
  };

  const handleKeyPress = React.useCallback((event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  }, [closeModal]);

  React.useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

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
            onChange={(e) => handleChange(item.id, e.target.value / 100)}
            // eslint-disable-next-line no-nested-ternary
            value={(formState[item.id] * 100).toFixed(item.step ? (item.step >= 1 ? 0 : 1) : 1)}
          />
        </div>
      );
    }
    return (
      <div key={item.id} className="form-group">
        <label>{item.text}</label>
        <select
          onChange={(e) => handleChange(item.id, parseInt(e.target.value, 10))}
          value={formState[item.id]}
        >
          {
            item.values.map((it) => (
              <option key={it.id} value={it.id}>{it.text}</option>
            ))
          }
        </select>
      </div>
    );
  }

  return (
    <div
      className="modal-container"
      onClick={(e) => {
        if (e.target.className === 'modal-container') closeModal();
      }}
    >
      <div className="modal">
        <form>
          {title
            && (
              <div className="form-group">
                <label id="form-group-header">{title}</label>
              </div>
            )}
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
          <button type="submit" className="btn" onClick={handleSubmit}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default ModalWindow;
