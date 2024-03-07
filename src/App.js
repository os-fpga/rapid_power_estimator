import React from 'react';
import DeviceList from './components/DeviceList';
import FpgaTable from './components/Tables/FpgaTable';
import ClockingTable from './components/Tables/ClockingTable';
import FleTable from './components/Tables/FleTable';
import DspTable from './components/Tables/DspTable';
import BramTable from './components/Tables/BramTable';
import IOTable from './components/Tables/IOTable';
import ACPUTable from './components/Tables/ACPUTable';
import BCPUTable from './components/Tables/BCPUTable';
import DMATable from './components/Tables/DMATable';
import { Table } from './utils/common';
import PeripheralsTable from './components/Tables/PeripheralsTable';
import * as server from './utils/serverAPI';
import SOCTable from './components/Tables/SOCTable';

function App() {
  const [devices, setDevices] = React.useState([]);
  const [device, setDevice] = React.useState(null);
  const [clockingPower, setClockingPower] = React.useState(0);
  const [flePower, setFlePower] = React.useState(0);
  const [dspPower, setDspPower] = React.useState(0);
  const [bramPower, setBramPower] = React.useState(0);
  const [ioPower, setIoPower] = React.useState(0);
  const [socPower, setSOCPower] = React.useState({
    acpu: 0,
    bcpu: 0,
    peripherals: 0,
    dma: 0,
    interconnect: 0,
    memory: 0,
  });
  const [openedTable, setOpenedTable] = React.useState(Table.Clocking);
  const [acpuState, setAcpuState] = React.useState(false);
  const [bcpuState, setBcpuState] = React.useState(false);
  const [dmaState, setDmaState] = React.useState(false);

  React.useEffect(() => server.GET(server.devices, setDevices), []);

  const updateSocPower = React.useCallback(() => {
    if (device !== null) {
      server.GET(server.api.consumption(server.Elem.peripherals, device), (data) => {
        setSOCPower({
          acpu: data.total_acpu_power,
          bcpu: data.total_bcpu_power,
          peripherals: data.total_peripherals_power,
          dma: data.total_dma_power,
          interconnect: data.total_noc_interconnect_power,
          memory: data.total_memory_power,
        });
      });
    }
  }, [device]);

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
      updateSocPower();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  function onACPUDataChanged() {
    // toggle data changed
    setAcpuState((prev) => !prev);
  }

  function onBCPUDataChanged() {
    // toggle data changed
    setBcpuState((prev) => !prev);
  }

  const onDMADataChanged = React.useCallback(() => {
    // toggle data changed
    setDmaState((prev) => !prev);
    updateSocPower();
  }, [setDmaState, updateSocPower]);

  return (
    <div>
      <div className="app-main-container">
        <div className="top-container">
          <div className="top-l1">
            <DeviceList devices={devices} setDevice={setDevice} />
          </div>
          <div className="top-l2">
            <SOCTable
              device={device}
              setOpenedTable={setOpenedTable}
              power={socPower}
              acpuStateChanged={acpuState}
              bcpuStateChanged={bcpuState}
              dmaStateChanged={dmaState}
            />
            <div className="top-l2-col2">
              <div className="top-l2-col2-elem">
                <FpgaTable
                  clocking={clockingPower}
                  fle={flePower}
                  dsp={dspPower}
                  bram={bramPower}
                  io={ioPower}
                  tableOpen={setOpenedTable}
                />
              </div>
              <div className="clickable top-l2-col2-elem" onClick={() => setOpenedTable(Table.Memory)}>Memory</div>
            </div>
          </div>
        </div>
        <div className="power-tables">
          <div className="placeholder">placeholder</div>
          <div className="placeholder">FPGA Complex and Core Power (placeholder)</div>
        </div>
        <div className="power-tables">
          <div className="placeholder">placeholder</div>
          <div className="placeholder">Processing Complex (SOC) Power (placeholder)</div>
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
        // eslint-disable-next-line react/jsx-no-bind
        && <ACPUTable device={device} onDataChanged={onACPUDataChanged} />
      }
      {
        openedTable === Table.BCPU
        // eslint-disable-next-line react/jsx-no-bind
        && <BCPUTable device={device} onDataChanged={onBCPUDataChanged} />
      }
      {
        openedTable === Table.Connectivity
        && <label>Connectivity table</label>
      }
      {
        openedTable === Table.Memory
        && <label>Memory table</label>
      }
      {
        openedTable === Table.DMA
        && (
          <DMATable
            device={device}
            onDataChanged={onDMADataChanged}
          />
        )
      }
      {
        openedTable === Table.Peripherals
        && <PeripheralsTable device={device} totalPowerCallback={updateSocPower} />
      }
    </div>
  );
}

export default App;
