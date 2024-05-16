import React from 'react';
import { fixed } from '../utils/common';
import * as server from '../utils/serverAPI';
import { useSelection } from '../SelectionProvider';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { State } from './ComponentsLib';
import { useGlobalState } from '../GlobalStateProvider';

import './style/Peripherals.css';

function PeripheralsBlock({
  name, messages, power, percents,
}) {
  return (
    <State messages={messages} baseClass="periph-rowx">
      <div className="periph-internal-font-header">{name}</div>
      <div className="periph-internal">
        <div className="periph-internal-font">
          {fixed(power)}
          {' W'}
        </div>
        <div className="periph-internal-font">
          {fixed(percents, 0)}
          {' %'}
        </div>
      </div>
    </State>
  );
}

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
  const { totalConsumption } = useSocTotalPower();
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

  const peripherals = totalConsumption.processing_complex.dynamic.components.find((elem) => elem.type === 'peripherals');

  return (
    <div className={getClassName()}>
      <div className="periph-row-head">
        <div className="periph-title bold-text-title">{Title}</div>
        <div className="peripherals-power grayed-text">
          {fixed(peripherals ? peripherals.power : 0)}
          {' W'}
        </div>
        <div className=" peripherals-power grayed-text">
          {fixed(peripherals ? peripherals.percentage : 0, 0)}
          {' %'}
        </div>
      </div>
      <div className="periph-row">
        <PeripheralsBlock name="UART0" messages={socState.uart0} power={uart0} percents={100} />
        <PeripheralsBlock name="UART1" messages={socState.uart1} power={uart1} percents={100} />
        <PeripheralsBlock name="USB 2.0" messages={socState.usb2} power={usb2} percents={100} />
      </div>
      <div className="periph-row">
        <PeripheralsBlock name="I2C" messages={socState.i2c} power={i2c} percents={100} />
        <PeripheralsBlock name="GPIO" messages={socState.gpio} power={gpio} percents={100} />
        <PeripheralsBlock name="PWM" messages={socState.pwm} power={pwm} percents={100} />
      </div>
      <div className="periph-row">
        <PeripheralsBlock name="SPI/QSPI" messages={socState.spi} power={spi} percents={100} />
        <PeripheralsBlock name="JTAG" messages={socState.jtag} power={jtag} percents={100} />
        <PeripheralsBlock name="GigI" messages={socState.gige} power={gige} percents={100} />
      </div>
    </div>
  );
}

export default PeripheralsComponent;
