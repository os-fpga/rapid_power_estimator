import React from "react";
import { BsFillTrashFill, BsFillPencilFill, BsPlus } from "react-icons/bs"
import { FaPlus } from "react-icons/fa6";
import ClockingModal from "./ClockingModal";
import { sources, states, GetText } from "../assets/clocking"
import PowerTable from "./PowerTable";

import "./ClockingTable.css"

const ClockingTable = ({ device, totalPowerCallback }) => {
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [clockingData, setClockingData] = React.useState([]);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [powerTable, setPowerTable] = React.useState([]);

  React.useEffect(() => {
    if (device !== null)
      fetchClockData(device)
  }, [device]);

  const fetchClockData = (deviceId) => {
    if (deviceId !== null) {
      fetch("http://127.0.0.1:5000/devices/" + deviceId + "/clocking")
        .then((response) => response.json())
        .then((data) => {
          setClockingData(data);

          fetch("http://127.0.0.1:5000/devices/" + deviceId + "/clocking/consumption")
            .then((response) => response.json())
            .then((data) => {
              const total = (data.total_clock_block_power + data.total_clock_interconnect_power + data.total_pll_power).toFixed(3);
              setPowerTotal(total);
              totalPowerCallback(total);
              setPowerTable([
              [
                "Clocks",
                data.total_clocks_used,
                data.total_clocks_available,
                (data.total_clock_block_power + data.total_clock_interconnect_power).toFixed(3),
                (data.total_clocks_used / data.total_clocks_available * 100).toFixed(2),
              ],
              [
                "PLLs",
                data.total_plls_used,
                data.total_plls_available,
                data.total_pll_power,
                (data.total_plls_used / data.total_plls_available * 100).toFixed(2)
              ]
            ]);
            });
        });
    } else {
    }
  }

  function modifyRow(index, row) {
    const url =
      "http://127.0.0.1:5000/devices/" + device + "/clocking/" + index;
    let data = {};
    data["description"] = row.description;
    data["source"] = parseInt(row.source, 10);
    data["port"] = row.port;
    data["frequency"] = row.frequency;
    data["state"] = parseInt(row.state, 10);
    fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.ok) {
        fetchClockData(device);
      } else {
        //
      }
    });
  }

  const deleteRow = (index) => {
    const url =
      "http://127.0.0.1:5000/devices/" + device + "/clocking/" + index;
    fetch(url, {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
        fetchClockData(device);
      }
    });
  }

  function addRow(newData) {
    if (device === null) return;
    const url = "http://127.0.0.1:5000/devices/" + device + "/clocking";
    let data = {
      enable: true,
      description: newData.description,
      port: newData.port,
      source: parseInt(newData.source, 10),
      frequency: newData.frequency,
      state: parseInt(newData.state)
    };
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.ok) {
        fetchClockData(device);
      }
    });
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null)
      modifyRow(editIndex, newRow);
    else
      addRow(newRow);
  };

  const resourcesHeaders = [
    "Used", "Total", "Power", "%"
  ];

  return <div className="clocking-head">
    <div className="main-block">
      <div className="layout-head">
        <label>FPGA &gt; Clocking</label>
        <button className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
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
              <th>%</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {
              clockingData.map((row, index) => {
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
                      <BsFillPencilFill onClick={() => { setEditIndex(index); setModalOpen(true) }} />
                      <BsFillTrashFill className="delete" onClick={() => deleteRow(index)} />
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
              source: clockingData[editIndex].source,
              description: clockingData[editIndex].description,
              port: clockingData[editIndex].port,
              frequency: clockingData[editIndex].frequency,
              state: clockingData[editIndex].state
            }}
          />
        )}
      </div>
    </div>
    <div className="power-table-wrapper">
      <PowerTable title="Clock power"
        total={powerTotal}
        resourcesHeaders={resourcesHeaders}
        resources={powerTable} /></div>
  </div>
}

export default ClockingTable;