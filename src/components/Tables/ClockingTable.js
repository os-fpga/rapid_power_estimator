import React from 'react';
import ClockingModal from '../ModalWindows/ClockingModal';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { fixed, GetText } from '../../utils/common';
import { FrequencyCell, PowerCell } from './TableCells';
import {
  TableBase, Actions, EnableState, StatusColumn,
} from './TableBase';
import { ComponentLabel } from '../ComponentsLib';
import { useClockSelection } from '../../ClockSelectionProvider';
import { useGlobalState } from '../../GlobalStateProvider';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';

import '../style/ComponentTable.css';

function ClockingTable({ device }) {
  const [dev, setDev] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [clockingData, setClockingData] = React.useState([]);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [powerTable, setPowerTable] = React.useState([]);
  const { setClocks } = useClockSelection();
  const { updateGlobalState, GetOptions } = useGlobalState();
  const { updateTotalPower } = useSocTotalPower();

  const states = GetOptions('Clock_State');
  const sources = GetOptions('Source');

  const mainTableHeader = [
    '', 'Action', 'En', 'Description', 'Source', 'Port/Signal name', 'Frequency', 'Clock Control', 'Fanout',
    'Block Power', 'Intc. Power', '%',
  ];

  const fetchClockData = (deviceId) => {
    if (deviceId !== null) {
      server.GET(server.api.fetch(server.Elem.clocking, deviceId), (data) => {
        setClockingData(data);
        setClocks(data.map((item) => item.port));
        server.GET(server.api.consumption(server.Elem.clocking, deviceId), (consumption) => {
          const total = consumption.total_clock_block_power
            + consumption.total_clock_interconnect_power
            + consumption.total_pll_power;
          setPowerTotal(total);
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

  if (dev !== device) {
    setDev(device);
    if (device !== null) fetchClockData(device);
  }

  function modifyDataHandler() {
    fetchClockData(device);
    updateGlobalState(device);
    updateTotalPower(device);
  }

  function modifyRow(index, row) {
    server.PATCH(
      server.api.index(server.Elem.clocking, device, index),
      row,
      modifyDataHandler,
    );
  }

  const deleteRow = (index) => {
    server.DELETE(
      server.api.index(server.Elem.clocking, device, index),
      modifyDataHandler,
    );
  };

  function addRow(newData) {
    if (device !== null) {
      server.POST(
        server.api.fetch(server.Elem.clocking, device),
        newData,
        modifyDataHandler,
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

  function enableChanged(index, state) {
    const data = {
      enable: state,
    };
    server.PATCH(
      server.api.index(server.Elem.clocking, device, index),
      data,
      modifyDataHandler,
    );
  }

  const title = 'Clocking';

  return (
    <div className="component-table-head">
      <ComponentLabel name={title} />
      <div className="power-and-table-wrapper">
        <div className="power-table-wrapper">
          <PowerTable
            title="Clock power"
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
          clockingData.map((row, index) => (
            <tr key={row.description}>
              <StatusColumn messages={row.consumption.messages} />
              <Actions
                onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                onDeleteClick={() => deleteRow(index)}
              />
              <EnableState
                isChecked={row.enable}
                checkHandler={(state) => enableChanged(index, state)}
              />
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
            </tr>
          ))
        }
        </TableBase>
      </div>
      {modalOpen && (
      <ClockingModal
        title={title}
        closeModal={() => {
          setModalOpen(false);
          setEditIndex(null);
        }}
        onSubmit={handleSubmit}
        defaultValue={(editIndex !== null && clockingData[editIndex]) || {
          enable: true,
          source: 0,
          description: '',
          port: '',
          frequency: 1000000,
          state: 1,
        }}
      />
      )}
    </div>
  );
}

export default ClockingTable;
