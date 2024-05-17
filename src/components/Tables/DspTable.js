import React from 'react';
import DspModal from '../ModalWindows/DspModal';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { fixed, GetText } from '../../utils/common';
import { dspMode, pipelining } from '../../utils/dsp';
import { PercentsCell, FrequencyCell, PowerCell } from './TableCells';
import {
  TableBase, Actions, StatusColumn, EnableState,
} from './TableBase';
import { ComponentLabel } from '../ComponentsLib';
import { useClockSelection } from '../../ClockSelectionProvider';
import { useGlobalState } from '../../GlobalStateProvider';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';

import '../style/ComponentTable.css';

function DspTable({ device }) {
  const [dev, setDev] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [dspData, setDspData] = React.useState([]);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [powerTable, setPowerTable] = React.useState([]);
  const { defaultClock } = useClockSelection();
  const { updateGlobalState } = useGlobalState();
  const { updateTotalPower } = useSocTotalPower();

  const fetchDspData = (deviceId) => {
    if (deviceId !== null) {
      server.GET(server.api.fetch(server.Elem.dsp, deviceId), (data) => {
        setDspData(data);
        server.GET(server.api.consumption(server.Elem.dsp, deviceId), (consumption) => {
          const total = consumption.total_dsp_block_power
            + consumption.total_dsp_interconnect_power;
          setPowerTotal(total);
          setPowerTable([
            [
              'DSP Blocks',
              consumption.total_dsp_blocks_used,
              consumption.total_dsp_blocks_available,
              fixed((consumption.total_dsp_blocks_used / consumption.total_dsp_blocks_available)
                * 100, 0),
            ],
          ]);
        });
      });
    }
  };

  if (dev !== device) {
    setDev(device);
    if (device !== null) fetchDspData(device);
  }

  function modifyDataHandler() {
    fetchDspData(device);
    updateGlobalState(device);
    updateTotalPower(device);
  }

  function modifyRow(index, row) {
    server.PATCH(
      server.api.index(server.Elem.dsp, device, index),
      row,
      modifyDataHandler,
    );
  }

  const deleteRow = (index) => {
    server.DELETE(
      server.api.index(server.Elem.dsp, device, index),
      modifyDataHandler,
    );
  };

  function addRow(newData) {
    if (device !== null) {
      server.POST(
        server.api.fetch(server.Elem.dsp, device),
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
    'Used', 'Total', '%',
  ];

  const mainTableHeader = [
    '', 'Action', 'En', 'Name/Hierarchy', 'XX', 'DSP Mode', { className: 'no-wrap', text: 'A-W' }, { className: 'no-wrap', text: 'B-W' },
    'Clock', 'Pipeline', 'T-Rate',
    'Block Used', 'Clock Freq', 'O/P Sig Rate', 'Block Power', 'Intc. Power', '%',
  ];

  function enableChanged(index, state) {
    const data = {
      enable: state,
    };
    server.PATCH(
      server.api.index(server.Elem.dsp, device, index),
      data,
      modifyDataHandler,
    );
  }

  const title = 'DSP';

  return (
    <div className="component-table-head">
      <ComponentLabel name={title} />
      <div className="power-and-table-wrapper">
        <div className="power-table-wrapper">
          <PowerTable
            title="DSP power"
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
          dspData.map((row, index) => (
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
              <td>{row.number_of_multipliers}</td>
              <td>{GetText(row.dsp_mode, dspMode)}</td>
              <td>{row.a_input_width}</td>
              <td>{row.b_input_width}</td>
              <td>{row.clock}</td>
              <td>{GetText(row.pipelining, pipelining)}</td>
              <PercentsCell val={row.toggle_rate} precition={1} />
              <td>{row.consumption.dsp_blocks_used}</td>
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
            </tr>
          ))
        }
        </TableBase>
      </div>
      {modalOpen && (
      <DspModal
        title={title}
        closeModal={() => {
          setModalOpen(false);
          setEditIndex(null);
        }}
        onSubmit={handleSubmit}
        defaultValue={(editIndex !== null && dspData[editIndex]) || {
          enable: true,
          name: '',
          number_of_multipliers: 0,
          dsp_mode: 0,
          a_input_width: 0,
          b_input_width: 0,
          clock: defaultClock(),
          pipelining: 0,
          toggle_rate: 0,
        }}
      />
      )}
    </div>
  );
}

export default DspTable;
