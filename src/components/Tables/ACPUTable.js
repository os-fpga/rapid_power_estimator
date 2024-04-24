import React from 'react';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { acpuNames, loadActivity, findEvailableIndex } from '../../utils/cpu';
import { TableBase, Actions, StatusColumn } from './TableBase';
import ABCPUModal from '../ModalWindows/ABCPUModal';
import { PowerCell, SelectionCell, PercentsCell } from './TableCells';
import { GetText } from '../../utils/common';
import { publish } from '../../utils/events';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';
import { ComponentLabel, Dropdown } from '../ComponentsLib';

import '../style/ACPUTable.css';

function ACPUTable({ device }) {
  const [dev, setDev] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [powerData, setPowerData] = React.useState([['Block Power', 0, 0]]);
  const [acpuData, setAcpuData] = React.useState({
    name: '',
    frequency: 0,
    load: 0,
  });
  const [endpoints, setEndpoints] = React.useState([]);
  const [href, setHref] = React.useState('');
  const [addButtonDisable, setAddButtonDisable] = React.useState(true);
  const { updateTotalPower } = useSocTotalPower();

  function fetchPort(port, link) {
    server.GET(server.peripheralPath(device, `${link}/${port.href}`), (data) => {
      const ep = parseInt(port.href.slice(-1), 10);
      const newData = endpoints;
      while (newData.length < (ep + 1)) newData.push({});
      newData[ep] = { ep, data };
      setEndpoints([...newData]);

      const found = newData.find((it) => it.data !== undefined && it.data.name === '');
      setAddButtonDisable(found === undefined);
    });
  }

  function fetchAcpuData(link) {
    if (link !== '') {
      server.GET(server.peripheralPath(device, link), (data) => {
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
        data.ports.forEach((port) => fetchPort(port, link));
      });
    }
  }

  function fetchData() {
    server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
      const link = data.acpu[0].href;
      setHref(link);
      fetchAcpuData(link);
    });
  }

  if (dev !== device) {
    setDev(device);
    if (device !== null) fetchData();
  }

  const handleChange = (name, val) => {
    const newData = { ...acpuData, [name]: val };
    setAcpuData(newData);
    if (device !== null && href !== '') {
      server.PATCH(server.peripheralPath(device, href), newData, () => fetchAcpuData(href));
    }
    publish('cpuChanged', 'acpu');
    updateTotalPower(device);
  };

  const header = ['', 'Action', 'Endpoint', 'Activity', 'R/W', 'Toggle Rate', 'Bandwidth', 'Noc Power'];

  function modifyRow(index, row) {
    const data = row;
    data.name = GetText(row.name, acpuNames);
    server.PATCH(server.peripheralPath(device, `${href}/ep/${endpoints[index].ep}`), data, () => fetchAcpuData(href));
  }

  const deleteRow = (index) => {
    // no delete method for acpu. this is just clear name of the endpoint which mean disable
    const val = endpoints[index].data;
    val.name = '';
    server.PATCH(server.peripheralPath(device, `${href}/ep/${endpoints[index].ep}`), val, () => fetchAcpuData(href));
    publish('cpuChanged', 'acpu');
    updateTotalPower(device);
  };

  function addRow(newData) {
    if (device !== null) {
      const data = newData;
      data.name = GetText(newData.name, acpuNames);
      server.PATCH(server.peripheralPath(device, `${href}/ep/${findEvailableIndex(endpoints)}`), data, () => fetchAcpuData(href));
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    else addRow(newRow);
    publish('cpuChanged', 'acpu');
    updateTotalPower(device);
  };

  const powerHeader = ['Power', '%'];
  const title = 'ACPU';
  return (
    <div className="component-table-head">
      <ComponentLabel name={title} />
      <div className="cpu-container">
        <PowerTable
          title="ACPU power"
          total={null}
          resourcesHeaders={powerHeader}
          resources={powerData}
          subHeader="Sub System"
        />
        <div className="acpu-group-container">
          <div className="acpu-group">
            <label>ACPU name</label>
            <input type="text" onChange={(e) => handleChange('name', e.target.value)} value={acpuData.name} />
          </div>
          <div className="acpu-group">
            <label>Frequency</label>
            <input type="number" min={0} step={1} onChange={(e) => handleChange('frequency', e.target.value)} value={acpuData.frequency} />
          </div>
          <div className="acpu-group">
            <label>Load</label>
            <Dropdown value={acpuData.load} onChangeHandler={(value) => handleChange('load', value)} items={loadActivity} />
          </div>
        </div>
        <TableBase header={header} disabled={addButtonDisable} onClick={() => setModalOpen(true)}>
          {
            endpoints.map((row, index) => (
              (row.data !== undefined && row.data.name !== '')
              && (
              <tr key={row.ep}>
                <StatusColumn messages={row.data.consumption.messages} />
                <Actions
                  onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                  onDeleteClick={() => deleteRow(index)}
                />
                <td>{row.data.name}</td>
                <SelectionCell val={row.data.activity} values={loadActivity} />
                <PercentsCell val={row.data.read_write_rate} />
                <PercentsCell val={row.data.toggle_rate} precition={1} />
                <PowerCell val={row.data.consumption.calculated_bandwidth} />
                <PowerCell val={row.data.consumption.noc_power} />
              </tr>
              )
            ))
          }
        </TableBase>
        {modalOpen && (
          <ABCPUModal
            title={title}
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
  );
}

export default ACPUTable;
