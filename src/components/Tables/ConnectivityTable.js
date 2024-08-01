import React from 'react';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { TableBase, Actions, StatusColumn } from './TableBase';
import ConnectivityModal from '../ModalWindows/ConnectivityModal';
import {
  PowerCell, SelectionCell, PercentsCell, FrequencyCell, BandwidthCell,
} from './TableCells';
import {
  GetText, fixed, getPeripherals, findEvailableIndex,
} from '../../utils/common';
import { publish } from '../../utils/events';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';
import { ComponentLabel } from '../ComponentsLib';
import { useClockSelection } from '../../ClockSelectionProvider';
import { useGlobalState } from '../../GlobalStateProvider';

import '../style/ACPUTable.css';

function ConnectivityTable({
  device, peripherals, update, notify,
}) {
  const [dev, setDev] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [endpoints, setEndpoints] = React.useState([]);
  const [href, setHref] = React.useState('');
  const { updateTotalPower } = useSocTotalPower();
  const { defaultClock } = useClockSelection();
  const { GetOptions, updateGlobalState, connectivityNames } = useGlobalState();
  const [disable, setDisable] = React.useState(true);
  const loadActivity = GetOptions('Port_Activity');
  const fpgaComplex = getPeripherals(peripherals, 'fpga_complex');

  function fetchPort(port, link) {
    server.GET(server.peripheralPath(device, `${link}/${port.href}`), (data) => {
      if (data.name !== '') {
        setPowerTotal((prev) => prev + data.consumption.noc_power);
      }
      const ep = parseInt(port.href.slice(-1), 10);
      const newData = endpoints;
      while (newData.length < (ep + 1)) newData.push({});
      newData[ep] = { ep, data };
      setEndpoints([...newData]);
    });
  }

  function fetchConnectivityData(link) {
    if (link !== '') {
      server.GET(server.peripheralPath(device, link), (data) => {
        setPowerTotal(0);
        data.ports.forEach((port) => fetchPort(port, link));
      });
    }
  }

  function reset() {
    setEndpoints([]);
    setHref('');
    setDisable(true);
  }

  function fetchData() {
    setDisable(fpgaComplex.length === 0);
    if (fpgaComplex.length > 0) {
      const link = fpgaComplex[0].href;
      setHref(link);
      fetchConnectivityData(link);
    } else {
      reset();
    }
  }

  React.useEffect(() => {
    if (device !== '') fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peripherals]);

  if (dev !== device) {
    setDev(device);
    if (device !== '') fetchData();
    else reset();
  }

  React.useEffect(() => {
    if (update && device !== '') fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update]);

  const header = ['', 'Action', 'Clock', 'Frequency', 'Endpoint', 'Activity', 'R/W',
    'Toggle Rate', 'Bandwidth', 'Noc Power', '%',
  ];

  function modifyRow(index, row) {
    const data = row;
    data.name = GetText(row.name, connectivityNames);
    server.PATCH(server.peripheralPath(device, `${href}/ep/${endpoints[index].ep}`), data, () => fetchConnectivityData(href));
  }

  function modifyDataHandler() {
    publish('interconnectChanged');
    updateTotalPower(device);
    updateGlobalState(device);
    notify();
  }

  const deleteRow = (index) => {
    // no delete method for acpu. this is just clear name of the endpoint which mean disable
    const val = endpoints[index].data;
    val.name = '';
    server.PATCH(server.peripheralPath(device, `${href}/ep/${endpoints[index].ep}`), val, () => fetchConnectivityData(href));
    modifyDataHandler(device);
  };

  function addRow(newData) {
    if (device !== '') {
      const data = newData;
      data.name = GetText(newData.name, connectivityNames);
      server.PATCH(server.peripheralPath(device, `${href}/ep/${findEvailableIndex(endpoints)}`), data, () => fetchConnectivityData(href));
    }
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    else addRow(newRow);
    modifyDataHandler(device);
  };

  const powerHeader = ['Power', '%'];
  const title = 'Connectivity';
  return (
    <div className="component-table-head">
      <ComponentLabel name={title} />
      <div className="cpu-container">
        <div className="power-and-table-wrapper">
          <PowerTable
            title="Connectivity power"
            total={null}
            resourcesHeaders={powerHeader}
            resources={[['NOC Interconnect', powerTotal, 0]]}
            subHeader="Sub System"
          />
          <TableBase
            header={header}
            disabled={disable}
            onClick={() => setModalOpen(true)}
          >
            {
            endpoints.map((row, index) => (
              (row.data !== undefined && row.data.name !== '') && (
              <tr key={row.ep}>
                <StatusColumn messages={row.data.consumption.messages} />
                <Actions
                  onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                  onDeleteClick={() => deleteRow(index)}
                />
                <td>{row.data.clock}</td>
                <FrequencyCell val={row.data.consumption.clock_frequency} />
                <td>{row.data.name}</td>
                <SelectionCell val={row.data.activity} values={loadActivity} />
                <PercentsCell val={row.data.read_write_rate} />
                <PercentsCell val={row.data.toggle_rate} precition={1} />
                <BandwidthCell val={row.data.consumption.calculated_bandwidth} />
                <PowerCell val={row.data.consumption.noc_power} />
                <td>
                  {fixed(row.data.consumption.percentage, 0)}
                  {' %'}
                </td>
              </tr>
              )
            ))
          }
          </TableBase>
        </div>
        {modalOpen && (
        <ConnectivityModal
          title={title}
          closeModal={() => {
            setModalOpen(false);
            setEditIndex(null);
          }}
          onSubmit={handleSubmit}
          defaultValue={(editIndex !== null && {
            name: connectivityNames.indexOf(connectivityNames.find(
              (elem) => elem.text === endpoints[editIndex].data.name,
            )),
            clock: endpoints[editIndex].data.clock,
            activity: endpoints[editIndex].data.activity,
            read_write_rate: endpoints[editIndex].data.read_write_rate,
            toggle_rate: endpoints[editIndex].data.toggle_rate,
          }) || {
            name: 0,
            clock: defaultClock(),
            activity: 0,
            read_write_rate: 0.5,
            toggle_rate: 0.125,
          }}
          connectivityNames={connectivityNames}
        />
        )}
      </div>
    </div>
  );
}

export default ConnectivityTable;
