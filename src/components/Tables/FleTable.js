import React from 'react';
import { FaPlus } from 'react-icons/fa6';
import FleModal from '../ModalWindows/FleModal';
import glitchFactor from '../../utils/fle';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { fixed, GetText } from '../../utils/common';
import { PercentsCell, FrequencyCell, PowerCell } from './TableCells';
import { TableBase, Actions } from './TableBase';

import '../style/ComponentTable.css';

function FleTable({ device, totalPowerCallback }) {
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [fleData, setFleData] = React.useState([]);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [powerTable, setPowerTable] = React.useState([]);

  const fetchFleData = React.useCallback((deviceId) => {
    if (deviceId !== null) {
      server.GET(server.api.fetch(server.Elem.fle, deviceId), (data) => {
        setFleData(data);
        server.GET(server.api.consumption(server.Elem.fle, deviceId), (consumption) => {
          const total = consumption.total_block_power + consumption.total_interconnect_power;
          setPowerTotal(total);
          totalPowerCallback(total);
          setPowerTable([
            [
              'LUT6',
              consumption.total_lut6_used,
              consumption.total_lut6_available,
              fixed((consumption.total_lut6_used / consumption.total_lut6_available) * 100, 0),
            ],
            [
              'FF/Latch',
              consumption.total_flip_flop_used,
              consumption.total_flip_flop_available,
              fixed((consumption.total_flip_flop_used / consumption.total_flip_flop_available)
                * 100, 0),
            ],
          ]);
        });
      });
    }
  }, [totalPowerCallback]);

  React.useEffect(() => {
    if (device !== null) fetchFleData(device);
  }, [device, fetchFleData]);

  function modifyRow(index, row) {
    server.PATCH(
      server.api.index(server.Elem.fle, device, index),
      row,
      () => fetchFleData(device),
    );
  }

  const deleteRow = (index) => {
    server.DELETE(
      server.api.index(server.Elem.fle, device, index),
      () => fetchFleData(device),
    );
  };

  function addRow(newData) {
    if (device !== null) {
      server.POST(
        server.api.fetch(server.Elem.fle, device),
        newData,
        () => fetchFleData(device),
      );
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    else addRow(newRow);
  };

  const resourcesHeaders = [
    'Used', 'Total', '%',
  ];

  const mainTableHeader = [
    'Name/Hierarchy', 'LUT6', 'FF/Latch', 'Clock', 'Toggle Rate', 'Glitch Factor', 'Clock Enable',
    'Clock Freq', 'O/P Sig Rate', 'Block Power', 'Intc. Power', '%', 'Action',
  ];

  return (
    <div className="component-table-head">
      <div className="main-block">
        <div className="layout-head">
          <label>FPGA &gt; FLE</label>
          <button type="button" className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
        </div>
        <div className="power-and-table-wrapper">
          <div className="power-table-wrapper">
            <PowerTable
              title="FLE power"
              total={powerTotal}
              resourcesHeaders={resourcesHeaders}
              resources={powerTable}
            />
          </div>
          <TableBase header={mainTableHeader}>
            {
            fleData.map((row, index) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.lut6}</td>
                <td>{row.flip_flop}</td>
                <td>{row.clock}</td>
                <PercentsCell val={row.toggle_rate} precition={1} />
                <td>{GetText(row.glitch_factor, glitchFactor)}</td>
                <PercentsCell val={row.clock_enable_rate} />
                <FrequencyCell val={row.consumption.clock_frequency} />
                <td>
                  {fixed(row.consumption.output_signal_rate, 1)}
                  {' MTr/S'}
                </td>
                <PowerCell val={row.consumption.block_power} />
                <PowerCell val={row.consumption.interconnect_power} />
                <td>
                  {fixed(row.consumption.percentage, 0)}
                  {' %'}
                </td>
                <Actions
                  onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                  onDeleteClick={() => deleteRow(index)}
                />
              </tr>
            ))
          }
          </TableBase>
        </div>
        {modalOpen && (
          <FleModal
            closeModal={() => {
              setModalOpen(false);
              setEditIndex(null);
            }}
            onSubmit={handleSubmit}
            defaultValue={(editIndex !== null && fleData[editIndex]) || {
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
    </div>
  );
}

export default FleTable;
