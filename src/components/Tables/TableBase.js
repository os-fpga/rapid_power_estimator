import React from 'react';
import { BsFillTrashFill } from 'react-icons/bs';
import { PiNotePencil } from 'react-icons/pi';
import { AddButton } from '../ComponentsLib';

import '../style/ComponentTable.css';

export function Actions({ onEditClick, onDeleteClick, rowSpan }) {
  return (
    <td rowSpan={rowSpan}>
      <span className="actions">
        <PiNotePencil className="edit" onClick={() => { onEditClick(); }} />
        {onDeleteClick && <BsFillTrashFill className="delete" onClick={() => onDeleteClick()} />}
      </span>
    </td>
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

export function TableBase({
  header, disabled, onClick, hideAddBtn = false, children,
}) {
  return (
    <div className="table-wrapper">
      {!hideAddBtn && <AddButton disabled={disabled} onClick={onClick} />}
      <table className="table-style main-border">
        <thead>
          <tr>
            {
              header.map((item, index) => {
                if (item.className) {
                  // eslint-disable-next-line react/no-array-index-key
                  return <th key={index} className={item.className}>{item.text}</th>;
                }
                // eslint-disable-next-line react/no-array-index-key
                return <th key={index}>{item}</th>;
              })
            }
          </tr>
        </thead>
        <tbody>
          {
            children
          }
        </tbody>
      </table>
    </div>
  );
}
