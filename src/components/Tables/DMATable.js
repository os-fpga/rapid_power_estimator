import React from 'react';
import PropTypes from 'prop-types';
import DMAModal from '../ModalWindows/DMAModal';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { GetText, fixed } from '../../utils/common';
import {
  PercentsCell, PowerCell, SelectionCell, BandwidthCell,
} from './TableCells';
import {
  TableBase, Actions, StatusColumn, EnableState,
} from './TableBase';
import { publish } from '../../utils/events';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';
import { useGlobalState } from '../../GlobalStateProvider';
import { ComponentLabel } from '../ComponentsLib';

import '../style/ComponentTable.css';

function DMATable({ device, update, notify }) {
  const [dev, setDev] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [channelHref, setChannelHref] = React.useState([]);
  const [dmaHref, setDmaHref] = React.useState([]);
  const [dmaData, setDmaData] = React.useState([
    { id: 0, data: {} },
    { id: 1, data: {} },
    { id: 2, data: {} },
    { id: 3, data: {} },
  ]);
  const { updateTotalPower } = useSocTotalPower();
  const { GetOptions, dmaNames, updateGlobalState } = useGlobalState();
  const loadActivity = GetOptions('Port_Activity');

  const mainTableHeader = [
    '', 'Action', 'En', 'Channel name', 'Source', 'Destination', 'Activity', 'R/W', 'Toggle Rate',
    'Bandwidth', 'NOC Power', 'Block Power', '%',
  ];

  function toChannelHref(index) {
    return `${dmaHref}/${channelHref[index].href}`;
  }

  function fetchChannelData(index, channelRef) {
    server.GET(server.peripheralPath(device, channelRef), (dmaJson) => {
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
      server.GET(server.peripheralPath(device, lhref), (data) => {
        setChannelHref(data.channels);
        data.channels.forEach((channel, index) => {
          fetchChannelData(index, `${lhref}/${channel.href}`);
        });
      });
    }
  }

  function fetchAll(deviceId) {
    server.GET(server.api.fetch(server.Elem.peripherals, deviceId), (data) => {
      const dma = data.find((elem) => elem.type === 'dma');
      if (dma !== undefined) {
        setDmaHref(dma.href);
        fetchData(dma.href);
      }
    });
  }

  if (dev !== device) {
    setDev(device);
    if (device !== null) fetchAll(device);
  }

  React.useEffect(() => {
    if (update && device !== null) fetchAll(device);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update]);

  function modifyDataHandler() {
    publish('dmaChanged');
    updateTotalPower(device);
    updateGlobalState(device);
    notify();
  }

  function modifyRow(index, row) {
    const newData = row;
    newData.source = GetText(row.source, dmaNames);
    newData.destination = GetText(row.destination, dmaNames);
    server.PATCH(
      server.peripheralPath(device, toChannelHref(index)),
      row,
      () => fetchData(dmaHref),
    );
  }

  function addRow(newData) {
    if (device !== null) {
      const found = dmaData.find((item) => item.data.enable === false);
      if (found) {
        server.PATCH(
          server.peripheralPath(device, toChannelHref(found.id)),
          newData,
          () => fetchData(dmaHref),
        );
      }
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    else addRow(newRow);
    modifyDataHandler();
  };

  const resourcesHeaders = [
    'Power', '%',
  ];

  function enableChanged(index, state) {
    const data = {
      enable: state,
    };
    server.PATCH(
      server.peripheralPath(device, toChannelHref(index)),
      data,
      () => fetchData(dmaHref),
    );
    modifyDataHandler();
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
                <td>{row.data.source}</td>
                <td>{row.data.destination}</td>
                <SelectionCell val={row.data.activity} values={loadActivity} />
                <PercentsCell val={row.data.read_write_rate} />
                <PercentsCell val={row.data.toggle_rate} precition={1} />
                <BandwidthCell val={row.data.consumption.calculated_bandwidth} />
                <PowerCell val={row.data.consumption.noc_power} />
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
          defaultValue={(editIndex !== null && {
            enable: true,
            name: dmaData[editIndex].data.name,
            source: dmaData[editIndex].data.source !== '' ? dmaNames.indexOf(dmaNames.find(
              (elem) => elem.text === dmaData[editIndex].data.source,
            )) : 0,
            destination: dmaData[editIndex].data.destination !== '' ? dmaNames.indexOf(dmaNames.find(
              (elem) => elem.text === dmaData[editIndex].data.destination,
            )) : 0,
            activity: dmaData[editIndex].data.activity,
            read_write_rate: dmaData[editIndex].data.read_write_rate,
            toggle_rate: dmaData[editIndex].data.toggle_rate,
          }) || {
            enable: true,
            name: '',
            source: 0,
            destination: 0,
            activity: 0,
            read_write_rate: 0,
            toggle_rate: 0,
          }}
          loadActivity={loadActivity}
          source={dmaNames}
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
