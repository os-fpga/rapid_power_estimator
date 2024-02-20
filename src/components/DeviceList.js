import * as React from 'react';
import * as api from "./../assets/serverAPI"

import "./style/DeviceList.css"

function DeviceList({devices, setDevice}) {
  const [deviceInfo, setDeviceInfo] = React.useState({});

  function get_device_info(id) {
    fetch(api.deviceInfo(id))
      .then((response) => response.json())
      .then((data) => {
        setDeviceInfo(data);
      });
  }

  function Device_OnChange(event) {
    const deviceId = event.target.value;
    get_device_info(deviceId);
    setDevice(deviceId);
  }

  return (
    <table className='dev-table'>
      <thead>
        <tr>
          <td><div id="inner1">
            <label>Device:</label>
          </div></td>
          <td>
          <div className="col-md-6">
          <select
            id="deviceId"
            className="dev-selector"
            onChange={Device_OnChange}
          >
            <option key="" value="">
              Select a device...
            </option>
            {devices.map((data, index) => (
              <option key={data.id} value={data.id}>
                {data.id} ({data.series})
              </option>
            ))}
          </select>
        </div>
          </td>
          <td><div className="devLabel">
            <label>Logic Density</label>
          </div></td>
          <td><div id="inner1">
            <label>{deviceInfo.logic_density || "(n/a)"}</label>
          </div></td>
          <td><div className="devLabel">
            <label>Package</label>
          </div></td>
          <td><div id="inner1">
            <label>{deviceInfo.package || "(n/a)"}</label>
          </div></td>
          <td><div className="devLabel">
            <label>Speedgrade</label>
          </div></td>
          <td><div id="inner1">
            <label>{deviceInfo.speedgrade || "(n/a)"}</label>
          </div></td>
          <td><div className="devLabel">
            <label>Temp Grade</label>
          </div></td>
          <td><div id="inner1">
            <label>{deviceInfo.temperature_grade || "(n/a)"}</label>
          </div></td>
        </tr>
      </thead>
    </table>
  );
};

export default DeviceList;