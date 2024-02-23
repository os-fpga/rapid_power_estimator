import React from "react";
import DeviceList from "./components/DeviceList"
import FpgaTable from "./components/Tables/FpgaTable"
import ClockingTable from "./components/Tables/ClockingTable";
import FleTable from "./components/Tables/FleTable";
import DspTable from "./components/Tables/DspTable";
import BramTable from "./components/Tables/BramTable";
import { Table } from "./utils/common"
import Peripherals from "./components/Peripherals";
import { clocking, fle, dsp, bram, devices as getDeviceListApi } from "./utils/serverAPI"
import CPUComponent from "./components/CPUComponent";

const App = () => {
  const [devices, setDevices] = React.useState([]);
  const [device, setDevice] = React.useState(null);
  const [clockingPower, setClockingPower] = React.useState(0);
  const [flePower, setFlePower] = React.useState(0);
  const [dspPower, setDspPower] = React.useState(0);
  const [bramPower, setBramPower] = React.useState(0);
  const [openedTable, setOpenedTable] = React.useState(Table.Clocking);

  React.useEffect(() => {
    fetch(getDeviceListApi)
      .then((response) => response.json())
      .then((data) => {
        setDevices(data);
      });
  }, []);

  React.useEffect(() => {
    if (device !== null) {
      fetch(clocking.consumption(device))
        .then((response) => response.json())
        .then((data) => {
          const total = data.total_clock_block_power + data.total_clock_interconnect_power + data.total_pll_power;
          setClockingPower(total);
        });
      fetch(fle.consumption(device))
        .then((response) => response.json())
        .then((data) => {
          const total = data.total_block_power + data.total_interconnect_power;
          setFlePower(total);
        });
      fetch(dsp.consumption(device))
        .then((response) => response.json())
        .then((data) => {
          const total = data.total_dsp_block_power + data.total_dsp_interconnect_power;
          setDspPower(total);
        });
      fetch(bram.consumption(device))
        .then((response) => response.json())
        .then((data) => {
          const total = data.total_bram_block_power + data.total_bram_interconnect_power;
          setBramPower(total);
        });
    }
  }, [device]);

  return (
    <div>
      <div className="app-main-container">
        <div className="top-container">
          <div className="top-l1">
            <DeviceList devices={devices} setDevice={setDevice} />
          </div>
          <div className="top-l2">
            <div className="top-l2-col1">
              <div className="top-l2-col1-row1">
                <div className="top-l2-col1-row1-elem clickable" onClick={() => setOpenedTable(Table.ACPU)}><CPUComponent name={"ACPU"} /></div>
                <div className="top-l2-col1-row1-elem clickable" onClick={() => setOpenedTable(Table.BCPU)}><CPUComponent name={"BCPU"} /></div>
                <div className="top-l2-col1-row1-elem">SOC</div>
              </div>
              <div className="top-l2-col1-row2">
                <div className="top-l2-col1-row2-elem clickable" onClick={() => setOpenedTable(Table.DMA)}>DMA</div>
                <div className="top-l2-col1-row2-elem clickable" onClick={() => setOpenedTable(Table.Connectivity)}>Connectivity</div>
              </div>
              <Peripherals setOpenedTable={setOpenedTable} />
            </div>
            <div className="top-l2-col2">
              <div className="top-l2-col2-elem"><FpgaTable
                clocking={clockingPower}
                fle={flePower}
                dsp={dspPower}
                bram={bramPower}
                tableOpen={setOpenedTable} />
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
      <div className="hspacer"></div>
      {
        openedTable === Table.Clocking &&
        <ClockingTable device={device} totalPowerCallback={setClockingPower} />
      }
      {
        openedTable === Table.FLE &&
        <FleTable device={device} totalPowerCallback={setFlePower} />
      }
      {
        openedTable === Table.IO &&
        <label>IO table</label>
      }
      {
        openedTable === Table.BRAM &&
        <BramTable device={device} totalPowerCallback={setBramPower} />
      }
      {
        openedTable === Table.DSP &&
        <DspTable device={device} totalPowerCallback={setDspPower} />
      }
      {
        openedTable === Table.ACPU &&
        <label>ACPU table</label>
      }
      {
        openedTable === Table.BCPU &&
        <label>BCPU table</label>
      }
      {
        openedTable === Table.Connectivity &&
        <label>Connectivity table</label>
      }
      {
        openedTable === Table.Memory &&
        <label>Memory table</label>
      }
      {
        openedTable === Table.DMA &&
        <label>DMA table</label>
      }
      {
        openedTable === Table.Peripherals &&
        <label>Peripherals table</label>
      }
    </div>
  );
}

export default App;
