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
  const [gpio, setGPIO] = React.useState({ name: 'GPIO', power: 0 });
  const { selectedItem } = useSelection();
  const { totalConsumption } = useSocTotalPower();
  const { socState } = useGlobalState();
  const names = ['UART0', 'UART1', 'USB 2.0',
    'I2C', 'GPIO', 'PWM', 'SPI', 'JTAG', 'GigE'];
  const template = (index) => ({
    name: names[index], messages: [], power: 0, percents: 100, valid: false,
  });
  const length = 9;
  const dataDefault = Array.from({ length }, (_, index) => template(index));
  const [tableData, setTableData] = React.useState(dataDefault);

  function fetchPeripherals(deviceId, key, url, name) {
    server.GET(server.peripheralPath(deviceId, url), (data) => {
      if (key === 'i2c') {
        const newData = [...tableData];
        newData[3] = {
          name,
          power: data.consumption.block_power,
          messages: socState.i2c,
          percents: 100,
          valid: true,
        };
        setTableData(newData);
      }
      if (key === 'spi') {
        const newData = [...tableData];
        newData[6] = {
          name,
          power: data.consumption.block_power,
          messages: socState.spi,
          percents: 100,
          valid: true,
        };
        setTableData(newData);
      }
      if (key === 'pwm') {
        const newData = [...tableData];
        newData[5] = {
          name,
          power: data.consumption.block_power,
          messages: socState.pwm,
          percents: 100,
          valid: true,
        };
        setTableData(newData);
      }
      if (key === 'usb2') {
        const newData = [...tableData];
        newData[2] = {
          name,
          power: data.consumption.block_power,
          messages: socState.usb2,
          percents: 100,
          valid: true,
        };
        setTableData(newData);
      }
      if (key === 'jtag') {
        const newData = [...tableData];
        newData[7] = {
          name,
          power: data.consumption.block_power,
          messages: socState.jtag,
          percents: 100,
          valid: true,
        };
        setTableData(newData);
      }
      if (key === 'gige') {
        const newData = [...tableData];
        newData[8] = {
          name,
          power: data.consumption.block_power,
          messages: socState.gige,
          percents: 100,
          valid: true,
        };
        setTableData(newData);
      }
      if (key === 'uart') {
        if (data.index === 0) {
          const newData = [...tableData];
          newData[0] = {
            name,
            power: data.consumption.block_power,
            messages: socState.uart0,
            percents: 100,
            valid: true,
          };
          setTableData(newData);
        } else {
          const newData = [...tableData];
          newData[1] = {
            name,
            power: data.consumption.block_power,
            messages: socState.uart1,
            percents: 100,
            valid: true,
          };
          setTableData(newData);
        }
      }
      if (key === 'gpio') {
        const newData = [...tableData];
        newData[4] = {
          name,
          power: data.consumption.block_power + newData[4].power,
          messages: socState.gpio,
          percents: 100,
          valid: true,
        };
        setTableData(newData);
      }
    });
  }

  if (dev !== device) {
    setDev(device);
    if (device !== '') {
      setGPIO({ ...gpio, power: 0 });
      setTableData(dataDefault);
      server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
        data.forEach((entry) => {
          fetchPeripherals(device, entry.type, entry.href, entry.name);
        });
      });
    } else {
      setTableData(dataDefault);
    }
  }

  const Title = 'Peripherals';

  function getClassName() {
    return (selectedItem === Title) ? 'periph-top selected' : 'periph-top';
  }

  const peripherals = totalConsumption.processing_complex.dynamic.components.find((elem) => elem.type === 'peripherals');

  function getSlicedData(row) {
    let initValue = row * 3;
    const res = [];
    tableData.forEach((item) => {
      if (item.valid) {
        if (initValue !== 0) {
          initValue -= 1;
        } else if (res.length < 3) res.push(item);
      }
    });
    return res;
  }

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
      <PeripheralRow data={getSlicedData(0)} />
      <PeripheralRow data={getSlicedData(1)} />
      <PeripheralRow data={getSlicedData(2)} />
    </div>
  );
}

export default PeripheralsComponent;
