import React from "react";
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
    setDevice(deviceId)
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
        setClockingData(data);
      });

    } else {
      setClocking({});
    }
  }

  const deleteRow = (index) => {
    const url =
      "http://127.0.0.1:5000/devices/" + device + "/clocking/" + index;
    fetch(url, {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
        applyClockData(device);
      }
    });
  }

  function addRow(newData) {
    const url = "http://127.0.0.1:5000/devices/" + device + "/clocking";
    let data = {
      description: newData.description,
      port: newData.port,
      source: parseInt(newData.source, 10),
      frequency: newData.frequency,
      state: parseInt(newData.state)
    };
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.ok) {
        applyClockData(device);
      }
    });
  }

  function modifyRow(index, row) {
    const url =
        "http://127.0.0.1:5000/devices/" + device + "/clocking/" + index;
      let data = {};
      console.log(row);
      data["description"] = row.description;
      data["source"] = parseInt(row.source, 10);
      data["port"] = row.port;
      data["frequency"] = row.frequency;
      data["state"] = parseInt(row.state, 10);
      fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((response) => {
        if (response.ok) {
          applyClockData(device);
        } else {
          //
        }
      });
  }

  return (
    <div className="App">
    <table className="main">
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
    </table>
    <ClockingTable data={clockingData} deleteRow={deleteRow} addRow={addRow} modifyRow={modifyRow}/>
    </div>
  );
}

export default App;