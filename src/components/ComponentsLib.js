import React from 'react';
import { BsPlus } from 'react-icons/bs';
import './style/ComponentsLib.css';

export function State({
  messages = [], baseClass = 'clickable', children,
}) {
  function isError() {
    const errors = messages.filter((item) => item.filter((inner) => inner.type === 'error').length > 0);
    return errors.length > 0;
  }
  function isWarning() {
    const errors = messages.filter((item) => item.filter((inner) => inner.type === 'warn').length > 0);
    return errors.length > 0;
  }
  const buildClassName = () => {
    let base = baseClass;
    if (isError()) base += ' error';
    else if (isWarning()) base += ' warning';
    else base += ' normal';
    return base;
  };
  return (
    <div className={buildClassName()}>
      {children}
    </div>
  );
}

export function ComponentLabel({ name }) {
  return (
    <div className="layout-head">
      <div className="component-label-text-center">
        FPGA
      </div>
      <div className="component-label-text-center">
        &gt;
      </div>
      <div className="component-label">
        {name}
      </div>
    </div>
  );
}

export function AddButton({ disabled, onClick }) {
  return (
    <button className="button" type="button" disabled={disabled} onClick={onClick}>
      <div className="icon-container">
        <BsPlus color="#007bff" className="icon" />
      </div>
      Add
    </button>
  );
}

export function Checkbox({
  isChecked, checkHandler, id, label = '', disabled = false,
}) {
  const checkboxRef = React.useRef(null);
  return (
    <div>
      <input
        type="checkbox"
        id={id}
        checked={isChecked}
        onChange={() => checkHandler(checkboxRef.current.checked)}
        ref={checkboxRef}
        disabled={disabled}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

export function PercentSelector({ value, setValue, max }) {
  function* generateNumbers(start, end, step) {
    for (let i = start; i <= end; i += step) {
      yield i;
    }
  }
  const numbersArray = [...generateNumbers(0, max, 10)];

  return (
    <select value={value} onChange={(e) => setValue(parseInt(e.target.value, 10))}>
      {
        numbersArray.map((item) => (
          <option key={item} value={item}>
            {item}
            {' %'}
          </option>
        ))
      }
    </select>
  );
}

export function Dropdown({
  id, value, onChangeHandler, items,
}) {
  return (
    <select id={id} value={value} onChange={(e) => onChangeHandler(parseInt(e.target.value, 10))}>
      {
        items.map((item) => <option key={item.id} value={item.id}>{item.text}</option>)
      }
    </select>
  );
}
