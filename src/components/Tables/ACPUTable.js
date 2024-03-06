import React from 'react';
import { FaPlus } from 'react-icons/fa6';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { acpuNames, loadActivity } from '../../utils/cpu';
import { TableBase, Actions } from './TableBase';
import ABCPUModal from '../ModalWindows/ABCPUModal';
import { PowerCell, SelectionCell, PercentsCell } from './TableCells';
import { GetText } from '../../utils/common';

import '../style/ACPUTable.css';

function ACPUTable({ device, onDataChanged }) {
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [powerData, setPowerData] = React.useState([['Block Power', 0, 0]]);
  const [acpuData, setAcpuData] = React.useState({
    name: '',
    frequency: 0,
    load: 0,
  });
  const [endpoints, setEndpoints] = React.useState([]);
  const [endpointsToDisplay, setEndpointsToDisplay] = React.useState([]);
  const [href, setHref] = React.useState('');
  const [addButtonDisable, setAddButtonDisable] = React.useState(true);

  function fetchData() {
    server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
      setHref(data.acpu[0].href);
    });
  }

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
        setEndpoints((prevVal) => [...prevVal, { ep: port.href.slice(-1), data }]);
      }
    });
  }

  function fetchAcpuData() {
    if (href !== '') {
      server.GET(server.peripheralPath(device, href), (data) => {
        // resolve cycling
        if (data.name !== acpuData.name
          || data.frequency !== acpuData.frequency
          || data.load !== acpuData.load) {
          setAcpuData({
            name: data.name,
            frequency: data.frequency,
            load: data.load,
          });
        }
        setPowerData([
          ['Block Power', data.consumption.block_power, 0],
        ]);
        setEndpoints([]);
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
    setAddButtonDisable(endpoints.length >= 4);
  }, [endpoints]);

  React.useEffect(() => {
    if (device !== null && href !== '') {
      server.PATCH(server.peripheralPath(device, href), acpuData, fetchAcpuData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acpuData]);

  const handleChange = (name, val) => {
    setAcpuData({ ...acpuData, [name]: val });
    onDataChanged();
  };

  const header = ['Endpoint', 'Activity', 'R/W', 'Toggle Rate', 'Bandwidth', 'Noc Power', 'Action'];

  function modifyRow(index, row) {
    const data = row;
    data.name = GetText(row.name, acpuNames);
    server.PATCH(server.peripheralPath(device, `${href}/ep/${endpoints[index].ep}`), data, fetchAcpuData);
  }

  const deleteRow = (index) => {
    // no delete method for acpu. this is just clear name of the endpoint which mean disable
    const val = endpoints[index].data;
    val.name = '';
    server.PATCH(server.peripheralPath(device, `${href}/ep/${endpoints[index].ep}`), val, fetchAcpuData);
    onDataChanged();
  };

  function findEvailableIndex() {
    let index = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const ep of endpoints) {
      if (index < ep.ep) return index;
      index += 1;
    }
    return index;
  }

  function addRow(newData) {
    if (device !== null) {
      const data = newData;
      data.name = GetText(newData.name, acpuNames);
      server.PATCH(server.peripheralPath(device, `${href}/ep/${findEvailableIndex()}`), data, fetchAcpuData);
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    else addRow(newRow);
    onDataChanged();
  };

  const powerHeader = ['Power', '%'];
  return (
    <div className="acpu-container">
      <div className="main-block">
        <div className="layout-head">
          <label>FPGA &gt; ACPU</label>
          <button type="button" disabled={addButtonDisable} className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
        </div>
        <div className="cpu-container">
          <div className="acpu-group-container">
            <div className="acpu-group">
              <label>ACPU name</label>
              <input type="text" onChange={(e) => handleChange('name', e.target.value)} value={acpuData.name} />
            </div>
            <div className="acpu-group">
              <label>Frequency</label>
              <input type="number" step={1} onChange={(e) => handleChange('frequency', e.target.value)} value={acpuData.frequency} />
            </div>
            <div className="acpu-group">
              <label>Load</label>
              <select type="text" value={acpuData.load} onChange={(e) => handleChange('load', parseInt(e.target.value, 10))}>
                {
                  loadActivity.map((it) => (
                    <option key={it.id} value={it.id}>{it.text}</option>
                  ))
                }
              </select>
            </div>
          </div>
          <TableBase
            header={header}
            data={
              endpointsToDisplay.map((row, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={index}>
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
              ))
            }
          />
          {modalOpen
            && (
              <ABCPUModal
                closeModal={() => {
                  setModalOpen(false);
                  setEditIndex(null);
                }}
                onSubmit={handleSubmit}
                defaultValue={(editIndex !== null && {
                  name: acpuNames.indexOf(acpuNames.find(
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
                endpoints={acpuNames}
              />
            )}
        </div>
      </div>
      <PowerTable
        title="ACPU power"
        total={null}
        resourcesHeaders={powerHeader}
        resources={powerData}
        subHeader="Sub System"
      />
    </div>
  );
}

export default ACPUTable;
