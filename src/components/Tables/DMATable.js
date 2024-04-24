import React from 'react';
import PropTypes from 'prop-types';
import DMAModal from '../ModalWindows/DMAModal';
import { source, loadActivity } from '../../utils/cpu';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { fixed } from '../../utils/common';
import { PercentsCell, PowerCell, SelectionCell } from './TableCells';
import {
  TableBase, Actions, StatusColumn, EnableState,
} from './TableBase';
import { publish } from '../../utils/events';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';
import { ComponentLabel } from '../ComponentsLib';

import '../style/ComponentTable.css';

function DMATable({ device }) {
  const [dev, setDev] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [href, setHref] = React.useState([]);
  const [dmaData, setDmaData] = React.useState([
    { id: 0, data: {} },
    { id: 1, data: {} },
    { id: 2, data: {} },
    { id: 3, data: {} },
  ]);
  const { updateTotalPower } = useSocTotalPower();

  const mainTableHeader = [
    '', 'Action', 'En', 'Channel name', 'Source', 'Destination', 'Activity', 'R/W', 'Toggle Rate',
    'Bandwidth', 'Block Power', '%',
  ];

  function fetchDmaData(index, dmaHref) {
    server.GET(server.peripheralPath(device, dmaHref), (dmaJson) => {
      setPowerTotal((prev) => prev + dmaJson.consumption.block_power);
      const dat = [...dmaData];
      const found = dat.find((i) => i.id === index);
      found.data = dmaJson;
      setDmaData(dat);
    });
  }

  function fetchData(lhref) {
    if (device !== null) {
      setPowerTotal(0);
      lhref.forEach((dma) => {
        const index = parseInt(dma.href.slice(-1), 10);
        fetchDmaData(index, dma.href);
      });
    }
  }

  if (dev !== device) {
    setDev(device);
    if (device !== null) {
      server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
        setHref(data.dma);
        fetchData(data.dma);
      });
    }
  }

  function modifyRow(index, row) {
    server.PATCH(server.peripheralPath(device, `${href[index].href}`), row, () => fetchData(href));
  }

  function addRow(newData) {
    if (device !== null) {
      const found = dmaData.find((item) => item.data.enable === false);
      if (found) {
        server.PATCH(server.peripheralPath(device, `${href[found.id].href}`), newData, () => fetchData(href));
      }
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    else addRow(newRow);
    publish('dmaChanged');
    updateTotalPower(device);
  };

  const resourcesHeaders = [
    'Power', '%',
  ];

  function enableChanged(index, state) {
    const data = {
      enable: state,
    };
    server.PATCH(server.peripheralPath(device, `${href[index].href}`), data, () => fetchData(href));
    publish('dmaChanged');
    updateTotalPower(device);
  }

  const title = 'DMA';

  return (
    <div className="component-table-head">
      <ComponentLabel name={title} />
      <div className="power-and-table-wrapper">
        <div className="power-table-wrapper">
          <PowerTable
            title="DMA power"
            total={null}
            resourcesHeaders={resourcesHeaders}
            resources={[['DMA', powerTotal, 0]]}
            subHeader="Sub System"
          />
        </div>
        <TableBase
          header={mainTableHeader}
          hideAddBtn
          onClick={() => setModalOpen(true)}
        >
          {
          dmaData.map((row, index) => (
            (row.data.consumption !== undefined) && (
              <tr key={row.id}>
                <StatusColumn messages={row.data.consumption.messages} />
                <Actions
                  onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                />
                <EnableState
                  isChecked={row.data.enable}
                  checkHandler={(state) => enableChanged(index, state)}
                />
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
              </tr>
            )
          ))
        }
        </TableBase>
      </div>
      {modalOpen && (
        <DMAModal
          title={title}
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
  );
}

DMATable.propTypes = {
  device: PropTypes.string,
};

DMATable.defaultProps = {
  device: null,
};

export default DMATable;
