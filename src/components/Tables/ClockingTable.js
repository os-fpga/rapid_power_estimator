import React from "react";
import { BsFillTrashFill } from "react-icons/bs"
import { FaPlus } from "react-icons/fa6";
import { PiNotePencil } from "react-icons/pi";
import ClockingModal from "../ModalWindows/ClockingModal";
import { sources, states } from "../../utils/clocking"
import PowerTable from "./PowerTable";
import { clocking } from "../../utils/serverAPI"
import { fixed, GetText } from "../../utils/common";
import { FrequencyCell, PowerCell } from "./TableCells"

import "./../style/ComponentTable.css"

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
      fetch(clocking.fetch(deviceId))
        .then((response) => response.json())
        .then((data) => {
          setClockingData(data);

          fetch(clocking.consumption(deviceId))
            .then((response) => response.json())
            .then((data) => {
              const total = data.total_clock_block_power + data.total_clock_interconnect_power + data.total_pll_power;
              setPowerTotal(total);
              totalPowerCallback(total);
              setPowerTable([
                [
                  "Clocks",
                  data.total_clocks_used,
                  data.total_clocks_available,
                  fixed(data.total_clock_block_power + data.total_clock_interconnect_power) + ' W',
                  fixed(data.total_clocks_used / data.total_clocks_available * 100, 0),
                ],
                [
                  "PLLs",
                  data.total_plls_used,
                  data.total_plls_available,
                  fixed(data.total_pll_power) + ' W',
                  fixed(data.total_plls_used / data.total_plls_available * 100, 0)
                ]
              ]);
            });
        });
    } else {
    }
  }

  function modifyRow(index, row) {
    fetch(clocking.index(device, index), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    }).then((response) => {
      if (response.ok) {
        fetchClockData(device);
      } else {
        //
      }
    });
  }

  const deleteRow = (index) => {
    fetch(clocking.index(device, index), {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
        fetchClockData(device);
      }
    });
  }

  function addRow(newData) {
    if (device === null) return;
    fetch(clocking.fetch(device), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
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

  return <div className="component-table-head">
    <div className="main-block">
      <div className="layout-head">
        <label>FPGA &gt; Clocking</label>
        <button className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
      </div>
      <div className="table-wrapper">
        <table className="table-style">
          <thead>
            <tr>
              <th>Description</th>
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
                  <FrequencyCell val={row.frequency} />
                  <td>{GetText(row.state, states)}</td>
                  <td>{row.consumption.fan_out}</td>
                  <PowerCell val={row.consumption.block_power} />
                  <PowerCell val={row.consumption.interconnect_power} />
                  <td>{fixed(row.consumption.percentage, 0)} %</td>
                  <td>
                    <span className="actions">
                      <PiNotePencil className="edit" onClick={() => { setEditIndex(index); setModalOpen(true) }} />
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
            defaultValue={editIndex !== null && clockingData[editIndex] ||
            {
              source: 0,
              description: '',
              port: '',
              frequency: 1000000,
              state: 1,
            }
            }
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