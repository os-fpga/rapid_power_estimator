import React from 'react';
import IOModal from '../ModalWindows/IOModal';
import IOPowerTable from './IOPowerTable';
import * as server from '../../utils/serverAPI';
import { fixed } from '../../utils/common';
import { PercentsCell, SelectionCell, PowerCell } from './TableCells';
import {
  TableBase, Actions, StatusColumn, EnableState,
} from './TableBase';
import { ComponentLabel } from '../ComponentsLib';
import { useClockSelection } from '../../ClockSelectionProvider';
import { useGlobalState } from '../../GlobalStateProvider';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';

import '../style/ComponentTable.css';

function IOTable({ device, update, notify }) {
  const [dev, setDev] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [ioData, setIoData] = React.useState([]);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [powerTable, setPowerTable] = React.useState(null);
  const { defaultClock } = useClockSelection();
  const { updateGlobalState, GetOptions } = useGlobalState();
  const { updateTotalPower } = useSocTotalPower();
  const direction = GetOptions('IO_Direction');
  const ioStandard = GetOptions('IO_Standard');
  const driveStrength = GetOptions('IO_Drive_Strength');
  const slewRate = GetOptions('IO_Slew_Rate');
  const differentialTermination = GetOptions('IO_differential_termination');
  const ioDataType = GetOptions('IO_Data_Type');
  const synchronization = GetOptions('IO_Synchronization');
  const ioPullUpDown = GetOptions('IO_Pull_up_down');
  const bankType = GetOptions('IO_BankType');

  const defaultPowerData = {
    io_usage: [
      {
        total_banks_available: 0,
        total_io_available: 0,
        type: 'HP',
        percentage: 0,
        usage: [
          {
            banks_used: 0,
            io_available: 0,
            io_used: 0,
            voltage: 1.2,
            error: false,
          },
          {
            banks_used: 0,
            io_available: 0,
            io_used: 0,
            voltage: 1.5,
            error: false,
          },
          {
            banks_used: 0,
            io_available: 0,
            io_used: 0,
            voltage: 1.8,
            error: false,
          },
        ],
      },
      {
        total_banks_available: 0,
        total_io_available: 0,
        type: 'HR',
        percentage: 0,
        usage: [
          {
            banks_used: 0,
            io_available: 0,
            io_used: 0,
            voltage: 1.8,
            error: false,
          },
          {
            banks_used: 0,
            io_available: 0,
            io_used: 0,
            voltage: 2.5,
            error: false,
          },
          {
            banks_used: 0,
            io_available: 0,
            io_used: 0,
            voltage: 3.3,
            error: false,
          },
        ],
      },
    ],
  };

  const defaultIOData = {
    enable: true,
    name: '',
    bus_width: 0,
    direction: 0,
    io_standard: 0,
    drive_strength: 2,
    clock: defaultClock(),
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
    if (deviceId !== '') {
      server.GET(server.api.fetch(server.Elem.io, deviceId), (data) => {
        setIoData(data);
        server.GET(server.api.consumption(server.Elem.io, deviceId), (power) => {
          const total = power.total_block_power + power.total_interconnect_power
            + power.total_on_die_termination_power;
          setPowerTotal(total);
          setPowerTable(power);
        });
      });
    }
  };

  if (dev !== device) {
    setDev(device);
    if (device !== '') fetchIoData(device);
    else {
      setIoData([]);
      setPowerTable(null);
    }
  }

  React.useEffect(() => {
    if (update && device !== '') fetchIoData(device);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update]);

  function modifyDataHandler() {
    fetchIoData(device);
    updateGlobalState(device);
    updateTotalPower(device);
    notify();
  }
  function modifyRow(index, row) {
    server.PATCH(
      server.api.index(server.Elem.io, device, index),
      row,
      modifyDataHandler,
    );
  }

  const deleteRow = (index) => {
    server.DELETE(
      server.api.index(server.Elem.io, device, index),
      modifyDataHandler,
    );
  };

  function addRow(newData) {
    if (device !== '') {
      server.POST(server.api.fetch(server.Elem.io, device), newData, modifyDataHandler);
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    else addRow(newRow);
  };

  const mainTableHeader = [
    '', 'Action', 'En', 'RTL Port Name', 'Bus', 'Dir', 'IO Standard', 'Drive Strength', 'Slew Rate', 'Differential Termination', 'Data Type',
    'Clock', 'Toggle Rate', 'Duty Cycle', 'Sync', 'Input En', 'Output En', 'Pullup / Pulldown', 'Bank Type', 'Bank #',
    'VCCIO', 'Signal Rate', 'Block Power', 'Intc. Power', '%',
  ];

  function enableChanged(index, state) {
    const data = {
      enable: state,
    };
    server.PATCH(
      server.api.index(server.Elem.io, device, index),
      data,
      modifyDataHandler,
    );
  }

  const title = 'IO';

  return (
    <div className="component-table-head">
      <ComponentLabel name={title} />
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
          disabled={device === ''}
          onClick={() => setModalOpen(true)}
        >
          {
          ioData.map((row, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <tr key={index}>
              <StatusColumn messages={row.consumption.messages} />
              <Actions
                onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                onDeleteClick={() => deleteRow(index)}
              />
              <EnableState
                isChecked={row.enable}
                checkHandler={(state) => enableChanged(index, state)}
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
        title={title}
        closeModal={() => {
          setModalOpen(false);
          setEditIndex(null);
        }}
        onSubmit={handleSubmit}
        defaultValue={(editIndex !== null && ioData[editIndex]) || defaultIOData}
      />
      )}
    </div>
  );
}

export default IOTable;
