import React from 'react';
import { FaPlus } from 'react-icons/fa6';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import {
  bcpuNames, clock, loadActivity, findEvailableIndex,
} from '../../utils/cpu';
import { TableBase, Actions, Checkbox } from './TableBase';
import ABCPUModal from '../ModalWindows/ABCPUModal';
import { PowerCell, SelectionCell, PercentsCell } from './TableCells';
import { GetText } from '../../utils/common';
import { publish } from '../../utils/events';

import '../style/ACPUTable.css';

function BCPUTable({ device }) {
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [powerData, setPowerData] = React.useState([
    ['Active Power', 0, 0],
    ['Boot Power', 0, 0],
  ]);
  const [bcpuData, setBcpuData] = React.useState({
    name: '',
    encryption_used: false,
    clock: 0,
  });
  const [bootMode, setBootMode] = React.useState('');
  const [endpoints, setEndpoints] = React.useState([]);
  const [href, setHref] = React.useState('');
  const [addButtonDisable, setAddButtonDisable] = React.useState(true);

  function fetchData() {
    server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
      setHref(data.bcpu[0].href);
    });
  }

  React.useEffect(() => {
    if (device !== null) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  function fetchPort(port) {
    server.GET(server.peripheralPath(device, `${href}/${port.href}`), (data) => {
      const ep = parseInt(port.href.slice(-1), 10);
      const newData = endpoints;
      while (newData.length < (ep + 1)) newData.push({});
      newData[ep] = { ep, data };
      setEndpoints([...newData]);
    });
  }

  function fetchAcpuData() {
    if (href !== '') {
      server.GET(server.peripheralPath(device, href), (data) => {
        setBootMode(data.consumption.boot_mode);
        // resolve cycling
        if (data.name !== bcpuData.name
          || data.encryption_used !== bcpuData.encryption_used
          || data.clock !== bcpuData.clock) {
          setBcpuData({
            name: data.name,
            encryption_used: data.encryption_used,
            clock: data.clock,
          });
        }
        setPowerData([
          ['Active Power', data.consumption.active_power, 0],
          ['Boot Power', data.consumption.boot_power, 0],
        ]);
        data.ports.forEach((port) => fetchPort(port));
      });
    }
  }

  React.useEffect(() => {
    if (device !== null) {
      fetchAcpuData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [href]);

  React.useEffect(() => {
    const found = endpoints.find((it) => it.data !== undefined && it.data.name === '');
    setAddButtonDisable(found === undefined);
  }, [endpoints]);

  React.useEffect(() => {
    if (device !== null && href !== '') {
      server.PATCH(server.peripheralPath(device, href), bcpuData, fetchAcpuData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bcpuData]);

  const handleChange = (name, val) => {
    setBcpuData({ ...bcpuData, [name]: val });
    publish('cpuChanged', 'bcpu');
  };

  const header = ['Endpoint', 'Activity', 'R/W', 'Toggle Rate', 'Bandwidth', 'Noc Power', 'Action'];

  function modifyRow(index, row) {
    const data = row;
    data.name = GetText(row.name, bcpuNames);
    server.PATCH(server.peripheralPath(device, `${href}/ep/${endpoints[index].ep}`), data, fetchAcpuData);
  }

  const deleteRow = (index) => {
    // no delete method for acpu. this is just clear name of the endpoint which mean disable
    const val = endpoints[index].data;
    val.name = '';
    server.PATCH(server.peripheralPath(device, `${href}/ep/${endpoints[index].ep}`), val, fetchAcpuData);
    publish('cpuChanged', 'bcpu');
  };

  function addRow(newData) {
    if (device !== null) {
      const data = newData;
      data.name = GetText(newData.name, bcpuNames);
      server.PATCH(server.peripheralPath(device, `${href}/ep/${findEvailableIndex(endpoints)}`), data, fetchAcpuData);
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    else addRow(newRow);
    publish('cpuChanged', 'bcpu');
  };

  const encryptionHandler = React.useCallback((state) => {
    setBcpuData({ ...bcpuData, encryption_used: state });
    publish('cpuChanged', 'bcpu');
  }, [bcpuData]);

  const powerHeader = ['Power', '%'];
  return (
    <div className="acpu-container">
      <div className="main-block">
        <div className="layout-head">
          <label>FPGA &gt; BCPU</label>
          <button type="button" disabled={addButtonDisable} className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
        </div>
        <div className="cpu-container">
          <div className="acpu-group-container">
            <div className="acpu-group">
              <label>BCPU name</label>
              <input type="text" onChange={(e) => handleChange('name', e.target.value)} value={bcpuData.name} />
            </div>
            <div className="acpu-group">
              <Checkbox
                isChecked={bcpuData.encryption_used}
                label="Encryption"
                checkHandler={encryptionHandler}
                id="encryption"
              />
            </div>
            <div className="acpu-group">
              <label>Boot Mode</label>
              <input type="text" value={bootMode} disabled />
            </div>
            <div className="acpu-group">
              <label>Clock</label>
              <select type="text" value={bcpuData.clock} onChange={(e) => handleChange('clock', parseInt(e.target.value, 10))}>
                {
                  clock.map((it) => (
                    <option key={it.id} value={it.id}>{it.text}</option>
                  ))
                }
              </select>
            </div>
          </div>
          <TableBase header={header}>
            {
              endpoints.map((row, index) => (
                (row.data !== undefined && row.data.name !== '')
                && (
                <tr key={row.ep}>
                  <td>{row.data.name}</td>
                  <SelectionCell val={row.data.activity} values={loadActivity} />
                  <PercentsCell val={row.data.read_write_rate} />
                  <PercentsCell val={row.data.toggle_rate} precition={1} />
                  <PowerCell val={row.data.consumption.calculated_bandwidth} />
                  <PowerCell val={row.data.consumption.noc_power} />
                  <Actions
                    onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                    onDeleteClick={() => deleteRow(index)}
                  />
                </tr>
                )
              ))
            }
          </TableBase>
          {modalOpen
            && (
              <ABCPUModal
                closeModal={() => {
                  setModalOpen(false);
                  setEditIndex(null);
                }}
                onSubmit={handleSubmit}
                defaultValue={(editIndex !== null && {
                  name: bcpuNames.indexOf(bcpuNames.find(
                    (elem) => elem.text === endpoints[editIndex].data.name,
                  )),
                  activity: endpoints[editIndex].data.activity,
                  read_write_rate: endpoints[editIndex].data.read_write_rate,
                  toggle_rate: endpoints[editIndex].data.toggle_rate,
                }) || {
                  name: 0,
                  activity: 0,
                  read_write_rate: 0.5,
                  toggle_rate: 0.125,
                }}
                endpoints={bcpuNames}
              />
            )}
        </div>
      </div>
      <PowerTable
        title="BCPU power"
        total={null}
        resourcesHeaders={powerHeader}
        resources={powerData}
        subHeader="Sub System"
      />
    </div>
  );
}

export default BCPUTable;
