import React from "react";
// import "bootstrap/dist/css/bootstrap.css";
// import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import DeviceList from "./components/DeviceList"
import FpgaTable from "./components/FpgaTable"
import ClockingTable from "./components/ClockingTable";

const App = () => {
  const [devices, setDevices] = React.useState([]);
  const [device, setDevice] = React.useState([]);
  const [clocking, setClocking] = React.useState([]);
  const [clockingData, setClockingData] = React.useState([]);

  React.useEffect(() => {
    fetch("http://127.0.0.1:5000/devices")
      .then((response) => response.json())
      .then((data) => {
        setDevices(data);
      });
  }, []);


  const applyClockData = (deviceId) => {
    // fetch("http://127.0.0.1:5000/devices/" + deviceId + "/clocking/resources")
    //         .then((response) => response.json())
    //         .then((data) => {
    //             setClocking(data);
    //         });

    if (deviceId) {
      const consum = {
        "total_power": 0.002,
        "pll": {
          "total_power": 0.033
        }
      };
      setClocking(consum);

      fetch("http://127.0.0.1:5000/devices/" + deviceId + "/clocking")
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        setClockingData(data);
      });

    } else {
      setClocking({});
    }
  }

  const deleteRow = (index) => {
    setClockingData(clockingData.filter((_, idx) => idx !== index));
  }

  return (
    <><table className="main">
      <thead>
        <tr>
          <td colSpan={3}>
            <div className="top-level">
              <DeviceList devices={devices} applyClockData={applyClockData} id="device-selection"></DeviceList>
            </div>
          </td>
        </tr>
        <tr className="mainCell">
          <td className="mainCell">
            <button>ACPU</button>
          </td>
          <td className="fpgaCell" rowSpan={2}>
            <FpgaTable clocking={clocking.total_power}></FpgaTable>
          </td>
        </tr>
        <tr className="mainCell">
          <td className="mainCell">
            <button>Peripherals</button>
          </td>
        </tr>
      </thead>
    </table><ClockingTable data={clockingData} deleteRow={deleteRow}/></>
  );
}

export default App;