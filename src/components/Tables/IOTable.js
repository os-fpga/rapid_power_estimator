import React from 'react';
import IOModal from '../ModalWindows/IOModal';
import IOPowerTable from './IOPowerTable';
import * as server from '../../utils/serverAPI';
import { fixed } from '../../utils/common';
import { PercentsCell, SelectionCell, PowerCell } from './TableCells';
import { TableBase, Actions } from './TableBase';
import { ComponentLabel } from '../ComponentsLib';

import '../style/ComponentTable.css';
import {
  direction,
  ioStandard,
  driveStrength,
  slewRate,
  differentialTermination,
  ioDataType,
  synchronization,
  ioPullUpDown,
  bankType,
} from '../../utils/io';

function IOTable({ device, totalPowerCallback }) {
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [ioData, setIoData] = React.useState([]);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [powerTable, setPowerTable] = React.useState(null);

  const defaultPowerData = {
    io_usage: [
      {
        total_banks_available: 0,
        total_io_available: 0,
        type: 'HP',
        usage: [
          {
            banks_used: 0,
            io_available: 0,
            io_used: 0,
            voltage: 1.2,
          },
          {
            banks_used: 0,
            io_available: 0,
            io_used: 0,
            voltage: 1.5,
          },
          {
            banks_used: 0,
            io_available: 0,
            io_used: 0,
            voltage: 1.8,
          },
        ],
      },
      {
        total_banks_available: 0,
        total_io_available: 0,
        type: 'HR',
        usage: [
          {
            banks_used: 0,
            io_available: 0,
            io_used: 0,
            voltage: 1.8,
          },
          {
            banks_used: 0,
            io_available: 0,
            io_used: 0,
            voltage: 2.5,
          },
          {
            banks_used: 0,
            io_available: 0,
            io_used: 0,
            voltage: 3.3,
          },
        ],
      },
    ],
  };

  const defaultIOData = {
    name: '',
    bus_width: 0,
    direction: 0,
    io_standard: 0,
    drive_strength: 2,
    clock: '',
    toggle_rate: 0,
    duty_cycle: 0,
    slew_rate: 0,
    differential_termination: 0,
    io_pull_up_down: 0,
    io_data_type: 0,
    input_enable_rate: 0,
    output_enable_rate: 0,
    synchronization: 0,
  };

  const fetchIoData = (deviceId) => {
    if (deviceId !== null) {
      server.GET(server.api.fetch(server.Elem.io, deviceId), (data) => {
        setIoData(data);
        server.GET(server.api.consumption(server.Elem.io, deviceId), (power) => {
          const total = power.total_block_power + power.total_interconnect_power
            + power.total_on_die_termination_power;
          setPowerTotal(total);
          totalPowerCallback(total);
          setPowerTable(power);
        });
      });
    }
  };
  React.useEffect(() => {
    if (device !== null) fetchIoData(device);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  function modifyRow(index, row) {
    server.PATCH(
      server.api.index(server.Elem.io, device, index),
      row,
      () => fetchIoData(device),
    );
  }

  const deleteRow = (index) => {
    server.DELETE(
      server.api.index(server.Elem.io, device, index),
      () => fetchIoData(device),
    );
  };

  function addRow(newData) {
    if (device !== null) {
      server.POST(server.api.fetch(server.Elem.io, device), newData, () => fetchIoData(device));
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    else addRow(newRow);
  };

  const mainTableHeader = [
    'Action', 'RTL Port Name', 'Bus', 'Dir', 'IO Standard', 'Drive Strength', 'Slew Rate', 'Differential Termination', 'Data Type',
    'Clock', 'Toggle Rate', 'Duty Cycle', 'Sync', 'Input En', 'Output En', 'Pullup / Pulldown', 'Bank Type', 'Bank #',
    'VCCIO', 'Signal Rate', 'Block Power', 'Intc. Power', '%',
  ];

  return (
    <div className="component-table-head main-border">
      <div className="main-block">
        <ComponentLabel name="IO" />
        <div className="power-and-table-wrapper">
          <div className="power-table-wrapper">
            <IOPowerTable
              title="IO power"
              total={powerTotal}
              resources={powerTable !== null ? powerTable : defaultPowerData}
            />
          </div>
          <TableBase
            header={mainTableHeader}
            disabled={device === null}
            onClick={() => setModalOpen(true)}
          >
            {
            ioData.map((row, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <tr key={index}>
                <Actions
                  onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                  onDeleteClick={() => deleteRow(index)}
                />
                <td>{row.name}</td>
                <td>{row.bus_width}</td>
                <SelectionCell val={row.direction} values={direction} />
                <SelectionCell val={row.io_standard} values={ioStandard} />
                <SelectionCell val={row.drive_strength} values={driveStrength} />
                <SelectionCell val={row.slew_rate} values={slewRate} />
                <SelectionCell
                  val={row.differential_termination}
                  values={differentialTermination}
                />
                <SelectionCell val={row.io_data_type} values={ioDataType} />
                <td>{row.clock}</td>
                <PercentsCell val={row.toggle_rate} precition={1} />
                <PercentsCell val={row.duty_cycle} />
                <SelectionCell val={row.synchronization} values={synchronization} />
                <PercentsCell val={row.input_enable_rate} />
                <PercentsCell val={row.output_enable_rate} />
                <SelectionCell val={row.io_pull_up_down} values={ioPullUpDown} />
                <SelectionCell val={row.consumption.bank_type} values={bankType} />
                <td>{row.consumption.bank_number}</td>
                <td>{row.consumption.vccio_voltage}</td>
                <PercentsCell val={row.consumption.io_signal_rate} />
                <PowerCell val={row.consumption.block_power} />
                <PowerCell val={row.consumption.interconnect_power} />
                <td>
                  {fixed(row.consumption.percentage, 0)}
                  {' %'}
                </td>
              </tr>
            ))
          }
          </TableBase>
        </div>
        {modalOpen && (
          <IOModal
            closeModal={() => {
              setModalOpen(false);
              setEditIndex(null);
            }}
            onSubmit={handleSubmit}
            defaultValue={(editIndex !== null && ioData[editIndex]) || defaultIOData}
          />
        )}
      </div>
    </div>
  );
}

export default IOTable;
