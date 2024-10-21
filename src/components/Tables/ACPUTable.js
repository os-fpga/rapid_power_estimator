import React from 'react';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { TableBase, Actions, StatusColumn } from './TableBase';
import ABCPUModal from '../ModalWindows/ABCPUModal';
import {
  PowerCell, SelectionCell, PercentsCell, BandwidthCell,
} from './TableCells';
import { GetText, findEvailableIndex, getPeripherals } from '../../utils/common';
import { publish } from '../../utils/events';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';
import { useGlobalState } from '../../GlobalStateProvider';
import { ComponentLabel, Dropdown } from '../ComponentsLib';

import '../style/ACPUTable.css';

function ACPUTable({ device, update, notify }) {
  const acpuDataDefault = {
    name: '',
    frequency: 0,
    load: 0,
  };
  const powerDataDefault = [['Block Power', 0, 0]];
  const [dev, setDev] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [powerData, setPowerData] = React.useState(powerDataDefault);
  const [acpuData, setAcpuData] = React.useState(acpuDataDefault);
  const [endpoints, setEndpoints] = React.useState([]);
  const [href, setHref] = React.useState('');
  const { updateTotalPower } = useSocTotalPower();
  const { GetOptions, updateGlobalState, acpuNames } = useGlobalState();
  const [disable, setDisable] = React.useState(true);
  const loadActivity = GetOptions('A45_Load');

  // Toggle handler to enable/disable ACPU fields and freeze parameters
  const handleToggle = () => {
    if (!device || !href) {
      setDisable(true);
    } else if (device && href) {
      setDisable(!disable); // Toggle the fields' disable state
    }
  };

  function fetchPort(port, link) {
    server.GET(server.peripheralPath(device, `${link}/${port.href}`), (data) => {
      const ep = parseInt(port.href.slice(-1), 10);
      const newData = endpoints;
      while (newData.length < (ep + 1)) newData.push({});
      newData[ep] = { ep, data };
      setEndpoints([...newData]);
    });
  }

  function fetchAcpuData(link) {
    if (link !== '') {
      server.GET(server.peripheralPath(device, link), (data) => {
        if (data.name !== acpuData.name
          || data.frequency !== acpuData.frequency
          || data.load !== acpuData.load) {
          setAcpuData({
            name: data.name,
            frequency: data.frequency,
            load: data.load,
          });
        }
        setPowerData([['Block Power', data.consumption.block_power, 0]]);
        data.ports.forEach((port) => fetchPort(port, link));
      });
    }
  }

  function reset() {
    setAcpuData(acpuDataDefault);
    setPowerData(powerDataDefault);
    setHref('');
    setEndpoints([]);
    setDisable(true);
  }

  function fetchData() {
    server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
      const acpu = getPeripherals(data, 'acpu');
      setDisable(true);
      if (acpu.length > 0) {
        const link = acpu[0].href;
        setHref(link);
        fetchAcpuData(link);
      } else {
        reset();
      }
    });
  }

  if (dev !== device) {
    setDev(device);
    if (device !== '') fetchData();
    else {
      reset();
    }
  }

  React.useEffect(() => {
    if (update && device !== '') fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update]);

  function modifyDataHandler() {
    publish('cpuChanged', 'acpu');
    updateTotalPower(device);
    updateGlobalState(device);
    notify();
  }

  const handleChange = (name, val) => {
    const newData = { ...acpuData, [name]: val };
    setAcpuData(newData);
    if (device !== '' && href !== '') {
      server.PATCH(server.peripheralPath(device, href), newData, () => fetchAcpuData(href));
    }
    modifyDataHandler();
  };

  const header = ['', 'Action', 'Endpoint', 'Activity', 'R/W', 'Toggle Rate', 'Bandwidth', 'Noc Power'];

  function modifyRow(index, row) {
    const data = row;
    data.name = GetText(row.name, acpuNames);
    server.PATCH(server.peripheralPath(device, `${href}/ep/${endpoints[index].ep}`), data, () => fetchAcpuData(href));
  }

  const deleteRow = (index) => {
    const val = endpoints[index].data;
    val.name = '';
    server.PATCH(server.peripheralPath(device, `${href}/ep/${endpoints[index].ep}`), val, () => fetchAcpuData(href));
    modifyDataHandler();
  };

  function addRow(newData) {
    if (device !== '') {
      const data = newData;
      data.name = GetText(newData.name, acpuNames);
      server.PATCH(server.peripheralPath(device, `${href}/ep/${findEvailableIndex(endpoints)}`), data, () => fetchAcpuData(href));
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    else addRow(newRow);
    modifyDataHandler();
  };

  const powerHeader = ['Power', '%'];
  const title = 'ACPU';

  return (
    <div className="component-table-head">
      <ComponentLabel name={title} />

      {/* Toggle Switch for ACPU */}
      <div className="toggle-container">
        <label htmlFor="acpu-toggle">ACPU Power</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            onChange={handleToggle}
            checked={!disable}
            disabled={!device || !href} // Disable toggle based on device and ACPU selection
          />
          <span className="slider" />
        </label>
      </div>

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
            <input
              type="text"
              onChange={(e) => handleChange('name', e.target.value)}
              value={acpuData.name}
              disabled={disable} // Freeze when toggle is off
            />
          </div>
          <div className="acpu-group">
            <label>Frequency</label>
            <input
              type="number"
              min={0}
              step={1}
              onChange={(e) => handleChange('frequency', e.target.value)}
              value={acpuData.frequency}
              disabled={disable} // Freeze when toggle is off
            />
          </div>
          <div className="acpu-group">
            <label>Load</label>
            <Dropdown
              value={acpuData.load}
              onChangeHandler={(value) => handleChange('load', value)}
              items={loadActivity}
              disabled={disable} // Freeze when toggle is off
            />
          </div>
        </div>

        <TableBase header={header} disabled={disable} onClick={() => setModalOpen(true)}>
          {endpoints.map((row, index) => (
            row.data !== undefined && row.data.name !== ''
            && (
            <tr key={row.ep}>
              <StatusColumn messages={row.data.consumption.messages} />
              <Actions
                onEditClick={() => { if (!disable) { setEditIndex(index); setModalOpen(true); } }}
                onDeleteClick={() => { if (!disable) { deleteRow(index); } }}
              />
              <td>{row.data.name}</td>
              <SelectionCell val={row.data.activity} values={loadActivity} disabled={disable} />
              {' '}
              {/* Freeze selection */}
              <PercentsCell val={row.data.read_write_rate} disabled={disable} />
              <PercentsCell val={row.data.toggle_rate} precition={1} disabled={disable} />
              <BandwidthCell val={row.data.consumption.calculated_bandwidth} disabled={disable} />
              <PowerCell val={row.data.consumption.noc_power} disabled={disable} />
            </tr>
            )
          ))}
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
            loadActivity={loadActivity}
          />
        )}
      </div>
    </div>
  );
}

export default ACPUTable;
