import React from 'react';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { acpuNames, loadActivity, findEvailableIndex } from '../../utils/cpu';
import { TableBase, Actions } from './TableBase';
import ABCPUModal from '../ModalWindows/ABCPUModal';
import { PowerCell, SelectionCell, PercentsCell } from './TableCells';
import { GetText } from '../../utils/common';
import { publish } from '../../utils/events';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';
import { ComponentLabel } from '../ComponentsLib';

import '../style/ACPUTable.css';

function ACPUTable({ device }) {
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
      server.PATCH(server.peripheralPath(device, href), acpuData, fetchAcpuData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acpuData]);

  const handleChange = (name, val) => {
    setAcpuData({ ...acpuData, [name]: val });
    publish('cpuChanged', 'acpu');
    updateTotalPower(device);
  };

  const header = ['Action', 'Endpoint', 'Activity', 'R/W', 'Toggle Rate', 'Bandwidth', 'Noc Power'];

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
    publish('cpuChanged', 'acpu');
    updateTotalPower(device);
  };

  function addRow(newData) {
    if (device !== null) {
      const data = newData;
      data.name = GetText(newData.name, acpuNames);
      server.PATCH(server.peripheralPath(device, `${href}/ep/${findEvailableIndex(endpoints)}`), data, fetchAcpuData);
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    else addRow(newRow);
    publish('cpuChanged', 'acpu');
    updateTotalPower(device);
  };

  const powerHeader = ['Power', '%'];
  return (
    <div className="component-table-head">
      <ComponentLabel name="ACPU" />
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
            <select type="text" value={acpuData.load} onChange={(e) => handleChange('load', parseInt(e.target.value, 10))}>
              {
                  loadActivity.map((it) => (
                    <option key={it.id} value={it.id}>{it.text}</option>
                  ))
                }
            </select>
          </div>
        </div>
        <TableBase header={header} disabled={addButtonDisable} onClick={() => setModalOpen(true)}>
          {
            endpoints.map((row, index) => (
              (row.data !== undefined && row.data.name !== '')
              && (
              <tr key={row.ep}>
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
  );
}

export default ACPUTable;
