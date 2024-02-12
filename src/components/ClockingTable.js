import React from "react";
import { BsFillTrashFill, BsFillPencilFill, BsPlus } from "react-icons/bs"
import "./Table.css"

const ClockingTable = ({ data, deleteRow }) => {

  const Sources = [
    "IO",
    "RC Oscillator",
    "Boot Clock",
    "PLL0 -> Fabric",
    "PLL1 -> Fabric",
    "PLL1 -> SERDES",
    "PLL2 -> SERDES"
  ];

  const State = [
    "Active",
    "Gated"
  ];

  return <div className="clocking-head">
  <div className="layout-head">
    <label>FPGA &gt; Clocking</label>
    <button><BsPlus /></button>
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
              <td>{Sources[row.source]}</td>
              <td>{row.port}</td>
              <td>{row.frequency / 1000000} MHz</td>
              <td>{State[row.state]}</td>
              <td>{row.consumption.fan_out}</td>
              <td>{row.consumption.block_power} W</td>
              <td>{row.consumption.interconnect_power} W</td>
              <td>{row.consumption.percentage} %</td>
              <td>
                <span className="actions">
                  <BsFillPencilFill />
                  <BsFillTrashFill className="delete" onClick={() => deleteRow(index)} />
                </span>
              </td>
            </tr>
          })
        }
      </tbody>
    </table>
  </div>
  </div>
}

export default ClockingTable;