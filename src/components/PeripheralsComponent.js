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

function PeripheralsNoBlock() {
  return (
    <div className="periph-rowx-empty" />
  );
}

function PeripheralRow({ data, size = 3 }) {
  return (
    <div className="periph-row">
      {
        data.map((item, index) => (
          <PeripheralsBlock
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            name={item.name}
            messages={item.messages}
            power={item.power}
            percents={item.percents}
          />
        ))
      }
      {
        // eslint-disable-next-line react/no-array-index-key
        Array.apply(0, Array(size - data.length)).map((x, i) => <PeripheralsNoBlock key={i} />)
      }
    </div>
  );
}

function PeripheralsComponent({ device }) {
  const [dev, setDev] = React.useState(null);
  const [i2c, setI2c] = React.useState({ name: 'I2C', power: 0 });
  const [spi, setSpi] = React.useState({ name: 'SPI', power: 0 });
  const [pwm, setPWM] = React.useState({ name: 'PWM', power: 0 });
  const [usb2, setUsb2] = React.useState({ name: 'USB 2.0', power: 0 });
  const [jtag, setJtag] = React.useState({ name: 'JTAG', power: 0 });
  const [gige, setGige] = React.useState({ name: 'GigE', power: 0 });
  const [uart0, setUart0] = React.useState({ name: 'UART0', power: 0 });
  const [uart1, setUart1] = React.useState({ name: 'UART1', power: 0 });
  const [gpio, setGPIO] = React.useState({ name: 'GPIO', power: 0 });
  const { selectedItem } = useSelection();
  const { totalConsumption } = useSocTotalPower();
  const { socState } = useGlobalState();

  function fetchPeripherals(deviceId, key, url, name) {
    server.GET(server.peripheralPath(deviceId, url), (data) => {
      if (key === 'i2c') setI2c({ name, power: data.consumption.block_power });
      if (key === 'spi') setSpi({ name, power: data.consumption.block_power });
      if (key === 'pwm') setPWM({ name, power: data.consumption.block_power });
      if (key === 'usb2') setUsb2({ name, power: data.consumption.block_power });
      if (key === 'jtag') setJtag({ name, power: data.consumption.block_power });
      if (key === 'gige') setGige({ name, power: data.consumption.block_power });
      if (key === 'uart') {
        if (data.index === 0) setUart0({ name, power: data.consumption.block_power });
        else setUart1({ name, power: data.consumption.block_power });
      }
      if (key === 'gpio') setGPIO((prev) => ({ ...prev, power: data.consumption.block_power + 1 }));
    });
  }

  if (dev !== device) {
    setDev(device);
    if (device !== null) {
      setGPIO({ ...gpio, power: 0 });
      server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
        data.forEach((entry) => {
          fetchPeripherals(device, entry.type, entry.href, entry.name);
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
      <PeripheralRow
        data={[{
          name: uart0.name, messages: socState.uart0, power: uart0.power, percents: 100,
        },
        {
          name: uart1.name, messages: socState.uart1, power: uart1.power, percents: 100,
        },
        {
          name: usb2.name, messages: socState.usb2, power: usb2.power, percents: 100,
        },
        ]}
      />
      <PeripheralRow
        data={[{
          name: i2c.name, messages: socState.i2c, power: i2c.power, percents: 100,
        },
        {
          name: gpio.name, messages: socState.gpio, power: gpio.power, percents: 100,
        },
        {
          name: pwm.name, messages: socState.pwm, power: pwm.power, percents: 100,
        },
        ]}
      />
      <PeripheralRow
        data={[{
          name: spi.name, messages: socState.spi, power: spi.power, percents: 100,
        },
        {
          name: jtag.name, messages: socState.jtag, power: jtag.power, percents: 100,
        },
        {
          name: gige.name, messages: socState.gige, power: gige.power, percents: 100,
        },
        ]}
      />
    </div>
  );
}

export default PeripheralsComponent;
