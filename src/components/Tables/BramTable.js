import React from 'react';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { fixed, GetText } from '../../utils/common';
import BramModal from '../ModalWindows/BramModal';
import bramType from '../../utils/bram';
import { PercentsCell, FrequencyCell, PowerCell } from './TableCells';
import {
  TableBase, Actions, StatusColumn, EnableState,
} from './TableBase';
import { ComponentLabel } from '../ComponentsLib';
import { useClockSelection } from '../../ClockSelectionProvider';
import { useGlobalState } from '../../GlobalStateProvider';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';

import '../style/ComponentTable.css';

function BramTable({ device }) {
  const [dev, setDev] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [bramData, setBramData] = React.useState([]);
  const [bramWindowData, setBramWindowData] = React.useState([]);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [powerTable, setPowerTable] = React.useState([]);
  const { defaultClock } = useClockSelection();
  const { updateGlobalState } = useGlobalState();
  const { updateTotalPower } = useSocTotalPower();

  const fetchBramData = (deviceId) => {
    if (deviceId !== null) {
      server.GET(server.api.fetch(server.Elem.bram, deviceId), (data) => {
        setBramData(data);
        const newBramWindowData = [];
        data.forEach((item) => {
          newBramWindowData.push({
            enable: item.enable,
            name: item.name,
            type: item.type,
            bram_used: item.bram_used,
            port_a_clock: item.port_a.clock,
            port_a_width: item.port_a.width,
            port_b_clock: item.port_b.clock,
            port_b_width: item.port_b.width,
            port_a_write_enable_rate: item.port_a.write_enable_rate,
            port_a_read_enable_rate: item.port_a.read_enable_rate,
            port_a_toggle_rate: item.port_a.toggle_rate,
            port_b_write_enable_rate: item.port_b.write_enable_rate,
            port_b_read_enable_rate: item.port_b.read_enable_rate,
            port_b_toggle_rate: item.port_b.toggle_rate,
          });
        });
        setBramWindowData(newBramWindowData);
        server.GET(server.api.consumption(server.Elem.bram, deviceId), (consumption) => {
          const total = consumption.total_bram_block_power
            + consumption.total_bram_interconnect_power;
          setPowerTotal(total);
          setPowerTable([
            [
              '18K BRAM',
              consumption.total_18k_bram_used,
              consumption.total_18k_bram_available,
              fixed((consumption.total_18k_bram_used / consumption.total_18k_bram_available)
                * 100, 0),
            ],
            [
              '36K BRAM',
              consumption.total_36k_bram_used,
              consumption.total_36k_bram_available,
              fixed((consumption.total_36k_bram_used / consumption.total_36k_bram_available)
                * 100, 0),
            ],
          ]);
        });
      });
    }
  };

  if (dev !== device) {
    setDev(device);
    if (device !== null) fetchBramData(device);
  }

  function sendData(row) {
    const data = {};
    data.enable = row.enable;
    data.name = row.name;
    data.type = parseInt(row.type, 10);
    data.bram_used = parseInt(row.bram_used, 10);
    const portA = {
      width: parseInt(row.port_a_width, 10),
      clock: row.port_a_clock,
      write_enable_rate: row.port_a_write_enable_rate,
      read_enable_rate: row.port_a_read_enable_rate,
      toggle_rate: row.port_a_toggle_rate,
    };
    const portB = {
      width: parseInt(row.port_b_width, 10),
      clock: row.port_b_clock,
      write_enable_rate: row.port_b_write_enable_rate,
      read_enable_rate: row.port_b_read_enable_rate,
      toggle_rate: row.port_b_toggle_rate,
    };
    data.port_a = portA;
    data.port_b = portB;
    return data;
  }

  function modifyDataHandler() {
    fetchBramData(device);
    updateGlobalState(device);
    updateTotalPower(device);
  }

  function modifyRow(index, row) {
    server.PATCH(
      server.api.index(server.Elem.bram, device, index),
      sendData(row),
      modifyDataHandler,
    );
  }

  const deleteRow = (index) => {
    server.DELETE(
      server.api.index(server.Elem.bram, device, index),
      modifyDataHandler,
    );
  };

  function addRow(newData) {
    if (device !== null) {
      server.POST(
        server.api.fetch(server.Elem.bram, device),
        sendData(newData),
        modifyDataHandler,
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
    '', 'Action', 'En', 'Name/Hierarchy', 'BRAM Type', 'Used', 'Port', 'Clock', 'Width', 'Write En', 'Read En',
    'Toggle Rate', 'Clock Freq', 'RAM Depth', 'O/P Sig Rate', 'Block Power', 'Intc. Power', '%',
  ];

  function enableChanged(index, state) {
    const data = {
      enable: state,
    };
    server.PATCH(
      server.api.index(server.Elem.bram, device, index),
      data,
      modifyDataHandler,
    );
  }

  const title = 'BRAM';

  return (
    <div className="component-table-head">
      <ComponentLabel name={title} />
      <div className="power-and-table-wrapper">
        <div className="power-table-wrapper">
          <PowerTable
            title="BRAM power"
            total={powerTotal}
            resourcesHeaders={resourcesHeaders}
            resources={powerTable}
          />
        </div>
        <TableBase
          header={mainTableHeader}
          disabled={device === null}
          onClick={() => setModalOpen(true)}
        >
          {
          bramData.map((row, index) => (
            <React.Fragment key={row.name}>
              <tr>
                <StatusColumn messages={row.consumption.messages} rowSpan={2} />
                <Actions
                  rowSpan={2}
                  onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                  onDeleteClick={() => deleteRow(index)}
                />
                <EnableState
                  rowSpan={2}
                  isChecked={row.enable}
                  checkHandler={(state) => enableChanged(index, state)}
                />
                <td rowSpan={2}>{row.name}</td>
                <td rowSpan={2}>{GetText(row.type, bramType)}</td>
                <td rowSpan={2}>{row.bram_used}</td>
                <td>A - Write</td>
                <td>{row.port_a.clock}</td>
                <td>{row.port_a.width}</td>
                <PercentsCell val={row.port_a.write_enable_rate} />
                <PercentsCell val={row.port_a.read_enable_rate} />
                <PercentsCell val={row.port_a.toggle_rate} precition={1} />
                <FrequencyCell val={row.consumption.port_a.clock_frequency} />
                <td>
                  {fixed(row.consumption.port_a.output_signal_rate, 1)}
                  {' MTr/S'}
                </td>
                <td>{row.consumption.port_a.ram_depth}</td>
                <PowerCell rowSpan={2} val={row.consumption.block_power} />
                <PowerCell rowSpan={2} val={row.consumption.interconnect_power} />
                <td rowSpan={2}>
                  {fixed(row.consumption.percentage, 0)}
                  {' %'}
                </td>
              </tr>
              <tr>
                <td>B - Read</td>
                <td>{row.port_b.clock}</td>
                <td>{row.port_b.width}</td>
                <PercentsCell val={row.port_b.write_enable_rate} />
                <PercentsCell val={row.port_b.read_enable_rate} />
                <PercentsCell val={row.port_b.toggle_rate} precition={1} />
                <FrequencyCell val={row.consumption.port_b.clock_frequency} />
                <td>
                  {fixed(row.consumption.port_b.output_signal_rate, 1)}
                  {' MTr/S'}
                </td>
                <td>{row.consumption.port_b.ram_depth}</td>
              </tr>
            </React.Fragment>
          ))
        }
        </TableBase>
      </div>
      {modalOpen && (
      <BramModal
        title={title}
        closeModal={() => {
          setModalOpen(false);
          setEditIndex(null);
        }}
        onSubmit={handleSubmit}
        defaultValue={(editIndex !== null && bramWindowData[editIndex]) || {
          enable: true,
          name: '',
          type: 0,
          bram_used: 0,
          port_a_clock: defaultClock(),
          port_a_width: 0,
          port_b_clock: defaultClock(),
          port_b_width: 0,
          port_a_write_enable_rate: 0,
          port_a_read_enable_rate: 0,
          port_a_toggle_rate: 0,
          port_b_write_enable_rate: 0,
          port_b_read_enable_rate: 0,
          port_b_toggle_rate: 0,
        }}
      />
      )}
    </div>
  );
}

export default BramTable;
