import React from "react";
import DeviceList from "./components/DeviceList"
import FpgaTable from "./components/FpgaTable"
import ClockingTable from "./components/ClockingTable";
import FleTable from "./components/FleTable";
import { Table } from "./assets/common"
import Peripherals from "./components/Peripherals";
import { clocking, fle, devices as getDeviceListApi } from "./assets/serverAPI"

const App = () => {
  const [devices, setDevices] = React.useState([]);
  const [device, setDevice] = React.useState(null);
  const [clockingPower, setClockingPower] = React.useState(0);
  const [flePower, setFlePower] = React.useState(0);
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
    }
  }, [device]);

  return (
    <div>
      <table className="main">
        <tbody>
          <tr>
            <td colSpan={3}>
              <DeviceList devices={devices} setDevice={setDevice} id="device-selection"></DeviceList>
            </td>
          </tr>
          <tr className="mainCell">
            <td className="mainCell fpga-table-btn" onClick={() => setOpenedTable(Table.ACPU)}>
              ACPU
            </td>
            <td className="mainCell fpga-table-btn" onClick={() => setOpenedTable(Table.BCPU)}>
              BCPU
            </td>
            <td className="mainCell">
              SOC
            </td>
            <td className="fpgaCell" rowSpan={2}>
              <FpgaTable clocking={clockingPower} fle={flePower} tableOpen={setOpenedTable}></FpgaTable>
            </td>
          </tr>
          <tr>
            <td className="secCell" colSpan={3}>
              <div>
                <div className="fpga-table-btn" style={{ display: 'inline', border: '1px solid', width: '50%', height: '100%' }} onClick={() => setOpenedTable(Table.DMA)}>DMA</div>
                <div className="fpga-table-btn" style={{ display: 'inline', border: '1px solid', width: '50%', height: '100%' }} onClick={() => setOpenedTable(Table.Connectivity)}>Connectivity</div>
              </div>
            </td>
          </tr>
          <tr className="mainCell">
            <td className="mainCell fpga-table-btn" colSpan={3}>
              <Peripherals onClick={() => setOpenedTable(Table.Peripherals)} />
            </td>
            <td className="fpga-table-btn" onClick={() => setOpenedTable(Table.Memory)}>
              Memory
            </td>
          </tr>
        </tbody>
      </table>
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
        <label>BRAM table</label>
      }
      {
        openedTable === Table.DSP &&
        <label>DSP table</label>
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
