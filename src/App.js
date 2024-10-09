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
  const notApplicableTime = 'N/A';
  const [devices, setDevices] = React.useState([]);
  const [device, setDevice] = React.useState('');
  const [openedTable, setOpenedTable] = React.useState(Table.Clocking);
  const [mode, setMode] = React.useState(false);
  const [autoSave, setAutoSave] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [projectData, setProjectData] = React.useState({
    name: '',
    lang: 0,
    notes: '',
    lastEdited: notApplicableTime,
  });
  const [config, setConfig] = React.useState({
    useDefaultFile: true,
    device_xml: '',
    port,
    autoSave,
  });
  const { toggleItemSelection } = useSelection();
  const [preferencesChanged, setPreferencesChanged] = React.useState(false);
  const { setClocks } = useClockSelection();
  const { updateGlobalState, fetchAttributes } = useGlobalState();
  const { updateTotalPower } = useSocTotalPower();
  const [peripherals, setPeripherals] = React.useState([]);
  const [memoryEnable, setMemoryEnable] = React.useState(true);
  const [selectedDevice, setSelectedDevice] = React.useState('');
  const [update, setUpdate] = React.useState(false);
  const [errorMessageState, setErrorMessageState] = React.useState(false);

  function sendProjectData(projectDataValue) {
    window.ipcAPI.send('projectData', projectDataValue);
  }

  React.useEffect(() => {
    if (errorMessageState) {
      server.GET(server.project(), (data) => {
        sendProjectData({
          messages: data.messages,
        });
        setErrorMessageState(false);
      });
    }
  }, [errorMessageState]);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const showModal = () => {
    setPreferencesChanged(false);
    setIsModalOpen(true);
  };

  const deviceChanged = (newDevice) => {
    setPeripherals([]);
    setDevice(newDevice);
    updateGlobalState(newDevice);
    updateTotalPower(newDevice);
    if (newDevice !== '') {
      server.GET(server.api.fetch(server.Elem.peripherals, newDevice), (data) => {
        const ddr = getPeripherals(data, 'ddr');
        const ocm = getPeripherals(data, 'ocm');
        setMemoryEnable(ddr.length > 0 || ocm.length > 0);
        setPeripherals(data);
      });
      server.GET(server.api.fetch(server.Elem.clocking, newDevice), (data) => {
        setClocks(data.map((item) => item.port));
      });
    }
  };

  function fetchProjectData() {
    server.GET(server.project(), (data) => {
      const { lang } = data;
      const newData = {
        ...projectData,
        name: data.name,
        notes: data.notes,
        lastEdited: data.last_edited
          ? moment(data.last_edited).format(timeFormat)
          : notApplicableTime,
      };
      const findLang = Language.find((i) => i.text === lang);
      if (findLang !== undefined) newData.lang = findLang.id;
      else newData.lang = Language[0].id;
      setProjectData(newData);
      sendProjectData({
        modified: data.modified,
        filepath: data.filepath,
      });
    });
  }

  function verifyError() { setErrorMessageState(true); }

  function switchDevice() {
    server.GET(server.project(), (data) => {
      setSelectedDevice(data.device);
      deviceChanged(data.device);
    });
  }

  function fetchModify() {
    server.GET(server.project(), (data) => {
      sendProjectData({ modified: data.modified, filepath: data.filepath });
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
    if ((typeof window !== 'undefined')) {
      window.ipcAPI.send('getConfig');
      window.ipcAPI.ipcRendererOn('preferences', (event, data) => {
        setConfig(data);
        setAutoSave(data.autoSave);
        showModal();
      });
      window.ipcAPI.ipcRendererOn('loadConfig', (event, data) => {
        setConfig(data);
        setAutoSave(data.autoSave);
        server.setPort(data.port, setDevices);
        fetchAttributes();
      });
      window.ipcAPI.ipcRendererOn('projectData', (event, data) => {
        if (data.action === 'new') server.POST(server.projectClose(), {}, () => { fetchProjectData(); switchDevice(); });
        if (data.action === 'open') {
          const openData = { filepath: data.filepath };
          server.POST(
            server.projectOpen(),
            openData,
            () => { fetchProjectData(); switchDevice(); verifyError(); },
          );
        }
        if (data.action === 'save') {
          server.POST(server.project(), {}, fetchProjectData);
        }
        if (data.action === 'saveAs') {
          const saveData = { filepath: data.filepath };
          server.POST(server.projectSave(), saveData, fetchProjectData);
        }
        setUpdate(data.action === 'new' || data.action === 'open');
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if ((typeof window !== 'undefined')) {
      window.ipcAPI.send('autoSave', { autoSave: newValue });
    }
    const data = {
      autosave: newValue,
    };
    server.PATCH(server.project(), data);
  };

  const handleDeviceChange = (deviceId) => {
    setSelectedDevice(deviceId);
    deviceChanged(deviceId);
    const data = {
      device: deviceId,
    };
    server.PATCH(server.project(), data, fetchProjectData);
  };

  return (
    <div className="rpe-head">
      <div className="top-row-container">
        <div className="main-table-container main-border">
          {/* <div className="top-l1 main-bottom-border"
          onClick={() => setOpenedTable(Table.Summary)}> TODO RPE-49 */}
          <div className="main-bottom-border">
            <DeviceList
              devices={devices}
              selectedDevice={selectedDevice}
              handleDeviceChange={handleDeviceChange}
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
            <div className="last-time">{projectData.lastEdited}</div>
            <div className="save-icon" onClick={() => sendProjectData({ saveRequest: true })}><FiSave /></div>
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
                disabled={true}  // Disabling the switch

              />
            </div>
            <div className="row">
              <div className="switch">Auto Mode</div>
              <Switch
                checked={false} //making sure the switch is off
                onChange={autoSaveChanged} //will implement if needed for future functionality
                onColor="#f11f5e"
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={20}
                width={40}
                disabled={true}  // Disable the switch

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
        && <ClockingTable device={device} update={update} notify={() => fetchModify()} />
        }
        {
        openedTable === Table.FLE
        && <FleTable device={device} update={update} notify={() => fetchModify()} />
        }
        {
        openedTable === Table.IO
        && <IOTable device={device} update={update} notify={() => fetchModify()} />
        }
        {
        openedTable === Table.BRAM
        && <BramTable device={device} update={update} notify={() => fetchModify()} />
        }
        {
        openedTable === Table.DSP
        && <DspTable device={device} update={update} notify={() => fetchModify()} />
        }
        {
        openedTable === Table.ACPU
        && <ACPUTable device={device} update={update} notify={() => fetchModify()} />
        }
        {
        openedTable === Table.BCPU
        && <BCPUTable device={device} update={update} notify={() => fetchModify()} />
        }
        {
        openedTable === Table.Connectivity
        && (
        <ConnectivityTable
          device={device}
          peripherals={peripherals}
          update={update}
          notify={() => fetchModify()}
        />
        )
        }
        {
        openedTable === Table.Memory
        && (
        <MemoryTable
          device={device}
          peripherals={peripherals}
          update={update}
          notify={() => fetchModify()}
        />
        )
        }
        {
        openedTable === Table.DMA
        && <DMATable device={device} update={update} notify={() => fetchModify()} />
        }
        {
        openedTable === Table.Peripherals
        && (
        <PeripheralsTable
          device={device}
          peripheralsUrl={peripherals}
          update={update}
          notify={() => fetchModify()}
        />
        )
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
