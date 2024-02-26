import React from "react";
import { BsFillTrashFill } from "react-icons/bs"
import { PiNotePencil } from "react-icons/pi";

import "./../style/ComponentTable.css"

export const Actions = ({ onEditClick, onDeleteClick, rowSpan }) => {
  return <td rowSpan={rowSpan}>
    <span className="actions">
      <PiNotePencil className="edit" onClick={() => { onEditClick() }} />
      <BsFillTrashFill className="delete" onClick={() => onDeleteClick()} />
    </span>
  </td>
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