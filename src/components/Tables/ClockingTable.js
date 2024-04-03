import React from 'react';
import { FaPlus } from 'react-icons/fa6';
import ClockingModal from '../ModalWindows/ClockingModal';
import { sources, states } from '../../utils/clocking';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { fixed, GetText } from '../../utils/common';
import { FrequencyCell, PowerCell } from './TableCells';
import { TableBase, Actions } from './TableBase';

import '../style/ComponentTable.css';

function ClockingTable({ device, totalPowerCallback }) {
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [clockingData, setClockingData] = React.useState([]);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [powerTable, setPowerTable] = React.useState([]);

  const mainTableHeader = [
    'Description', 'Source', 'Port/Signal name', 'Frequency', 'Clock Control', 'Fanout',
    'Block Power', 'Intc. Power', '%', 'Action',
  ];

  const fetchClockData = (deviceId) => {
    if (deviceId !== null) {
      server.GET(server.api.fetch(server.Elem.clocking, deviceId), (data) => {
        setClockingData(data);
        server.GET(server.api.consumption(server.Elem.clocking, deviceId), (consumption) => {
          const total = consumption.total_clock_block_power
            + consumption.total_clock_interconnect_power
            + consumption.total_pll_power;
          setPowerTotal(total);
          totalPowerCallback(total);
          setPowerTable([
            [
              'Clocks',
              consumption.total_clocks_used,
              consumption.total_clocks_available,
              `${fixed(consumption.total_clock_block_power + consumption.total_clock_interconnect_power)} W`,
              fixed((consumption.total_clocks_used / consumption.total_clocks_available) * 100, 0),
            ],
            [
              'PLLs',
              consumption.total_plls_used,
              consumption.total_plls_available,
              `${fixed(consumption.total_pll_power)} W`,
              fixed((consumption.total_plls_used / consumption.total_plls_available) * 100, 0),
            ],
          ]);
        });
      });
    }
  };

  React.useEffect(() => {
    if (device !== null) fetchClockData(device);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  function modifyRow(index, row) {
    server.PATCH(
      server.api.index(server.Elem.clocking, device, index),
      row,
      () => fetchClockData(device),
    );
  }

  const deleteRow = (index) => {
    server.DELETE(
      server.api.index(server.Elem.clocking, device, index),
      () => fetchClockData(device),
    );
  };

  function addRow(newData) {
    if (device !== null) {
      server.POST(
        server.api.fetch(server.Elem.clocking, device),
        newData,
        () => fetchClockData(device),
      );
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    else addRow(newRow);
  };

  const resourcesHeaders = [
    'Used', 'Total', 'Power', '%',
  ];

  return (
    <div className="component-table-head">
      <div className="main-block">
        <div className="layout-head">
          <label>FPGA &gt; Clocking</label>
          <button type="button" className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
        </div>
        <div className="power-and-table-wrapper">
          <div className="power-table-wrapper">
            <PowerTable
              title="Clock power"
              total={powerTotal}
              resourcesHeaders={resourcesHeaders}
              resources={powerTable}
            />
          </div>
          <TableBase header={mainTableHeader}>
            {
            clockingData.map((row, index) => (
              <tr key={row.description}>
                <td>{row.description}</td>
                <td>{GetText(row.source, sources)}</td>
                <td>{row.port}</td>
                <FrequencyCell val={row.frequency} />
                <td>{GetText(row.state, states)}</td>
                <td>{row.consumption.fan_out}</td>
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
          <ClockingModal
            closeModal={() => {
              setModalOpen(false);
              setEditIndex(null);
            }}
            onSubmit={handleSubmit}
            defaultValue={(editIndex !== null && clockingData[editIndex]) || {
              source: 0,
              description: '',
              port: '',
              frequency: 1000000,
              state: 1,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default ClockingTable;
