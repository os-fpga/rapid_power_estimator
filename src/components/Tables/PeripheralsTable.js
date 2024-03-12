import React from 'react';
import PeripheralsModal from '../ModalWindows/PeripheralsModal';
import * as server from '../../utils/serverAPI';
import { fixed } from '../../utils/common';
import { PowerCell, SelectionCell } from './TableCells';
import { TableBase, Actions, Checkbox } from './TableBase';
import * as per from '../../utils/peripherals';
import { publish } from '../../utils/events';

import '../style/ComponentTable.css';

function PeripheralsTable({ device }) {
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [peripherals, setPeripherals] = React.useState([]);

  const [allComponents, setAllComponents] = React.useState([]);

  const mainTableHeader = [
    '', '', 'Usage', 'Performance', 'Bandwidth', 'Block Power', '%', 'Action',
  ];

  const elements = [
    {
      id: 'spi',
      usage: per.spi.usage,
      performance: per.spi.clock_frequency,
    },
    {
      id: 'jtag',
      usage: per.jtag.usage,
      performance: per.jtag.clock_frequency,
    },
    {
      id: 'i2c',
      usage: per.i2c.usage,
      performance: per.i2c.clock_frequency,
    },
    {
      id: 'uart',
      usage: per.uart.usage,
      performance: per.uart.baudrate,
    },
    {
      id: 'usb2',
      usage: per.usb2.usage,
      performance: per.usb2.bit_rate,
    },
    {
      id: 'gige',
      usage: per.gige.usage,
      performance: per.gige.bit_rate,
    },
    {
      id: 'gpio',
      usage: per.gpioPwm.usage,
      performance: per.gpioPwm.io_standard,
    },
    {
      id: 'pwm',
      usage: per.gpioPwm.usage,
      performance: per.gpioPwm.io_standard,
    },
  ];

  function peripheralMatch(component, data, url) {
    setAllComponents((oldValues) => [...oldValues, { id: component, url, data }]);
  }

  function fetchPeripherals(deviceId, key, url) {
    server.GET(
      server.peripheralPath(deviceId, url),
      (data) => peripheralMatch(key, data, url),
    );
  }

  const fetchData = (deviceId) => {
    if (deviceId !== null) {
      setAllComponents([]);
      server.GET(server.api.fetch(server.Elem.peripherals, deviceId), (data) => {
        const peripheralData = data;
        delete peripheralData.dma;
        delete peripheralData.memory;
        delete peripheralData.acpu;
        delete peripheralData.bcpu;
        Object.entries(peripheralData).forEach((elem) => {
          const [key, values] = elem;
          Object.entries(values).forEach((val) => {
            const [, obj] = val;
            fetchPeripherals(deviceId, key, obj.href);
          });
        });
      });
    }
  };

  React.useEffect(() => {
    if (device !== null) fetchData(device);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  function getPerformance(object) {
    if (object.clock_frequency) return object.clock_frequency;
    if (object.baudrate) return object.baudrate;
    if (object.bit_rate) return object.bit_rate;
    if (object.io_standard) return object.io_standard;
    return 0;
  }

  function toTableObject(object, elem, url) {
    const found = elements.find((item) => item.id === elem);
    return {
      id: elem,
      url,
      // eslint-disable-next-line no-nested-ternary
      enable: Object.prototype.hasOwnProperty.call(object, 'enable') ? (object.enable ? 1 : 0) : 3,
      name: object.name,
      usage: object.usage,
      usage_values: found.usage,
      performance: getPerformance(object),
      performance_values: found.performance,
      calculated_bandwidth: object.consumption ? object.consumption.calculated_bandwidth : 0,
      block_power: object.consumption ? object.consumption.block_power : 0,
      percentage: object.consumption ? object.consumption.percentage : 0,
    };
  }

  React.useEffect(() => {
    if (device !== null) {
      const data = [];
      const tmp = allComponents;
      // sort for corrrect table order since we receive data async
      tmp.sort((a, b) => {
        if (a.id === b.id) {
          const aId = a.url.slice(-1);
          const bId = b.url.slice(-1);
          return aId - bId;
        }
        return elements.indexOf(elements.find((elem) => elem.id === a.id))
          - elements.indexOf(elements.find((elem) => elem.id === b.id));
      });
      elements.forEach((i) => {
        tmp.forEach((elem) => {
          if (elem.id === i.id) {
            data.push(toTableObject(elem.data, elem.id, elem.url));
          }
        });
      });
      setPeripherals(data);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allComponents]);

  function modifyRow(index, row) {
    let data = {};
    if (row.id === 'i2c' || row.id === 'spi' || row.id === 'jtag') {
      data = {
        usage: row.usage,
        clock_frequency: row.performance,
      };
    } else if (row.id === 'uart') {
      data = {
        usage: row.usage,
        baudrate: row.performance,
      };
    } else if (row.id === 'usb2' || row.id === 'gige') {
      data = {
        usage: row.usage,
        bit_rate: row.performance,
      };
    } else if (row.id === 'gpio' || row.id === 'pwm') {
      data = {
        usage: row.usage,
        io_standard: row.performance,
      };
    } else return;
    server.PATCH(server.peripheralPath(device, row.url), data, () => {
      fetchData(device);
      publish('peripheralsChanged');
    });
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
  };

  function enableChanged(index, state) {
    const data = {
      enable: state,
    };
    server.PATCH(server.peripheralPath(device, peripherals[index].url), data, () => {
      fetchData(device);
      publish('peripheralsChanged');
    });
  }

  return (
    <div className="component-table-head">
      <div className="main-block">
        <div className="layout-head">
          <label>FPGA &gt; Peripherals</label>
        </div>
        <TableBase
          header={mainTableHeader}
          data={
            peripherals.map((row, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <tr key={index}>
                <td>
                  <Checkbox
                    disabled={row.enable === 3}
                    isChecked={row.enable === 3 ? true : row.enable}
                    label=""
                    checkHandler={(state) => enableChanged(index, state)}
                    id={index}
                  />
                </td>
                <td className="innerHeader">{row.name}</td>
                <SelectionCell val={row.usage} values={row.usage_values} />
                <SelectionCell val={row.performance} values={row.performance_values} />
                <td>
                  {row.calculated_bandwidth}
                  {' MB/s'}
                </td>
                <PowerCell val={row.block_power} />
                <td>
                  {fixed(parseFloat(row.percentage), 0)}
                  {' %'}
                </td>
                <Actions
                  onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                />
              </tr>
            ))
          }
        />
        {modalOpen && (
          <PeripheralsModal
            closeModal={() => {
              setModalOpen(false);
              setEditIndex(null);
            }}
            onSubmit={handleSubmit}
            defaultValue={(editIndex !== null && peripherals[editIndex])
              || {
                enable: true,
                name: '',
                usage: 0,
                usage_values: [],
                performance: 0,
                performance_values: [],
                calculated_bandwidth: 0,
                block_power: 0,
                percentage: 0,
              }}
          />
        )}
      </div>
    </div>
  );
}

export default PeripheralsTable;
