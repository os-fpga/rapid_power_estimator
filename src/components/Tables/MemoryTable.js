import React from 'react';
import PropTypes from 'prop-types';
import MemoryModal from '../ModalWindows/MemoryModal';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { fixed } from '../../utils/common';
import { PowerCell, SelectionCell } from './TableCells';
import {
  TableBase, Actions, StatusColumn, EnableState,
} from './TableBase';
import { publish } from '../../utils/events';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';
import { useGlobalState } from '../../GlobalStateProvider';
import { ComponentLabel } from '../ComponentsLib';

import '../style/ComponentTable.css';

function MemoryTable({ device, peripherals }) {
  const [dev, setDev] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [href, setHref] = React.useState([]);
  const [memoryData, setMemoryData] = React.useState([
    { id: 0, data: {} },
    { id: 1, data: {} },
  ]);
  const { updateTotalPower } = useSocTotalPower();
  const { GetOptions } = useGlobalState();
  const memoryUsage = GetOptions('Peripherals_Usage');
  const memoryType = GetOptions('Memory_Type');

  const mainTableHeader = [
    '', '', 'Memory', 'Action', 'Usage', 'Memory Type', 'Data Rate', 'Width', 'R Bandwidth',
    'W Bandwidth', 'Block Power', '%',
  ];

  function fetchMemoryData(index, memHref) {
    server.GET(server.peripheralPath(device, memHref), (memJson) => {
      setPowerTotal((prev) => prev + memJson.consumption.block_power);
      const dat = [...memoryData];
      const found = dat.find((i) => i.id === index);
      found.data = memJson;
      setMemoryData(dat);
    });
  }

  function fetchData(lhref) {
    if (device !== null) {
      setPowerTotal(0);
      lhref.forEach((mem) => {
        const index = parseInt(mem.href.slice(-1), 10);
        fetchMemoryData(index, mem.href);
      });
    }
  }

  if (dev !== device) {
    setDev(device);
    if (device !== null) {
      setHref(peripherals.memory);
      fetchData(peripherals.memory);
    }
  }

  function modifyDataHandler() {
    fetchData(href);
    publish('memoryChanged');
    updateTotalPower(device);
  }

  function modifyRow(index, row) {
    server.PATCH(server.peripheralPath(device, `${href[index].href}`), row, modifyDataHandler);
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
  };

  const resourcesHeaders = [
    'Power', '%',
  ];

  function enableChanged(index, state) {
    const data = {
      enable: state,
    };
    server.PATCH(server.peripheralPath(device, `${href[index].href}`), data, modifyDataHandler);
  }

  return (
    <div className="component-table-head">
      <ComponentLabel name="Memory" />
      <div className="power-and-table-wrapper">
        <div className="power-table-wrapper">
          <PowerTable
            title="Memory power"
            total={null}
            resourcesHeaders={resourcesHeaders}
            resources={[['Memory', powerTotal, 0]]}
            subHeader="Sub System"
          />
        </div>
        <TableBase header={mainTableHeader} hideAddBtn>
          {
          memoryData.map((row, index) => (
            row.data.enable !== undefined && (
              <tr key={row.id}>
                <StatusColumn messages={row.data.consumption.messages} />
                <EnableState
                  isChecked={row.data.enable}
                  checkHandler={(state) => enableChanged(index, state)}
                />
                <td>{row.data.name}</td>
                <Actions
                  onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                />
                <SelectionCell val={row.data.usage} values={memoryUsage} />
                <SelectionCell val={row.data.memory_type} values={memoryType} />
                <td>{row.data.data_rate}</td>
                <td>{row.data.width}</td>
                <PowerCell val={row.data.consumption.write_bandwidth} />
                <PowerCell val={row.data.consumption.read_bandwidth} />
                <PowerCell val={row.data.consumption.block_power} />
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
        <MemoryModal
          closeModal={() => {
            setModalOpen(false);
            setEditIndex(null);
          }}
          onSubmit={handleSubmit}
          defaultValue={(editIndex !== null && memoryData[editIndex].data) || {
            enable: true,
            name: '',
            usage: memoryUsage.at(0).id,
            memory_type: memoryType.at(0).id,
            data_rate: 533,
            width: 32,
          }}
        />
      )}
    </div>
  );
}

MemoryTable.propTypes = {
  device: PropTypes.string,
  peripherals: PropTypes.oneOfType([PropTypes.object]).isRequired,
};

MemoryTable.defaultProps = {
  device: null,
};

export default MemoryTable;
