import React from 'react';
import moment from 'moment';
import { FiSave } from 'react-icons/fi';
import { PiNotepad } from 'react-icons/pi';
import Switch from 'react-switch';
import DeviceList from './components/DeviceList';
import FpgaComponent from './components/FpgaComponent';
import ClockingTable from './components/Tables/ClockingTable';
import FleTable from './components/Tables/FleTable';
import DspTable from './components/Tables/DspTable';
import BramTable from './components/Tables/BramTable';
import IOTable from './components/Tables/IOTable';
import ACPUTable from './components/Tables/ACPUTable';
import BCPUTable from './components/Tables/BCPUTable';
import DMATable from './components/Tables/DMATable';
import ConnectivityTable from './components/Tables/ConnectivityTable';
import MemoryTable from './components/Tables/MemoryTable';
import DesignParametesTable from './components/Tables/DesignParametesTable';
import { Table, getPeripherals } from './utils/common';
import PeripheralsTable from './components/Tables/PeripheralsTable';
import * as server from './utils/serverAPI';
import SOCComponent from './components/SOCComponent';
import MemoryComponent from './components/MemoryComponent';
import FPGASummaryComponent from './components/FPGASummaryComponent';
import SOCSummaryComponent from './components/SOCSummaryComponent';
import TypicalWorstComponent from './components/TypicalWorstComponent';
import Notes from './components/Notes';
import Preferences from './preferences';
import { useSelection } from './SelectionProvider';
import { port } from '../rpe.config.json';
import { useClockSelection } from './ClockSelectionProvider';
import { useGlobalState } from './GlobalStateProvider';
import { useSocTotalPower } from './SOCTotalPowerProvider';

function App() {
  const timeFormat = 'MMM DD, YYYY h:mm:ss a';
  const [devices, setDevices] = React.useState([]);
  const [device, setDevice] = React.useState(null);
  const [openedTable, setOpenedTable] = React.useState(Table.Clocking);
  const [time, setTime] = React.useState(moment().format(timeFormat));
  const [mode, setMode] = React.useState(false);
  const [autoSave, setAutoSave] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [projectData, setProjectData] = React.useState({
    name: '',
    lang: 0,
    notes: '',
  });
  const [config, setConfig] = React.useState({
    useDefaultFile: true,
    device_xml: '',
    port,
  });
  const { toggleItemSelection } = useSelection();
  const [preferencesChanged, setPreferencesChanged] = React.useState(false);
  const { setClocks } = useClockSelection();
  const { updateGlobalState } = useGlobalState();
  const { updateTotalPower } = useSocTotalPower();
  const [peripherals, setPeripherals] = React.useState([]);
  const [memoryEnable, setMemoryEnable] = React.useState(true);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const showModal = () => {
    setPreferencesChanged(false);
    setIsModalOpen(true);
  };
  const handleOk = () => {
    // this will restart app
    if (preferencesChanged) {
      const conf = config;
      if (conf.useDefaultFile) conf.device_xml = '';
      window.ipcAPI.send('config', conf);
    } else setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  function getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value);
  }

  function sendProjectData(projectDataValue) {
    window.ipcAPI.send('projectData', projectDataValue);
  }

  React.useEffect(() => {
    const key = getKeyByValue(Table, openedTable);
    toggleItemSelection(key);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedTable]);

  React.useEffect(() => {
    window.ipcAPI.send('getConfig');
    if ((typeof window !== 'undefined')) {
      window.ipcAPI.ipcRendererOn('preferences', (event, data) => {
        setConfig(data);
        showModal();
      });
      window.ipcAPI.ipcRendererOn('loadConfig', (event, data) => {
        setConfig(data);
        server.setPort(data.port, setDevices);
      });
      window.ipcAPI.ipcRendererOn('projectData', (event, data) => {
        setProjectData({ notes: data.notes, lang: parseInt(data.lang, 10), name: data.name });
      });
    }
  }, []);

  const deviceChanged = (newDevice) => {
    setDevice(newDevice);
    updateGlobalState(newDevice);
    updateTotalPower(newDevice);
    server.GET(server.api.fetch(server.Elem.peripherals, newDevice), (data) => {
      const ddr = getPeripherals(data, 'ddr');
      const ocm = getPeripherals(data, 'ocm');
      setMemoryEnable(ddr.length > 0 || ocm.length > 0);
      setPeripherals(data);
    });
    if (newDevice !== null) {
      server.GET(server.api.fetch(server.Elem.clocking, newDevice), (data) => {
        setClocks(data.map((item) => item.port));
      });
    }
  };

  const handleNotesChange = (data) => {
    const newData = { ...projectData, notes: data };
    setProjectData(newData);
    sendProjectData(newData);
  };

  // eslint-disable-next-line no-unused-vars
  const handleLangChange = (val) => {
    const newData = { ...projectData, lang: parseInt(val.target.value, 10) };
    setProjectData(newData);
    sendProjectData(newData);
  };

  const handleTopNameChange = (val) => {
    const newData = { ...projectData, name: val.target.value };
    setProjectData(newData);
    sendProjectData(newData);
  };

  const handleConfigChange = (name, val) => {
    setPreferencesChanged(true);
    setConfig({ ...config, [name]: val });
  };

  return (
    <div className="rpe-head">
      <div className="top-row-container">
        <div className="main-table-container main-border">
          <div className="top-l1 main-bottom-border" onClick={() => setOpenedTable(Table.Summary)}>
            <DeviceList
              devices={devices}
              setDevice={deviceChanged}
            />
          </div>
          <div className="top-l2">
            <SOCComponent
              device={device}
              setOpenedTable={setOpenedTable}
              peripherals={peripherals}
            />
            <div className="top-l2-col2">
              <div className="top-l2-col2-elem">
                <FpgaComponent tableOpen={setOpenedTable} />
              </div>
              {
                memoryEnable && (
                <div onClick={() => setOpenedTable(Table.Memory)}>
                  <MemoryComponent device={device} peripherals={peripherals} />
                </div>
                )
              }
            </div>
          </div>
        </div>
        <div className="power-tables pt-group">
          <div className="edit-line">
            <div className="grayed-text no-wrap">Last Edited</div>
            <div className="last-time">{time}</div>
            <div className="save-icon" onClick={() => setTime(moment().format(timeFormat))}><FiSave /></div>
          </div>
          <input type="text" placeholder="Top level name" value={projectData.name} onChange={handleTopNameChange} />
          <select value={projectData.lang} onChange={handleLangChange}>
            <option value={0}>HDL lang</option>
            <option value={1}>Verilog</option>
            <option value={2}>HDL</option>
          </select>
          <FPGASummaryComponent device={device} />
        </div>
        <div className="power-tables">
          <div className="switches-container">
            <div className="row">
              <div className="switch">Auto save</div>
              <Switch
                checked={autoSave}
                onChange={setAutoSave}
                onColor="#f11f5e"
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={20}
                width={40}
              />
            </div>
            <div className="row">
              <div className="switch">Auto Mode</div>
              <Switch
                checked={mode}
                onChange={setMode}
                onColor="#f11f5e"
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={20}
                width={40}
              />
            </div>
            <div className="notes" onClick={() => setModalOpen(true)}><PiNotepad size="28px" /></div>
          </div>
          <TypicalWorstComponent />
          <SOCSummaryComponent device={device} />
        </div>
      </div>
      <div className="table-container main-border">
        {
        openedTable === Table.Clocking
        && <ClockingTable device={device} />
        }
        {
        openedTable === Table.FLE
        && <FleTable device={device} />
        }
        {
        openedTable === Table.IO
        && <IOTable device={device} />
        }
        {
        openedTable === Table.BRAM
        && <BramTable device={device} />
        }
        {
        openedTable === Table.DSP
        && <DspTable device={device} />
        }
        {
        openedTable === Table.ACPU
        && <ACPUTable device={device} />
        }
        {
        openedTable === Table.BCPU
        && <BCPUTable device={device} />
        }
        {
        openedTable === Table.Connectivity
        && <ConnectivityTable device={device} peripherals={peripherals} />
        }
        {
        openedTable === Table.Memory
        && <MemoryTable device={device} peripherals={peripherals} />
        }
        {
        openedTable === Table.DMA
        && <DMATable device={device} />
        }
        {
        openedTable === Table.Peripherals
        && <PeripheralsTable device={device} peripheralsUrl={peripherals} />
        }
        {
        openedTable === Table.Summary
        && <DesignParametesTable />
        }
        {modalOpen && (
        <Notes
          defaultValue={projectData.notes}
          closeModal={() => {
            setModalOpen(false);
          }}
          onSubmit={handleNotesChange}
        />
        )}
        <Preferences
          isModalOpen={isModalOpen}
          config={config}
          handleOk={handleOk}
          handleCancel={handleCancel}
          handleConfigChange={handleConfigChange}
        />
      </div>
    </div>
  );
}

export default App;
