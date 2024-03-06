import React from "react";
import { BsFillTrashFill } from "react-icons/bs"
import { PiNotePencil } from "react-icons/pi";
import { FaPlus } from "react-icons/fa6";

import "./../style/ComponentTable.css"

export const Actions = ({ onEditClick, onDeleteClick, rowSpan, showDelete = true }) => {
  return <td rowSpan={rowSpan}>
    <span className="actions">
      <PiNotePencil className="edit" onClick={() => { onEditClick() }} />
      {showDelete && <BsFillTrashFill className="delete" onClick={() => onDeleteClick()} />}
    </span>
  </td>
}

export const Checkbox = ({ isChecked, label, checkHandler, id, disabled }) => {
  const checkboxRef = React.useRef(null)
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
  )
}

export const TableBase = ({ header, data }) => {
  return <div className="table-wrapper">
    <table className="table-style">
      <thead>
        <tr>
          {
            header.map((item, index) => {
              if (item.className)
                return <th key={index} className={item.className}>{item.text}</th>
              else
                return <th key={index}>{item}</th>
            })
          }
        </tr>
      </thead>
      <tbody>
        {
          data
        }
      </tbody>
    </table>
  </div>
}

export const TableBaseWrapper = ({ title, onPlusClick, content, powerTable, modalContent }) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  return <div className="component-table-head">
    <div className="main-block">
      <div className="layout-head">
        <label>{title}</label>
        <button className="plus-button" onClick={setModalOpen(true)}><FaPlus /></button>
      </div>
      {
        content
      }
      {modalOpen &&
        (modalContent)
      }
    </div>
    <div className="power-table-wrapper">
      {
        powerTable
      }
    </div>
  </div>
}