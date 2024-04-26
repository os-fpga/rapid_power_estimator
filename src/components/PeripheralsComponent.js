import React from 'react';
import { fixed, percentage } from '../utils/common';
import * as server from '../utils/serverAPI';
import { useSelection } from '../SelectionProvider';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { State } from './ComponentsLib';
import { useGlobalState } from '../GlobalStateProvider';

import './style/Peripherals.css';

function PeripheralsComponent({ device }) {
  const [dev, setDev] = React.useState(null);
  const [i2c, setI2c] = React.useState(0);
  const [spi, setSpi] = React.useState(0);
  const [pwm, setPWM] = React.useState(0);
  const [usb2, setUsb2] = React.useState(0);
  const [jtag, setJtag] = React.useState(0);
  const [gige, setGige] = React.useState(0);
  const [uart0, setUart0] = React.useState(0);
  const [uart1, setUart1] = React.useState(0);
  const [gpio, setGPIO] = React.useState(0);
  const { selectedItem } = useSelection();
  const { power, dynamicPower } = useSocTotalPower();
  const { socState } = useGlobalState();

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

  if (dev !== device) {
    setDev(device);
    if (device !== null) {
      setGPIO(0);
      server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
        Object.entries(data).forEach((entry) => {
          const [key, element] = entry;
          element.forEach((refObj) => fetchPeripherals(device, key, refObj.href));
        });
      });
    }
  }

  const Title = 'Peripherals';

  function getClassName() {
    return (selectedItem === Title) ? 'periph-top selected' : 'periph-top';
  }

  return (
    <div className={getClassName()}>
      <div className="periph-row-head">
        <div className="periph-title bold-text-title">{Title}</div>
        <div className="peripherals-power grayed-text">
          {fixed(power.total_peripherals_power)}
          {' W'}
        </div>
        <div className=" peripherals-power grayed-text">
          {percentage(power.total_peripherals_power, dynamicPower)}
          {' %'}
        </div>
      </div>
      <div className="periph-row">
        <State messages={socState.uart0} baseClass="periph-rowx">
          <div className="periph-internal-font-header">UART0</div>
          <div className="periph-internal">
            <div className="periph-internal-font">
              {fixed(uart0)}
              {' W'}
            </div>
            <div className="periph-internal-font">
              {fixed(100, 0)}
              {' %'}
            </div>
          </div>
        </State>
        <State messages={socState.uart1} baseClass="periph-rowx">
          <div className="periph-internal-font-header">UART1</div>
          <div className="periph-internal">
            <div className="periph-internal-font">
              {fixed(uart1)}
              {' W'}
            </div>
            <div className="periph-internal-font">
              {fixed(100, 0)}
              {' %'}
            </div>
          </div>
        </State>
        <State messages={socState.usb2} baseClass="periph-rowx">
          <div className="periph-internal-font-header">USB 2.0</div>
          <div className="periph-internal">
            <div className="periph-internal-font">
              {fixed(usb2)}
              {' W'}
            </div>
            <div className="periph-internal-font">
              {fixed(100, 0)}
              {' %'}
            </div>
          </div>
        </State>
      </div>
      <div className="periph-row">
        <State messages={socState.i2c} baseClass="periph-rowx">
          <div className="periph-internal-font-header">I2C</div>
          <div className="periph-internal">
            <div className="periph-internal-font">
              {fixed(i2c)}
              {' W'}
            </div>
            <div className="periph-internal-font">
              {fixed(100, 0)}
              {' %'}
            </div>
          </div>
        </State>
        <State messages={socState.gpio} baseClass="periph-rowx">
          <div className="periph-internal-font-header">GPIO</div>
          <div className="periph-internal">
            <div className="periph-internal-font">
              {fixed(gpio)}
              {' W'}
            </div>
            <div className="periph-internal-font">
              {fixed(100, 0)}
              {' %'}
            </div>
          </div>
        </State>
        <State messages={socState.pwm} baseClass="periph-rowx">
          <div className="periph-internal-font-header">PWM</div>
          <div className="periph-internal">
            <div className="periph-internal-font">
              {fixed(pwm)}
              {' W'}
            </div>
            <div className="periph-internal-font">
              {fixed(100, 0)}
              {' %'}
            </div>
          </div>
        </State>
      </div>
      <div className="periph-row">
        <State messages={socState.spi} baseClass="periph-rowx">
          <div className="periph-internal-font-header">SPI/QSPI</div>
          <div className="periph-internal">
            <div className="periph-internal-font">
              {fixed(spi)}
              {' W'}
            </div>
            <div className="periph-internal-font">
              {fixed(100, 0)}
              {' %'}
            </div>
          </div>
        </State>
        <State messages={socState.jtag} baseClass="periph-rowx">
          <div className="periph-internal-font-header">JTAG</div>
          <div className="periph-internal">
            <div className="periph-internal-font">
              {fixed(jtag)}
              {' W'}
            </div>
            <div className="periph-internal-font">
              {fixed(100, 0)}
              {' %'}
            </div>
          </div>
        </State>
        <State messages={socState.gige} baseClass="periph-rowx">
          <div className="periph-internal-font-header">GigI</div>
          <div className="periph-internal">
            <div className="periph-internal-font">
              {fixed(gige)}
              {' W'}
            </div>
            <div className="periph-internal-font">
              {fixed(100, 0)}
              {' %'}
            </div>
          </div>
        </State>
      </div>
    </div>
  );
}

export default PeripheralsComponent;
