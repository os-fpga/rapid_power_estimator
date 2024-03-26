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
  const [peripherals, setPeripherals] = React.useState([
    {
      id: 'spi',
      usage: per.spi.usage,
      performance: per.spi.clock_frequency,
      performance_id: 'clock_frequency',
      url: '',
      data: [],
    },
    {
      id: 'jtag',
      usage: per.jtag.usage,
      performance: per.jtag.clock_frequency,
      performance_id: 'clock_frequency',
      url: '',
      data: [],
    },
    {
      id: 'i2c',
      usage: per.i2c.usage,
      performance: per.i2c.clock_frequency,
      performance_id: 'clock_frequency',
      url: '',
      data: [],
    },
    {
      id: 'uart',
      usage: per.uart.usage,
      performance: per.uart.baudrate,
      performance_id: 'baudrate',
      url: '',
      data: [],
    },
    {
      id: 'usb2',
      usage: per.usb2.usage,
      performance: per.usb2.bit_rate,
      performance_id: 'bit_rate',
      url: '',
      data: [],
    },
    {
      id: 'gige',
      usage: per.gige.usage,
      performance: per.gige.bit_rate,
      performance_id: 'bit_rate',
      url: '',
      data: [],
    },
    {
      id: 'gpio',
      usage: per.gpioPwm.usage,
      performance: per.gpioPwm.io_standard,
      performance_id: 'io_standard',
      url: '',
      data: [],
    },
    {
      id: 'pwm',
      usage: per.gpioPwm.usage,
      performance: per.gpioPwm.io_standard,
      performance_id: 'io_standard',
      url: '',
      data: [],
    },
  ]);

  const mainTableHeader = [
    '', '', 'Usage', 'Performance', 'Bandwidth', 'Block Power', '%', 'Action',
  ];

  function peripheralMatch(component, data, url) {
    const newData = peripherals.map((item) => {
      if (item.id === component) {
        const index = parseInt(url.slice(-1), 10);
        const i = item;
        while (i.data.length < (index + 1)) i.data.push({});
        i.data[index] = { url, data };
        return i;
      }
      return item;
    });
    setPeripherals(newData);
  }

  function fetchPeripherals(deviceId, key, url) {
    server.GET(
      server.peripheralPath(deviceId, url),
      (data) => peripheralMatch(key, data, url),
    );
  }

  const fetchData = (deviceId) => {
    if (deviceId !== null) {
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

  function modifyRow(index, row) {
    const data = {
      usage: row.usage,
    };
    data[peripherals[index.main].performance_id] = per.getPerformance(row);
    const { url } = peripherals[index.main].data[index.inner];
    server.PATCH(server.peripheralPath(device, url), data, () => {
      fetchData(device);
      publish('peripheralsChanged');
    });
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
  };

  function enableChanged(index, idx, state) {
    const data = {
      enable: state,
    };
    const { url } = peripherals[index].data[idx];
    server.PATCH(server.peripheralPath(device, url), data, () => {
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
        <TableBase header={mainTableHeader}>
          {
            peripherals.map((row, index) => row.data.map((i, idx) => (
              i.data !== undefined && (
              // eslint-disable-next-line react/no-array-index-key
              <tr key={`${index}.${idx}`}>
                <td>
                  <Checkbox
                    disabled={i.data.enable === undefined}
                    isChecked={i.data.enable === undefined || i.data.enable}
                    label=""
                    checkHandler={(state) => enableChanged(index, idx, state)}
                    id={index}
                  />
                </td>
                <td className="innerHeader">{i.data.name}</td>
                <SelectionCell val={i.data.usage} values={row.usage} />
                <SelectionCell val={per.getPerformance(i.data)} values={row.performance} />
                <td>
                  {i.data.consumption.calculated_bandwidth}
                  {' MB/s'}
                </td>
                <PowerCell val={i.data.consumption.block_power} />
                <td>
                  {fixed(parseFloat(i.data.consumption.percentage), 0)}
                  {' %'}
                </td>
                <Actions
                  onEditClick={() => {
                    setEditIndex({ main: index, inner: idx });
                    setModalOpen(true);
                  }}
                />
              </tr>
              )
            )))
          }
        </TableBase>
        {modalOpen && (
          <PeripheralsModal
            closeModal={() => {
              setModalOpen(false);
              setEditIndex(null);
            }}
            onSubmit={handleSubmit}
            defaultValue={peripherals[editIndex.main]}
            index={editIndex.inner}
          />
        )}
      </div>
    </div>
  );
}

export default PeripheralsTable;
