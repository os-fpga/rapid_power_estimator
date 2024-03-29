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
import { Table } from './utils/common';
import PeripheralsTable from './components/Tables/PeripheralsTable';
import * as server from './utils/serverAPI';
import SOCComponent from './components/SOCComponent';
import MemoryComponent from './components/MemoryComponent';
import FPGASummaryComponent from './components/FPGASummaryComponent';
import SOCSummaryComponent from './components/SOCSummaryComponent';
import TypicalWorstComponent from './components/TypicalWorstComponent';
import Notes from './components/Notes';

function App() {
  const timeFormat = 'MMM DD, YYYY h:mm:ss a';
  const [devices, setDevices] = React.useState([]);
  const [device, setDevice] = React.useState(null);
  const [clockingPower, setClockingPower] = React.useState(0);
  const [flePower, setFlePower] = React.useState(0);
  const [dspPower, setDspPower] = React.useState(0);
  const [bramPower, setBramPower] = React.useState(0);
  const [ioPower, setIoPower] = React.useState(0);
  const [openedTable, setOpenedTable] = React.useState(Table.Clocking);
  const [time, setTime] = React.useState(moment().format(timeFormat));
  const [mode, setMode] = React.useState(false);
  const [autoSave, setAutoSave] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [notes, setNotes] = React.useState('');
  const [topLevel, setTopLevel] = React.useState('');

  React.useEffect(() => server.GET(server.devices, setDevices), []);

  const deviceChanged = (newDevice) => {
    setDevice(newDevice);
    if (newDevice !== null) {
      server.GET(server.api.consumption(server.Elem.clocking, newDevice), (data) => {
        const total = data.total_clock_block_power
          + data.total_clock_interconnect_power
          + data.total_pll_power;
        setClockingPower(total);
      });
      server.GET(server.api.consumption(server.Elem.fle, newDevice), (data) => {
        const total = data.total_block_power + data.total_interconnect_power;
        setFlePower(total);
      });
      server.GET(server.api.consumption(server.Elem.dsp, newDevice), (data) => {
        const total = data.total_dsp_block_power + data.total_dsp_interconnect_power;
        setDspPower(total);
      });
      server.GET(server.api.consumption(server.Elem.bram, newDevice), (data) => {
        const total = data.total_bram_block_power + data.total_bram_interconnect_power;
        setBramPower(total);
      });
      server.GET(server.api.consumption(server.Elem.io, newDevice), (data) => {
        const total = data.total_block_power
          + data.total_interconnect_power
          + data.total_on_die_termination_power;
        setIoPower(total);
      });
    }
  };

  const handleNotesChange = (data) => {
    setNotes(data);
  };

  const handleLangChange = (val) => {
    // implementation TBD
    console.log(val);
  };

  return (
    <div>
      <div className="app-main-container">
        <div className="top-container">
          <div className="top-l1">
            <DeviceList devices={devices} setDevice={deviceChanged} />
          </div>
          <div className="top-l2">
            <SOCComponent
              device={device}
              setOpenedTable={setOpenedTable}
            />
            <div className="top-l2-col2">
              <div className="top-l2-col2-elem">
                <FpgaComponent
                  clocking={clockingPower}
                  fle={flePower}
                  dsp={dspPower}
                  bram={bramPower}
                  io={ioPower}
                  tableOpen={setOpenedTable}
                />
              </div>
              <div onClick={() => setOpenedTable(Table.Memory)}>
                <MemoryComponent device={device} />
              </div>
            </div>
          </div>
        </div>
        <div className="power-tables pt-group">
          <div className="edit-line">
            <div className="grayed-text no-wrap">Last Edited</div>
            <div className="last-time">{time}</div>
            <div className="save-icon" onClick={() => setTime(moment().format(timeFormat))}><FiSave /></div>
          </div>
          <input type="text" placeholder="Top level name" value={topLevel} onChange={(e) => setTopLevel(e.target.value)} />
          <select value={0} onChange={handleLangChange}>
            <option value={0} disabled>HDL lang</option>
            <option value={1}>Verilog</option>
            <option value={2}>HDL</option>
          </select>
          <FPGASummaryComponent
            device={device}
            clocking={clockingPower}
            fle={flePower}
            dsp={dspPower}
            bram={bramPower}
            io={ioPower}
          />
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
      <div className="hspacer" />
      {
        openedTable === Table.Clocking
        && <ClockingTable device={device} totalPowerCallback={setClockingPower} />
      }
      {
        openedTable === Table.FLE
        && <FleTable device={device} totalPowerCallback={setFlePower} />
      }
      {
        openedTable === Table.IO
        && <IOTable device={device} totalPowerCallback={setIoPower} />
      }
      {
        openedTable === Table.BRAM
        && <BramTable device={device} totalPowerCallback={setBramPower} />
      }
      {
        openedTable === Table.DSP
        && <DspTable device={device} totalPowerCallback={setDspPower} />
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
        && <ConnectivityTable device={device} />
      }
      {
        openedTable === Table.Memory
        && <MemoryTable device={device} />
      }
      {
        openedTable === Table.DMA
        && <DMATable device={device} />
      }
      {
        openedTable === Table.Peripherals
        && <PeripheralsTable device={device} />
      }
      {modalOpen && (
      <Notes
        defaultValue={notes}
        closeModal={() => {
          setModalOpen(false);
        }}
        onSubmit={handleNotesChange}
      />
      )}
    </div>
  );
}

export default App;
