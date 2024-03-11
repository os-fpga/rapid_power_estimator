import React from 'react';
import { FaPlus } from 'react-icons/fa6';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { connectivityNames, loadActivity, portsLimit } from '../../utils/cpu';
import { TableBase, Actions } from './TableBase';
import ConnectivityModal from '../ModalWindows/ConnectivityModal';
import {
  PowerCell, SelectionCell, PercentsCell, FrequencyCell,
} from './TableCells';
import { GetText, fixed } from '../../utils/common';
import { publish } from '../../utils/events';

import '../style/ACPUTable.css';

function ConnectivityTable({ device }) {
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [powerData, setPowerData] = React.useState([['NOC Interconnect', 0, 0]]);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [endpoints, setEndpoints] = React.useState([]);
  const [endpointsToDisplay, setEndpointsToDisplay] = React.useState([]);
  const [href, setHref] = React.useState('');
  const [addButtonDisable, setAddButtonDisable] = React.useState(true);

  function fetchData() {
    server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
      setHref(data.fpga_complex[0].href);
    });
  }

  React.useEffect(() => {
    setPowerData([
      ['NOC Interconnect', powerTotal, 0],
    ]);
  }, [powerTotal]);

  React.useEffect(() => {
    if (device !== null) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  React.useEffect(() => {
    endpoints.sort((a, b) => a.ep - b.ep);
    setEndpointsToDisplay(endpoints);
  }, [endpoints]);

  function fetchPort(port) {
    server.GET(server.peripheralPath(device, `${href}/${port.href}`), (data) => {
      if (data.name !== '') {
        setPowerTotal((prev) => prev + data.consumption.noc_power);
        setEndpoints((prevVal) => [...prevVal, { ep: port.href.slice(-1), data }]);
      }
    });
  }

  function fetchConnectivityData() {
    if (href !== '') {
      server.GET(server.peripheralPath(device, href), (data) => {
        setPowerTotal(0);
        setEndpoints([]);
        data.ports.forEach((port) => fetchPort(port));
      });
    }
  }

  React.useEffect(() => {
    if (device !== null) {
      fetchConnectivityData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [href]);

  React.useEffect(() => {
    setAddButtonDisable(endpoints.length >= portsLimit);
  }, [endpoints]);

  const header = ['Clock', 'Frequency', 'Endpoint', 'Activity', 'R/W',
    'Toggle Rate', 'Bandwidth', 'Noc Power', '%', 'Action',
  ];

  function modifyRow(index, row) {
    const data = row;
    data.name = GetText(row.name, connectivityNames);
    server.PATCH(server.peripheralPath(device, `${href}/ep/${endpoints[index].ep}`), data, fetchConnectivityData);
  }

  const deleteRow = (index) => {
    // no delete method for acpu. this is just clear name of the endpoint which mean disable
    const val = endpoints[index].data;
    val.name = '';
    server.PATCH(server.peripheralPath(device, `${href}/ep/${endpoints[index].ep}`), val, fetchConnectivityData);
    publish('interconnectChanged');
  };

  function findEvailableIndex() {
    let index = 0;
    endpoints.find((item) => {
      if (index < item.ep) return true;
      index += 1;
      return false;
    });
    return index;
  }

  function addRow(newData) {
    if (device !== null) {
      const data = newData;
      data.name = GetText(newData.name, connectivityNames);
      server.PATCH(server.peripheralPath(device, `${href}/ep/${findEvailableIndex()}`), data, fetchConnectivityData);
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    else addRow(newRow);
    publish('interconnectChanged');
  };

  const powerHeader = ['Power', '%'];
  return (
    <div className="acpu-container">
      <div className="main-block">
        <div className="layout-head">
          <label>FPGA &gt; Connectivity</label>
          <button type="button" disabled={addButtonDisable} className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
        </div>
        <div className="cpu-container">
          <TableBase
            header={header}
            data={
              endpointsToDisplay.map((row, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={index}>
                  <td>{row.data.clock}</td>
                  <FrequencyCell val={row.data.consumption.clock_frequency} />
                  <td>{row.data.name}</td>
                  <SelectionCell val={row.data.activity} values={loadActivity} />
                  <PercentsCell val={row.data.read_write_rate} />
                  <PercentsCell val={row.data.toggle_rate} precition={1} />
                  <PowerCell val={row.data.consumption.calculated_bandwidth} />
                  <PowerCell val={row.data.consumption.noc_power} />
                  <td>
                    {fixed(row.data.consumption.percentage, 0)}
                    {' %'}
                  </td>
                  <Actions
                    onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                    onDeleteClick={() => deleteRow(index)}
                  />
                </tr>
              ))
            }
          />
          {modalOpen
            && (
              <ConnectivityModal
                closeModal={() => {
                  setModalOpen(false);
                  setEditIndex(null);
                }}
                onSubmit={handleSubmit}
                defaultValue={(editIndex !== null && {
                  name: connectivityNames.indexOf(connectivityNames.find(
                    (elem) => elem.text === endpoints[editIndex].data.name,
                  )),
                  clock: endpoints[editIndex].data.clock,
                  activity: endpoints[editIndex].data.activity,
                  read_write_rate: endpoints[editIndex].data.read_write_rate,
                  toggle_rate: endpoints[editIndex].data.toggle_rate,
                }) || {
                  name: 0,
                  clock: '',
                  activity: 0,
                  read_write_rate: 0.5,
                  toggle_rate: 0.125,
                }}
              />
            )}
        </div>
      </div>
      <PowerTable
        title="Connectivity power"
        total={null}
        resourcesHeaders={powerHeader}
        resources={powerData}
        subHeader="Sub System"
      />
    </div>
  );
}

export default ConnectivityTable;
