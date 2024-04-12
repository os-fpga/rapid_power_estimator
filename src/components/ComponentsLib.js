import React from 'react';
import { BsPlus } from 'react-icons/bs';
import './style/ComponentsLib.css';

export function State({
  refValue, warn, err, baseClass = 'clickable', children,
}) {
  const buildClassName = React.useCallback(() => {
    let base = baseClass;
    if (refValue >= err) base += ' error';
    else if (refValue >= warn) base += ' warning';
    else base += ' normal';
    return base;
  }, [refValue, warn, err, baseClass]);
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
  isChecked, label, checkHandler, id, disabled,
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
