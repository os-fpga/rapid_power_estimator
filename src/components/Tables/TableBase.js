import React from 'react';
import { BsFillTrashFill } from 'react-icons/bs';
import { PiNotePencil } from 'react-icons/pi';
import { MdDone } from 'react-icons/md';
import { TiWarning } from 'react-icons/ti';
import { Tooltip } from 'antd';
import { AddButton, Checkbox } from '../ComponentsLib';

import '../style/ComponentTable.css';

export function Actions({ onEditClick, onDeleteClick, rowSpan }) {
  return (
    <td rowSpan={rowSpan} className="fixed-col">
      <span className="actions">
        <PiNotePencil className="edit" onClick={() => { onEditClick(); }} />
        {onDeleteClick && <BsFillTrashFill className="delete" onClick={() => onDeleteClick()} />}
      </span>
    </td>
  );
}

export function EnableState({ isChecked, checkHandler, rowSpan }) {
  return (
    <td className="fixed-col" rowSpan={rowSpan}>
      <Checkbox
        isChecked={isChecked}
        checkHandler={checkHandler}
      />
    </td>
  );
}

export function StatusColumn({ messages, rowSpan }) {
  function isError() {
    const errors = messages.filter((item) => item.type === 'error');
    return errors.length > 0;
  }
  function isWarning() {
    const errors = messages.filter((item) => item.type === 'warn');
    return errors.length > 0;
  }
  function isInfo() {
    const errors = messages.filter((item) => item.type === 'info');
    return errors.length > 0;
  }
  function message() {
    const result = messages.map((val, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <span key={index}>
        { val.text }
        <br />
      </span>
    ));
    return result.length !== 0 ? result : '';
  }
  function color() {
    if (isWarning()) return '#EFDB94';
    if (isError()) return '#F288A8';
    if (isInfo()) return '#3385FF';
    return '#9fdda9';
  }

  return (
    <Tooltip title={message()} mouseEnterDelay={0} mouseLeaveDelay={0} color={color()}>
      <td className="fixed-col" rowSpan={rowSpan}>
        <span className="status-col-span">
          {
            messages.length === 0 && <MdDone color={color()} size={20} />
          }
          {
            messages.length !== 0 && <TiWarning color={color()} size={20} />
          }
        </span>
      </td>
    </Tooltip>
  );
}

export function TableBase({
  header, disabled, onClick, hideAddBtn = false, children,
}) {
  return (
    <div className="table-wrapper">
      {!hideAddBtn && <AddButton disabled={disabled} onClick={onClick} />}
      <div className="main-border">
        <table className="table-style">
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
            { children }
          </tbody>
        </table>
      </div>
    </div>
  );
}
