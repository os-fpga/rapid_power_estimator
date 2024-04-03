import React from 'react';
import PropTypes from 'prop-types';
import { FaPlus } from 'react-icons/fa6';
import DMAModal from '../ModalWindows/DMAModal';
import { source, loadActivity } from '../../utils/cpu';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { fixed } from '../../utils/common';
import { PercentsCell, PowerCell, SelectionCell } from './TableCells';
import { TableBase, Actions } from './TableBase';
import { publish } from '../../utils/events';

import '../style/ComponentTable.css';

function DMATable({ device }) {
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [powerTable, setPowerTable] = React.useState([]);
  const [href, setHref] = React.useState([]);
  const [dmaData, setDmaData] = React.useState([
    { id: 0, data: {} },
    { id: 1, data: {} },
    { id: 2, data: {} },
    { id: 3, data: {} },
  ]);
  const [addButtonDisable, setAddButtonDisable] = React.useState(true);

  const mainTableHeader = [
    'Channel name', 'Source', 'Destination', 'Activity', 'R/W', 'Toggle Rate',
    'Bandwidth', 'Block Power', '%', 'Action',
  ];

  React.useEffect(() => {
    const found = dmaData.find((item) => item.data.enable === false);
    setAddButtonDisable(found === undefined);
  }, [dmaData]);

  React.useEffect(() => {
    if (device !== null) {
      server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
        setHref(data.dma);
      });
    }
  }, [device]);

  React.useEffect(() => {
    setPowerTable([
      ['DMA', powerTotal, 0],
    ]);
  }, [powerTotal]);

  function fetchDmaData(index, dmaHref) {
    server.GET(server.peripheralPath(device, dmaHref), (dmaJson) => {
      setPowerTotal((prev) => prev + dmaJson.consumption.block_power);
      const dat = [...dmaData];
      const found = dat.find((i) => i.id === index);
      found.data = dmaJson;
      setDmaData(dat);
    });
  }

  function fetchData() {
    if (device !== null) {
      setPowerTotal(0);
      href.forEach((dma) => {
        const index = parseInt(dma.href.slice(-1), 10);
        fetchDmaData(index, dma.href);
      });
    }
  }

  React.useEffect(() => {
    if (device !== null) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [href]);

  function modifyRow(index, row) {
    server.PATCH(server.peripheralPath(device, `${href[index].href}`), row, fetchData);
  }

  const deleteRow = (index) => {
    const data = { enable: false };
    server.PATCH(server.peripheralPath(device, `${href[index].href}`), data, fetchData);
    publish('dmaChanged');
  };

  function addRow(newData) {
    if (device !== null) {
      const found = dmaData.find((item) => item.data.enable === false);
      if (found) {
        server.PATCH(server.peripheralPath(device, `${href[found.id].href}`), newData, fetchData);
      }
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    else addRow(newRow);
    publish('dmaChanged');
  };

  const resourcesHeaders = [
    'Power', '%',
  ];

  return (
    <div className="component-table-head">
      <div className="main-block">
        <div className="layout-head">
          <label>FPGA &gt; DMA</label>
          <button type="button" disabled={addButtonDisable} className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
        </div>
        <div className="power-and-table-wrapper">
          <div className="power-table-wrapper">
            <PowerTable
              title="DMA power"
              total={null}
              resourcesHeaders={resourcesHeaders}
              resources={powerTable}
              subHeader="Sub System"
            />
          </div>
          <TableBase header={mainTableHeader}>
            {
            dmaData.map((row, index) => (
              row.data.enable && (
                <tr key={row.id}>
                  <td>{row.data.name}</td>
                  <SelectionCell val={row.data.source} values={source} />
                  <SelectionCell val={row.data.destination} values={source} />
                  <SelectionCell val={row.data.activity} values={loadActivity} />
                  <PercentsCell val={row.data.read_write_rate} />
                  <PercentsCell val={row.data.toggle_rate} precition={1} />
                  <PowerCell val={row.data.consumption.calculated_bandwidth} />
                  <PowerCell val={row.data.consumption.block_power} />
                  <td>
                    {fixed(row.data.consumption.percentage, 0)}
                    {' %'}
                  </td>
                  <Actions
                    onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                    onDeleteClick={() => deleteRow(row.id)}
                  />
                </tr>
              )
            ))
          }
          </TableBase>
        </div>
        {modalOpen && (
        <DMAModal
          closeModal={() => {
            setModalOpen(false);
            setEditIndex(null);
          }}
          onSubmit={handleSubmit}
          defaultValue={(editIndex !== null && dmaData[editIndex].data) || {
            enable: true,
            name: '',
            source: 0,
            destination: 0,
            activity: 0,
            read_write_rate: 0,
            toggle_rate: 0,
          }}
        />
        )}
      </div>
    </div>
  );
}

DMATable.propTypes = {
  device: PropTypes.string,
};

DMATable.defaultProps = {
  device: null,
};

export default DMATable;
