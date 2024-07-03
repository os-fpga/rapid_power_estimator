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

const Language = [
  {
    id: 0, text: 'HDL lang',
  },
  {
    id: 1, text: 'Verilog',
  },
  {
    id: 2, text: 'HDL',
  },
];

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
    device: '',
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

  function fetchProjectData() {
    server.GET(server.project(), (data) => {
      const { lang } = data;
      const newData = {
        ...projectData,
        name: data.name,
        device: data.device,
        notes: data.notes,
      };
      const findLang = Language.find((i) => i.text === lang);
      if (findLang !== undefined) newData.lang = findLang.id;
      else newData.lang = Language[0].id;
      setProjectData(newData);
      if (data.device !== device) {
        // TODO, switch device
      }
    });
  }

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
        if (data.action === 'new') server.POST(server.projectClose(), {}, fetchProjectData);
        if (data.action === 'open') {
          server.POST(server.projectOpen(), { filepath: data.filepath }, fetchProjectData);
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const data = {
      device: newDevice,
    };
    server.PATCH(server.project(), data, fetchProjectData);
  };

  const handleNotesChange = (notes) => {
    const data = {
      notes,
    };
    server.PATCH(server.project(), data, fetchProjectData);
  };

  // eslint-disable-next-line no-unused-vars
  const handleLangChange = (val) => {
    const data = {
      lang: Language.find((i) => i.id === parseInt(val.target.value, 10)).text,
    };
    server.PATCH(server.project(), data, fetchProjectData);
  };

  const handleTopNameChange = (val) => {
    const data = {
      name: val.target.value,
    };
    server.PATCH(server.project(), data, fetchProjectData);
  };

  const handleConfigChange = (name, val) => {
    setPreferencesChanged(true);
    setConfig({ ...config, [name]: val });
  };

  const autoSaveChanged = (newValue) => {
    setAutoSave(newValue);
    const data = {
      autosave: newValue,
    };
    server.PATCH(server.project(), data);
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
            {
              Language.map((opt) => <option key={opt.id} value={opt.id}>{opt.text}</option>)
            }
          </select>
          <FPGASummaryComponent device={device} />
        </div>
        <div className="power-tables">
          <div className="switches-container">
            <div className="row">
              <div className="switch">Auto save</div>
              <Switch
                checked={autoSave}
                onChange={autoSaveChanged}
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
