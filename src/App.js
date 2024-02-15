import React from "react";
import DeviceList from "./components/DeviceList"
import FpgaTable from "./components/FpgaTable"
import ClockingTable from "./components/ClockingTable";
import { Table } from "./assets/common"

const App = () => {
  const [devices, setDevices] = React.useState([]);
  const [device, setDevice] = React.useState(null);
  const [clockingPower, setClockingPower] = React.useState(0);
  const [openedTable, setOpenedTable] = React.useState(Table.Clocking);

  React.useEffect(() => {
    fetch("http://127.0.0.1:5000/devices")
      .then((response) => response.json())
      .then((data) => {
        setDevices(data);
      });
  }, []);

  return (
    <div className="App">
    <table className="main">
      <thead>
        <tr>
          <td colSpan={3}>
            <div className="top-level">
              <DeviceList devices={devices} setDevice={setDevice} id="device-selection"></DeviceList>
            </div>
          </td>
        </tr>
        <tr className="mainCell">
          <td className="mainCell">
            <button>ACPU</button>
          </td>
          <td className="fpgaCell" rowSpan={2}>
            <FpgaTable clocking={clockingPower} tableOpen={setOpenedTable}></FpgaTable>
          </td>
        </tr>
        <tr className="mainCell">
          <td className="mainCell">
            <button>Peripherals</button>
          </td>
        </tr>
      </thead>
    </table>
    {
      openedTable === Table.Clocking &&
      <ClockingTable device={device} totalPowerCallback={setClockingPower}/>
    }
    {
      openedTable === Table.FLE &&
      <label>FLE table</label>
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
      // TBD
    }
    </div>
  );
}

export default App;
