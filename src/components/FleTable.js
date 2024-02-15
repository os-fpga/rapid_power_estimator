import React from "react";
import { BsFillTrashFill } from "react-icons/bs"
import { FaPlus } from "react-icons/fa6";
import { PiNotePencil } from "react-icons/pi";
import {FleModal} from "./FleModal";
import { glitch_factor } from "../assets/fle"
import PowerTable from "./PowerTable";
import { fle } from "./../assets/serverAPI"
import { fixed, GetText, showFreq } from "../assets/common";

import "./style/ComponentTable.css"

const FleTable = ({ device, totalPowerCallback }) => {
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [fleData, setFleData] = React.useState([]);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [powerTable, setPowerTable] = React.useState([]);

  React.useEffect(() => {
    if (device !== null)
      fetchFleData(device)
  }, [device]);

  const fetchFleData = (deviceId) => {
    if (deviceId !== null) {
      fetch(fle.fetch(deviceId))
        .then((response) => response.json())
        .then((data) => {
          setFleData(data);

          fetch(fle.consumption(deviceId))
            .then((response) => response.json())
            .then((data) => {
              const total = data.total_block_power + data.total_interconnect_power;
              setPowerTotal(total);
              totalPowerCallback(total);
              setPowerTable([
              [
                "LUT6",
                data.total_lut6_used,
                data.total_lut6_available,
                fixed(data.total_lut6_used / data.total_lut6_available * 100, 0),
              ],
              [
                "FF/Latch",
                data.total_flip_flop_used,
                data.total_flip_flop_available,
                fixed(data.total_flip_flop_used / data.total_flip_flop_available * 100, 0),
              ]
            ]);
            });
        });
    } else {
    }
  }

  function modifyRow(index, row) {
    let data = {};
    data["name"] = row.name;
    data["lut6"] = parseInt(row.lut6, 10);
    data["flip_flop"] = parseInt(row.flip_flop, 10);
    data["clock"] = row.clock;
    data["toggle_rate"] = row.toggle_rate;
    data["glitch_factor"] = parseInt(row.glitch_factor, 10);
    fetch(fle.index(device, index), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.ok) {
        fetchFleData(device);
      } else {
        //
      }
    });
  }

  const deleteRow = (index) => {
    fetch(fle.index(device, index), {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
        fetchFleData(device);
      }
    });
  }

  function addRow(newData) {
    if (device === null) return;
    let data = {
      enable: true,
      name: newData.name,
      lut6: parseInt(newData.lut6, 10),
      flip_flop: parseInt(newData.flip_flop, 10),
      clock: newData.clock,
      toggle_rate: newData.toggle_rate,
      glitch_factor: parseInt(newData.glitch_factor, 10),
    };
    fetch(fle.fetch(device), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.ok) {
        fetchFleData(device);
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
    "Used", "Available", "%"
  ];

  return <div className="component-table-head">
    <div className="main-block">
      <div className="layout-head">
        <label>FPGA &gt; FLE</label>
        <button className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
      </div>
      <div className="table-wrapper">
        <table className="table-style">
          <thead>
            <tr>
              <th className="expand">Name/Hierarchy</th>
              <th>LUT6</th>
              <th>FF/Latch</th>
              <th>Clock</th>
              <th>Toggle Rate</th>
              <th>Glitch Factor</th>
              <th>Clock Freq</th>
              <th>O/P Sig Rate</th>
              <th>Block Power</th>
              <th>Intc. Power</th>
              <th>%</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {
              fleData.map((row, index) => {
                return <tr key={index}>
                  <td>{row.name}</td>
                  <td>{row.lut6}</td>
                  <td>{row.flip_flop}</td>
                  <td>{row.clock}</td>
                  <td>{row.toggle_rate} %</td>
                  <td>{GetText(row.glitch_factor, glitch_factor)}</td>
                  <td>{showFreq(row.consumption.clock_frequency)}</td>
                  <td>{fixed(row.consumption.output_signal_rate, 1)} MTr/S</td>
                  <td>{fixed(row.consumption.block_power)} W</td>
                  <td>{fixed(row.consumption.interconnect_power)} W</td>
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
          <FleModal
            closeModal={() => {
              setModalOpen(false);
              setEditIndex(null);
            }}
            onSubmit={handleSubmit}
            defaultValue={editIndex !== null && {
              name: fleData[editIndex].name,
              lut6: fleData[editIndex].lut6,
              flip_flop: fleData[editIndex].flip_flop,
              clock: fleData[editIndex].clock,
              toggle_rate: fleData[editIndex].toggle_rate,
              glitch_factor: fleData[editIndex].glitch_factor,
            } || {
              name: '',
              lut6: 0,
              flip_flop: 0,
              clock: '',
              toggle_rate: 0,
              glitch_factor: 0,
            }}
          />
        )}
      </div>
    </div>
    <div className="power-table-wrapper">
      <PowerTable title="FLE power"
        total={powerTotal}
        resourcesHeaders={resourcesHeaders}
        resources={powerTable} /></div>
  </div>
}

export default FleTable;