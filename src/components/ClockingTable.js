import React from "react";
import { BsFillTrashFill, BsFillPencilFill, BsPlus } from "react-icons/bs"
import "./Table.css"
import ClockingModal from "./ClockingModal";
import {sources, states, GetText} from "../assets/clocking"

const ClockingTable = ({ data, deleteRow, addRow, modifyRow }) => {
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const handleSubmit = (newRow) => {
    if (editIndex !== null)
      modifyRow(editIndex, newRow);
    else
      addRow(newRow);
  };

  return <div className="clocking-head">
  <div className="layout-head">
    <label>FPGA &gt; Clocking</label>
    <button onClick={() => setModalOpen(true)}><BsPlus /></button>
  </div>
  <div className="table-wrapper">
    <table className="table-style">
      <thead>
        <tr>
          <th className="expand">Description</th>
          <th>Source</th>
          <th>Port/Signal name</th>
          <th>Frequency</th>
          <th>Clock Control</th>
          <th>Fanout</th>
          <th>Block Power</th>
          <th>Intc. Power</th>
          <th className="percentCol">%</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {
          data.map((row, index) => {
            return <tr key={index}>
              <td>{row.description}</td>
              <td>{GetText(row.source, sources)}</td>
              <td>{row.port}</td>
              <td>{row.frequency / 1000000} MHz</td>
              <td>{GetText(row.state, states)}</td>
              <td>{row.consumption.fan_out}</td>
              <td>{row.consumption.block_power} W</td>
              <td>{row.consumption.interconnect_power} W</td>
              <td>{row.consumption.percentage} %</td>
              <td>
                <span className="actions">
                  <BsFillPencilFill onClick={() => {setEditIndex(index); setModalOpen(true)}}/>
                  <BsFillTrashFill className="delete" onClick={() => deleteRow(index)}/>
                </span>
              </td>
            </tr>
          })
        }
      </tbody>
    </table>
    {modalOpen && (
        <ClockingModal
          closeModal={() => {
            setModalOpen(false);
            setEditIndex(null);
          }}
          onSubmit={handleSubmit}
          defaultValue={editIndex !== null && {
            source: data[editIndex].source,
            description: data[editIndex].description,
            port: data[editIndex].port,
            frequency: data[editIndex].frequency,
            state: data[editIndex].state
          }}
        />
      )}
  </div>
  </div>
}

export default ClockingTable;