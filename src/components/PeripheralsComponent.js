import React from 'react';
import { Table, fixed, State } from '../utils/common';
import * as server from '../utils/serverAPI';

import './style/Peripherals.css';

function PeripheralsComponent({ setOpenedTable, device }) {
  const [i2c, setI2c] = React.useState(0);
  const [spi, setSpi] = React.useState(0);
  const [pwm, setPWM] = React.useState(0);
  const [usb2, setUsb2] = React.useState(0);
  const [jtag, setJtag] = React.useState(0);
  const [gige, setGige] = React.useState(0);
  const [uart0, setUart0] = React.useState(0);
  const [uart1, setUart1] = React.useState(0);
  const [gpio, setGPIO] = React.useState(0);
  const [power, setPower] = React.useState(0);

  function fetchPeripherals(deviceId, key, url) {
    server.GET(server.peripheralPath(deviceId, url), (data) => {
      if (key === 'i2c') setI2c(data.consumption.block_power);
      if (key === 'spi') setSpi(data.consumption.block_power);
      if (key === 'pwm') setPWM(data.consumption.block_power);
      if (key === 'usb2') setUsb2(data.consumption.block_power);
      if (key === 'jtag') setJtag(data.consumption.block_power);
      if (key === 'gige') setGige(data.consumption.block_power);
      if (key === 'uart') {
        if (url.slice(-1) === '0') setUart0(data.consumption.block_power);
        else setUart1(data.consumption.block_power);
      }
      if (key === 'gpio') setGPIO((prev) => prev + data.consumption.block_power);
    });
  }
  React.useEffect(() => {
    if (device !== null) {
      server.GET(server.api.consumption(server.Elem.peripherals, device), (data) => {
        setPower(data.total_peripherals_power);
      });
      setGPIO(0);
      server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const key of Object.keys(data)) {
          data[key].forEach((item) => fetchPeripherals(device, key, item.href));
        }
      });
    }
  }, [device]);

  const warn = 0.001; // TBD
  const error = 0.016; // TBD

  return (
    <div className="periph-top" onClick={() => setOpenedTable(Table.Peripherals)}>
      <div className="periph-row-head">
        <div>Peripherals</div>
        <div id="peripherals-power" className="grayed-text">
          {fixed(power)}
          {' W'}
        </div>
      </div>
      <div className="periph-row">
        <State refValue={uart0} warn={warn} err={error} baseClass="periph-rowx">
          <div className="periph-internal-font-header">UART0</div>
          <div className="periph-internal-font">
            {fixed(uart0)}
            {' W'}
          </div>
        </State>
        <State refValue={uart1} warn={warn} err={error} baseClass="periph-rowx">
          <div className="periph-internal-font-header">UART1</div>
          <div className="periph-internal-font">
            {fixed(uart1)}
            {' W'}
          </div>
        </State>
        <State refValue={usb2} warn={warn} err={error} baseClass="periph-rowx">
          <div className="periph-internal-font-header">USB 2.0</div>
          <div className="periph-internal-font">
            {fixed(usb2)}
            {' W'}
          </div>
        </State>
      </div>
      <div className="periph-row">
        <State refValue={i2c} warn={warn} err={error} baseClass="periph-rowx">
          <div className="periph-internal-font-header">I2C</div>
          <div className="periph-internal-font">
            {fixed(i2c)}
            {' W'}
          </div>
        </State>
        <State refValue={gpio} warn={warn} err={error} baseClass="periph-rowx">
          <div className="periph-internal-font-header">GPIO</div>
          <div className="periph-internal-font">
            {fixed(gpio)}
            {' W'}
          </div>
        </State>
        <State refValue={pwm} warn={warn} err={error} baseClass="periph-rowx">
          <div className="periph-internal-font-header">PWM</div>
          <div className="periph-internal-font">
            {fixed(pwm)}
            {' W'}
          </div>
        </State>
      </div>
      <div className="periph-row">
        <State refValue={spi} warn={warn} err={error} baseClass="periph-rowx">
          <div className="periph-internal-font-header">SPI/QSPI</div>
          <div className="periph-internal-font">
            {fixed(spi)}
            {' W'}
          </div>
        </State>
        <State refValue={jtag} warn={warn} err={error} baseClass="periph-rowx">
          <div className="periph-internal-font-header">JTAG</div>
          <div className="periph-internal-font">
            {fixed(jtag)}
            {' W'}
          </div>
        </State>
        <State refValue={gige} warn={warn} err={error} baseClass="periph-rowx">
          <div className="periph-internal-font-header">GigI</div>
          <div className="periph-internal-font">
            {fixed(gige)}
            {' W'}
          </div>
        </State>
      </div>
    </div>
  );
}

export default PeripheralsComponent;
