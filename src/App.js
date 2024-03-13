import React from 'react';
import { FiSave } from 'react-icons/fi';
// eslint-disable-next-line import/no-extraneous-dependencies
import Time from 'react-time';
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

function App() {
  const [devices, setDevices] = React.useState([]);
  const [device, setDevice] = React.useState(null);
  const [clockingPower, setClockingPower] = React.useState(0);
  const [flePower, setFlePower] = React.useState(0);
  const [dspPower, setDspPower] = React.useState(0);
  const [bramPower, setBramPower] = React.useState(0);
  const [ioPower, setIoPower] = React.useState(0);
  const [openedTable, setOpenedTable] = React.useState(Table.Clocking);
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => server.GET(server.devices, setDevices), []);

  React.useEffect(() => {
    if (device !== null) {
      server.GET(server.api.consumption(server.Elem.clocking, device), (data) => {
        const total = data.total_clock_block_power
          + data.total_clock_interconnect_power
          + data.total_pll_power;
        setClockingPower(total);
      });
      server.GET(server.api.consumption(server.Elem.fle, device), (data) => {
        const total = data.total_block_power + data.total_interconnect_power;
        setFlePower(total);
      });
      server.GET(server.api.consumption(server.Elem.dsp, device), (data) => {
        const total = data.total_dsp_block_power + data.total_dsp_interconnect_power;
        setDspPower(total);
      });
      server.GET(server.api.consumption(server.Elem.bram, device), (data) => {
        const total = data.total_bram_block_power + data.total_bram_interconnect_power;
        setBramPower(total);
      });
      server.GET(server.api.consumption(server.Elem.io, device), (data) => {
        const total = data.total_block_power
          + data.total_interconnect_power
          + data.total_on_die_termination_power;
        setIoPower(total);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  return (
    <div>
      <div className="app-main-container">
        <div className="top-container">
          <div className="top-l1">
            <DeviceList devices={devices} setDevice={setDevice} />
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
              <div className="clickable top-l2-col2-elem" onClick={() => setOpenedTable(Table.Memory)}>
                <MemoryComponent device={device} />
              </div>
            </div>
          </div>
        </div>
        <div className="power-tables pt-group">
          <div className="edit-line">
            <div className="grayed-text no-wrap">Last Edited</div>
            <div className="last-time"><Time value={time} format="MMM DD, YYYY hh:mm a" /></div>
            <div className="save-icon" onClick={() => setTime(new Date())}><FiSave /></div>
          </div>
          <input type="test" placeholder="Top level name" />
          <select>
            <option value="" disabled selected>HDL lang</option>
            <option value={0}>Verilog</option>
            <option value={1}>HDL</option>
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
              <Switch />
            </div>
            <div className="switch">Mode</div>
            <div className="notes"><PiNotepad /></div>
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
    </div>
  );
}

export default App;
