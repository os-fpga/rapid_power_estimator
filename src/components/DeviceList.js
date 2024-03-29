import * as React from 'react';
import * as server from '../utils/serverAPI';

import './style/DeviceList.css';

function DeviceList({ devices, setDevice }) {
  const [deviceInfo, setDeviceInfo] = React.useState({});

  function getDeviceInfo(id) {
    server.GET(server.deviceInfo(id), (data) => setDeviceInfo(data));
  }

  function DeviceOnChange(event) {
    const deviceId = event.target.value;
    getDeviceInfo(deviceId);
    setDevice(deviceId);
  }

  return (
    <div className="dev-table-container">
      <table className="dev-table">
        <thead>
          <tr>
            <td>
              <div id="inner1">
                <label>Device:</label>
              </div>
            </td>
            <td>
              <div className="col-md-6">
                <select
                  id="deviceId"
                  className="dev-selector"
                  onChange={DeviceOnChange}
                >
                  <option key="" value="">
                    Select a device...
                  </option>
                  {devices.map((data) => (
                    <option key={data.id} value={data.id}>
                      {data.id}
                      {' '}
                      {data.series}
                    </option>
                  ))}
                </select>
              </div>
            </td>
            <td>
              <div className="devLabel">
                <label>Logic Density</label>
              </div>
            </td>
            <td>
              <div id="inner1">
                <label>{deviceInfo.logic_density || '(n/a)'}</label>
              </div>
            </td>
            <td>
              <div className="devLabel">
                <label>Package</label>
              </div>
            </td>
            <td>
              <div id="inner1">
                <label>{deviceInfo.package || '(n/a)'}</label>
              </div>
            </td>
            <td>
              <div className="devLabel">
                <label>Speedgrade</label>
              </div>
            </td>
            <td>
              <div id="inner1">
                <label>{deviceInfo.speedgrade || '(n/a)'}</label>
              </div>
            </td>
            <td>
              <div className="devLabel">
                <label>Temp Grade</label>
              </div>
            </td>
            <td>
              <div id="inner1">
                <label>{deviceInfo.temperature_grade || '(n/a)'}</label>
              </div>
            </td>
          </tr>
        </thead>
      </table>
    </div>
  );
}

export default DeviceList;
