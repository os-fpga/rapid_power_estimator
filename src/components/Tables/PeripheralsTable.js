import React from 'react';
import PeripheralsModal from '../ModalWindows/PeripheralsModal';
import * as server from '../../utils/serverAPI';
import { fixed, getPerformance } from '../../utils/common';
import { PowerCell, SelectionCell, DisabledCell } from './TableCells';
import { TableBase, Actions, StatusColumn } from './TableBase';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';
import { ComponentLabel, Checkbox } from '../ComponentsLib';
import { useGlobalState } from '../../GlobalStateProvider';

import '../style/ComponentTable.css';

function PeripheralsTable({
  device, peripheralsUrl, update, notify,
}) {
  const [dev, setDev] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const { updateTotalPower } = useSocTotalPower();
  const { GetOptions, updateGlobalState } = useGlobalState();
  const usage = GetOptions('Peripherals_Usage');
  const spiFreq = GetOptions('Qspi_Performance_Mbps');
  const jtagFreq = GetOptions('Jtag_Clock_Frequency');
  const i2cFreq = GetOptions('I2c_Speed');
  const uartBound = GetOptions('Baud_Rate');
  const usbFreq = GetOptions('Usb_Speed');
  const gigeFreq = GetOptions('Gige_Speed');
  const gpioFreq = GetOptions('GpioStandard');
  const [peripherals, setPeripherals] = React.useState([
    {
      id: 'spi',
      usage,
      performance: spiFreq,
      performance_id: 'clock_frequency',
      io_used: false,
      url: '',
      data: [],
    },
    {
      id: 'jtag',
      usage,
      performance: jtagFreq,
      performance_id: 'clock_frequency',
      io_used: false,
      url: '',
      data: [],
    },
    {
      id: 'i2c',
      usage,
      performance: i2cFreq,
      performance_id: 'clock_frequency',
      io_used: false,
      url: '',
      data: [],
    },
    {
      id: 'uart',
      usage,
      performance: uartBound,
      performance_id: 'baudrate',
      io_used: false,
      url: '',
      data: [],
    },
    {
      id: 'usb2',
      usage,
      performance: usbFreq,
      performance_id: 'bit_rate',
      io_used: false,
      url: '',
      data: [],
    },
    {
      id: 'gige',
      usage,
      performance: gigeFreq,
      performance_id: 'bit_rate',
      io_used: false,
      url: '',
      data: [],
    },
    {
      id: 'gpio',
      usage,
      performance: gpioFreq,
      performance_id: 'io_standard',
      io_used: true,
      url: '',
      data: [],
    },
    {
      id: 'pwm',
      usage,
      performance: gpioFreq,
      performance_id: 'io_standard',
      io_used: true,
      url: '',
      data: [],
    },
  ]);

  const mainTableHeader = [
    '', '', '', 'Action', 'Usage', 'Performance', 'IO used', 'Bandwidth', 'Block Power', '%',
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
      peripheralsUrl.forEach((elem) => {
        const { type } = elem;
        if (type === 'dma' || type === 'ocm' || type === 'acpu' || type === 'bcpu' || type === 'ddr') return;
        const { href } = elem;
        fetchPeripherals(deviceId, type, href);
      });
    }
  };

  if (dev !== device) {
    setDev(device);
    if (device !== null) fetchData(device);
  }
  React.useEffect(() => {
    if (update && device !== null) fetchData(device);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update]);

  function modifyDataHandler() {
    updateTotalPower(device);
    updateGlobalState(device);
    notify();
  }

  function modifyRow(index, row) {
    const data = {
      usage: row.usage,
    };
    data[peripherals[index.main].performance_id] = getPerformance(row);
    if (peripherals[index.main].io_used) data.io_used = row.io_used;
    const { url } = peripherals[index.main].data[index.inner];
    server.PATCH(server.peripheralPath(device, url), data, () => {
      fetchData(device);
      modifyDataHandler();
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
      modifyDataHandler();
    });
  }

  return (
    <div className="component-table-head">
      <ComponentLabel name="Peripherals" />
      <TableBase header={mainTableHeader} hideAddBtn>
        {
        peripherals.map((row, index) => row.data.map((i, idx) => (
          i.data !== undefined && (
          // eslint-disable-next-line react/no-array-index-key
          <tr key={`${index}.${idx}`}>
            <StatusColumn messages={i.data.consumption.messages} />
            <td className="fixed-col">
              <Checkbox
                disabled={i.data.enable === undefined}
                isChecked={i.data.enable === undefined || i.data.enable}
                label=""
                checkHandler={(state) => enableChanged(index, idx, state)}
                id={index}
              />
            </td>
            <td className="innerHeader">{i.data.name}</td>
            <Actions
              onEditClick={() => {
                setEditIndex({ main: index, inner: idx });
                setModalOpen(true);
              }}
            />
            <SelectionCell val={i.data.usage} values={row.usage} />
            <SelectionCell val={getPerformance(i.data)} values={row.performance} />
            <DisabledCell val={row.io_used ? i.data.io_used : -1} />
            <td>
              {i.data.consumption.calculated_bandwidth}
              {' MB/s'}
            </td>
            <PowerCell val={i.data.consumption.block_power} />
            <td>
              {fixed(parseFloat(i.data.consumption.percentage), 0)}
              {' %'}
            </td>
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
  );
}

export default PeripheralsTable;
