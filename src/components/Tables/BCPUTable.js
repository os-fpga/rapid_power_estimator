import React from 'react';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { bcpuNames, findEvailableIndex } from '../../utils/cpu';
import { TableBase, Actions, StatusColumn } from './TableBase';
import ABCPUModal from '../ModalWindows/ABCPUModal';
import { PowerCell, SelectionCell, PercentsCell } from './TableCells';
import { GetText } from '../../utils/common';
import { publish } from '../../utils/events';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';
import { useGlobalState } from '../../GlobalStateProvider';
import { ComponentLabel, Checkbox, Dropdown } from '../ComponentsLib';

import '../style/ACPUTable.css';

function BCPUTable({ device }) {
  const [dev, setDev] = React.useState(null);
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
  const { updateTotalPower } = useSocTotalPower();
  const { GetOptions, updateGlobalState } = useGlobalState();
  const loadActivity = GetOptions('Port_Activity');
  const clock = GetOptions('N22_RISC_V_Clock');

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
        data.ports.forEach((port) => fetchPort(port, link));
      });
    }
  }

  function fetchData() {
    server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
      setHref(data.bcpu[0].href);
      fetchAcpuData(data.bcpu[0].href);
    });
  }

  if (dev !== device) {
    setDev(device);
    if (device !== null) fetchData();
  }

  function modifyDataHandler() {
    publish('cpuChanged', 'bcpu');
    updateTotalPower(device);
    updateGlobalState(device);
  }

  const handleChange = (name, val) => {
    const newData = { ...bcpuData, [name]: val };
    setBcpuData(newData);
    if (device !== null && href !== '') {
      server.PATCH(server.peripheralPath(device, href), newData, () => fetchAcpuData(href));
    }
    modifyDataHandler();
  };

  const header = ['', 'Action', 'Endpoint', 'Activity', 'R/W', 'Toggle Rate', 'Bandwidth', 'Noc Power'];

  function modifyRow(index, row) {
    const data = row;
    data.name = GetText(row.name, bcpuNames);
    server.PATCH(server.peripheralPath(device, `${href}/ep/${endpoints[index].ep}`), data, () => fetchAcpuData(href));
  }

  const deleteRow = (index) => {
    // no delete method for acpu. this is just clear name of the endpoint which mean disable
    const val = endpoints[index].data;
    val.name = '';
    server.PATCH(server.peripheralPath(device, `${href}/ep/${endpoints[index].ep}`), val, () => fetchAcpuData(href));
    modifyDataHandler();
  };

  function addRow(newData) {
    if (device !== null) {
      const data = newData;
      data.name = GetText(newData.name, bcpuNames);
      server.PATCH(server.peripheralPath(device, `${href}/ep/${findEvailableIndex(endpoints)}`), data, () => fetchAcpuData(href));
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    else addRow(newRow);
    modifyDataHandler();
  };

  const powerHeader = ['Power', '%'];
  const title = 'BCPU';
  return (
    <div className="component-table-head">
      <ComponentLabel name={title} />
      <div className="cpu-container">
        <PowerTable
          title="BCPU power"
          total={null}
          resourcesHeaders={powerHeader}
          resources={powerData}
          subHeader="Sub System"
        />
        <div className="acpu-group-container">
          <div className="acpu-group">
            <label>BCPU name</label>
            <input type="text" onChange={(e) => handleChange('name', e.target.value)} value={bcpuData.name} />
          </div>
          <div className="acpu-group">
            <Checkbox
              isChecked={bcpuData.encryption_used}
              label="Encryption"
              checkHandler={(state) => handleChange('encryption_used', state)}
              id="encryption"
            />
          </div>
          <div className="acpu-group">
            <label>Boot Mode</label>
            <input type="text" value={bootMode} disabled />
          </div>
          <div className="acpu-group">
            <label>Clock</label>
            <Dropdown value={bcpuData.clock} onChangeHandler={(value) => handleChange('clock', value)} items={clock} />
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
            loadActivity={loadActivity}
          />
        )}
      </div>
    </div>
  );
}

export default BCPUTable;
