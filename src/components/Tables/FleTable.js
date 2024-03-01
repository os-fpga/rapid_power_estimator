import React from "react";
import { FaPlus } from "react-icons/fa6";
import FleModal from "../ModalWindows/FleModal";
import { glitch_factor } from "../../utils/fle"
import PowerTable from "./PowerTable";
import * as server from "../../utils/serverAPI"
import { fixed, GetText } from "../../utils/common";
import { PercentsCell, FrequencyCell, PowerCell } from "./TableCells"
import { TableBase, Actions } from "./TableBase";

import "./../style/ComponentTable.css"

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
      server.GET(server.api.fetch(server.Elem.fle, deviceId), (data) => {
        setFleData(data);
        server.GET(server.api.consumption(server.Elem.fle, deviceId), (data) => {
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
        })
      })
    } else {
    }
  }

  function modifyRow(index, row) {
    server.PATCH(server.api.index(server.Elem.fle, device, index), row,
      () => fetchFleData(device))
  }

  const deleteRow = (index) => {
    server.DELETE(server.api.index(server.Elem.fle, device, index),
      () => fetchFleData(device))
  }

  function addRow(newData) {
    if (device !== null) {
      server.POST(server.api.fetch(server.Elem.fle, device), newData,
        () => fetchFleData(device))
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null)
      modifyRow(editIndex, newRow);
    else
      addRow(newRow);
  };

  const resourcesHeaders = [
    "Used", "Total", "%"
  ];

  const mainTableHeader = [
    "Name/Hierarchy", "LUT6", "FF/Latch", "Clock", "Toggle Rate", "Glitch Factor", "Clock Enable",
    "Clock Freq", "O/P Sig Rate", "Block Power", "Intc. Power", "%", "Action"
  ]

  return <div className="component-table-head">
    <div className="main-block">
      <div className="layout-head">
        <label>FPGA &gt; FLE</label>
        <button className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
      </div>
      <TableBase
        header={mainTableHeader}
        data={
          fleData.map((row, index) => {
            return <tr key={index}>
              <td>{row.name}</td>
              <td>{row.lut6}</td>
              <td>{row.flip_flop}</td>
              <td>{row.clock}</td>
              <PercentsCell val={row.toggle_rate} precition={1} />
              <td>{GetText(row.glitch_factor, glitch_factor)}</td>
              <PercentsCell val={row.clock_enable_rate} />
              <FrequencyCell val={row.consumption.clock_frequency} />
              <td>{fixed(row.consumption.output_signal_rate, 1)} MTr/S</td>
              <PowerCell val={row.consumption.block_power} />
              <PowerCell val={row.consumption.interconnect_power} />
              <td>{fixed(row.consumption.percentage, 0)} %</td>
              <Actions onEditClick={() => { setEditIndex(index); setModalOpen(true) }} onDeleteClick={() => deleteRow(index)} />
            </tr>
          })
        }
      />
      {modalOpen && (
        <FleModal
          closeModal={() => {
            setModalOpen(false);
            setEditIndex(null);
          }}
          onSubmit={handleSubmit}
          defaultValue={editIndex !== null && fleData[editIndex] || {
            name: '',
            lut6: 0,
            flip_flop: 0,
            clock: '',
            toggle_rate: 0,
            glitch_factor: 0,
            clock_enable_rate: 0.0,
          }}
        />
      )}
    </div>
    <div className="power-table-wrapper">
      <PowerTable title="FLE power"
        total={powerTotal}
        resourcesHeaders={resourcesHeaders}
        resources={powerTable} />
    </div>
  </div>
}

export default FleTable;
