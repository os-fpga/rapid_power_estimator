import React from 'react';
import PropTypes from 'prop-types';
import MemoryModal from '../ModalWindows/MemoryModal';
import { memory } from '../../utils/peripherals';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { fixed } from '../../utils/common';
import { PowerCell, SelectionCell } from './TableCells';
import { TableBase, Actions } from './TableBase';
import { publish } from '../../utils/events';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';
import { ComponentLabel, Checkbox } from '../ComponentsLib';

import '../style/ComponentTable.css';

function MemoryTable({ device }) {
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

  const mainTableHeader = [
    '', 'Memory', 'Action', 'Usage', 'Memory Type', 'Data Rate', 'Width', 'R Bandwidth',
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
      server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
        setHref(data.memory);
        fetchData(data.memory);
      });
    }
  }

  function modifyRow(index, row) {
    server.PATCH(server.peripheralPath(device, `${href[index].href}`), row, () => fetchData(href));
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    publish('memoryChanged');
    updateTotalPower(device);
  };

  const resourcesHeaders = [
    'Power', '%',
  ];

  function enableChanged(index, state) {
    const data = {
      enable: state,
    };
    server.PATCH(server.peripheralPath(device, `${href[index].href}`), data, () => {
      fetchData(href);
      publish('memoryChanged');
      updateTotalPower(device);
    });
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
                <td>
                  <Checkbox
                    disabled={false}
                    isChecked={row.data.enable}
                    label=""
                    checkHandler={(state) => enableChanged(index, state)}
                    id={row.id}
                  />
                </td>
                <td>{row.data.name}</td>
                <Actions
                  onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                />
                <SelectionCell val={row.data.usage} values={memory.usage} />
                <SelectionCell val={row.data.memory_type} values={memory.memory_type} />
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
            usage: memory.usage.at(0).id,
            memory_type: memory.memory_type.at(0).id,
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
};

MemoryTable.defaultProps = {
  device: null,
};

export default MemoryTable;
