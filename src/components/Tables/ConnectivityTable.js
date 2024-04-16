import React from 'react';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { connectivityNames, loadActivity, findEvailableIndex } from '../../utils/cpu';
import { TableBase, Actions } from './TableBase';
import ConnectivityModal from '../ModalWindows/ConnectivityModal';
import {
  PowerCell, SelectionCell, PercentsCell, FrequencyCell,
} from './TableCells';
import { GetText, fixed } from '../../utils/common';
import { publish } from '../../utils/events';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';
import { ComponentLabel } from '../ComponentsLib';

import '../style/ACPUTable.css';

function ConnectivityTable({ device }) {
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [powerData, setPowerData] = React.useState([['NOC Interconnect', 0, 0]]);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [endpoints, setEndpoints] = React.useState([]);
  const [href, setHref] = React.useState('');
  const [addButtonDisable, setAddButtonDisable] = React.useState(false);
  const { updateTotalPower } = useSocTotalPower();

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

  function fetchPort(port) {
    server.GET(server.peripheralPath(device, `${href}/${port.href}`), (data) => {
      if (data.name !== '') {
        setPowerTotal((prev) => prev + data.consumption.noc_power);
      }
      const ep = parseInt(port.href.slice(-1), 10);
      const newData = endpoints;
      while (newData.length < (ep + 1)) newData.push({});
      newData[ep] = { ep, data };
      setEndpoints([...newData]);
    });
  }

  function fetchConnectivityData() {
    if (href !== '') {
      server.GET(server.peripheralPath(device, href), (data) => {
        setPowerTotal(0);
        data.ports.forEach((port) => fetchPort(port));
      });
    }
  }

  React.useEffect(() => {
    if (device !== null) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  React.useEffect(() => {
    if (device !== null) {
      fetchConnectivityData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [href]);

  React.useEffect(() => {
    const found = endpoints.find((it) => it.data !== undefined && it.data.name === '');
    setAddButtonDisable(found === undefined);
  }, [endpoints]);

  const header = ['Action', 'Clock', 'Frequency', 'Endpoint', 'Activity', 'R/W',
    'Toggle Rate', 'Bandwidth', 'Noc Power', '%',
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
    updateTotalPower(device);
  };

  function addRow(newData) {
    if (device !== null) {
      const data = newData;
      data.name = GetText(newData.name, connectivityNames);
      server.PATCH(server.peripheralPath(device, `${href}/ep/${findEvailableIndex(endpoints)}`), data, fetchConnectivityData);
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    else addRow(newRow);
    publish('interconnectChanged');
    updateTotalPower(device);
  };

  const powerHeader = ['Power', '%'];
  return (
    <div className="component-table-head">
      <div className="main-block">
        <ComponentLabel name="Connectivity" />
        <div className="cpu-container">
          <div className="power-and-table-wrapper">
            <PowerTable
              title="Connectivity power"
              total={null}
              resourcesHeaders={powerHeader}
              resources={powerData}
              subHeader="Sub System"
            />
            <TableBase
              header={header}
              disabled={addButtonDisable}
              onClick={() => setModalOpen(true)}
            >
              {
              endpoints.map((row, index) => (
                (row.data !== undefined && row.data.name !== '') && (
                <tr key={row.ep}>
                  <Actions
                    onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                    onDeleteClick={() => deleteRow(index)}
                  />
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
                </tr>
                )
              ))
            }
            </TableBase>
          </div>
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
    </div>
  );
}

export default ConnectivityTable;
