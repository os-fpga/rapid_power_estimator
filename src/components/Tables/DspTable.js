import React from 'react';
import { FaPlus } from 'react-icons/fa6';
import DspModal from '../ModalWindows/DspModal';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { fixed, GetText } from '../../utils/common';
import { dspMode, pipelining } from '../../utils/dsp';
import { PercentsCell, FrequencyCell, PowerCell } from './TableCells';
import { TableBase, Actions } from './TableBase';

import '../style/ComponentTable.css';

function DspTable({ device, totalPowerCallback }) {
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [dspData, setDspData] = React.useState([]);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [powerTable, setPowerTable] = React.useState([]);

  const fetchDspData = (deviceId) => {
    if (deviceId !== null) {
      server.GET(server.api.fetch(server.Elem.dsp, deviceId), (data) => {
        setDspData(data);
        server.GET(server.api.consumption(server.Elem.dsp, deviceId), (consumption) => {
          const total = consumption.total_dsp_block_power
            + consumption.total_dsp_interconnect_power;
          setPowerTotal(total);
          totalPowerCallback(total);
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

  React.useEffect(() => {
    if (device !== null) fetchDspData(device);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  function modifyRow(index, row) {
    server.PATCH(
      server.api.index(server.Elem.dsp, device, index),
      row,
      () => fetchDspData(device),
    );
  }

  const deleteRow = (index) => {
    server.DELETE(
      server.api.index(server.Elem.dsp, device, index),
      () => fetchDspData(device),
    );
  };

  function addRow(newData) {
    if (device !== null) {
      server.POST(
        server.api.fetch(server.Elem.dsp, device),
        newData,
        () => fetchDspData(device),
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
    'Name/Hierarchy', 'XX', 'DSP Mode', { className: 'no-wrap', text: 'A-W' }, { className: 'no-wrap', text: 'B-W' },
    'Clock', 'Pipeline', 'T-Rate',
    'Block Used', 'Clock Freq', 'O/P Sig Rate', 'Block Power', 'Intc. Power', '%', 'Action',
  ];

  return (
    <div className="component-table-head">
      <div className="main-block">
        <div className="layout-head">
          <label>FPGA &gt; DSP</label>
          <button type="button" className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
        </div>
        <TableBase header={mainTableHeader}>
          {
            dspData.map((row, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <tr key={index}>
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
                <Actions
                  onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                  onDeleteClick={() => deleteRow(index)}
                />
              </tr>
            ))
          }
        </TableBase>
        {modalOpen && (
          <DspModal
            closeModal={() => {
              setModalOpen(false);
              setEditIndex(null);
            }}
            onSubmit={handleSubmit}
            defaultValue={(editIndex !== null && dspData[editIndex]) || {
              name: '',
              number_of_multipliers: 0,
              dsp_mode: 0,
              a_input_width: 0,
              b_input_width: 0,
              clock: '',
              pipelining: 0,
              toggle_rate: 0,
            }}
          />
        )}
      </div>
      <div className="power-table-wrapper">
        <PowerTable
          title="DSP power"
          total={powerTotal}
          resourcesHeaders={resourcesHeaders}
          resources={powerTable}
        />
      </div>
    </div>
  );
}

export default DspTable;
