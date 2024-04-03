import * as React from 'react';
import * as server from '../utils/serverAPI';
import { useSelection } from '../SelectionProvider';
import './style/DeviceList.css';

function DeviceList({ devices, setDevice }) {
  const [deviceInfo, setDeviceInfo] = React.useState({});
  const { selectedItem } = useSelection();
  const [selectedDevice, setSelectedDevice] = React.useState('selectDev');

  function getDeviceInfo(id) {
    server.GET(server.deviceInfo(id), (data) => setDeviceInfo(data));
  }

  function DeviceOnChange(event) {
    const deviceId = event.target.value;
    setSelectedDevice(deviceId);
    getDeviceInfo(deviceId);
    setDevice(deviceId);
  }

  function getBaseName() {
    return (selectedItem === 'Summary') ? 'dev-table selected' : 'dev-table';
  }

  return (
    <div className="dev-table-container">
      <div className={getBaseName()}>
        <div className="dev-table-res">
          <div id="inner1">
            <label>Device:</label>
          </div>
          <select
            id="deviceId"
            className="dev-selector"
            onChange={DeviceOnChange}
            value={selectedDevice}
          >
            <option key="" value="selectDev" disabled>
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
        <div className="dev-table-res">
          <div>
            <div className="devLabel">
              <label>Logic Density</label>
            </div>
          </div>
          <div>
            <div id="inner1">
              <label>{deviceInfo.logic_density || '(n/a)'}</label>
            </div>
          </div>
          <div>
            <div className="devLabel">
              <label>Package</label>
            </div>
          </div>
          <div>
            <div id="inner1">
              <label>{deviceInfo.package || '(n/a)'}</label>
            </div>
          </div>
          <div>
            <div className="devLabel">
              <label>Speedgrade</label>
            </div>
          </div>
          <div>
            <div id="inner1">
              <label>{deviceInfo.speedgrade || '(n/a)'}</label>
            </div>
          </div>
          <div>
            <div className="devLabel">
              <label>Temp Grade</label>
            </div>
          </div>
          <div>
            <div id="inner1">
              <label>{deviceInfo.temperature_grade || '(n/a)'}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeviceList;
