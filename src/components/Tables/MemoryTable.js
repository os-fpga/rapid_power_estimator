import React from 'react';
import PropTypes from 'prop-types';
import MemoryModal from '../ModalWindows/MemoryModal';
import { memory } from '../../utils/peripherals';
import PowerTable from './PowerTable';
import * as server from '../../utils/serverAPI';
import { fixed } from '../../utils/common';
import { PowerCell, SelectionCell } from './TableCells';
import { TableBase, Actions, Checkbox } from './TableBase';
import { publish } from '../../utils/events';

import '../style/ComponentTable.css';

function MemoryTable({ device }) {
  const [editIndex, setEditIndex] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [powerTotal, setPowerTotal] = React.useState(0);
  const [powerTable, setPowerTable] = React.useState([]);
  const [href, setHref] = React.useState([]);
  const [memoryData, setMemoryData] = React.useState([
    { id: 0, data: {} },
    { id: 1, data: {} },
  ]);

  const mainTableHeader = [
    '', 'Memory', 'Usage', 'Memory Type', 'Data Rate', 'Width', 'R Bandwidth',
    'W Bandwidth', 'Block Power', '%', 'Action',
  ];

  React.useEffect(() => {
    if (device !== null) {
      server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
        setHref(data.memory);
      });
    }
  }, [device]);

  React.useEffect(() => {
    setPowerTable([
      ['Memory', powerTotal, 0],
    ]);
  }, [powerTotal]);

  function fetchMemoryData(index, memHref) {
    server.GET(server.peripheralPath(device, memHref), (memJson) => {
      setPowerTotal((prev) => prev + memJson.consumption.block_power);
      const dat = [...memoryData];
      const found = dat.find((i) => i.id === index);
      found.data = memJson;
      setMemoryData(dat);
    });
  }

  function fetchData() {
    if (device !== null) {
      setPowerTotal(0);
      href.forEach((mem) => {
        const index = parseInt(mem.href.slice(-1), 10);
        fetchMemoryData(index, mem.href);
      });
    }
  }

  React.useEffect(() => {
    if (device !== null) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [href]);

  function modifyRow(index, row) {
    server.PATCH(server.peripheralPath(device, `${href[index].href}`), row, fetchData);
  }

  const handleSubmit = (newRow) => {
    if (editIndex !== null) modifyRow(editIndex, newRow);
    publish('memoryChanged');
  };

  const resourcesHeaders = [
    'Power', '%',
  ];

  function enableChanged(index, state) {
    const data = {
      enable: state,
    };
    server.PATCH(server.peripheralPath(device, `${href[index].href}`), data, () => {
      fetchData();
      publish('memoryChanged');
    });
  }

  return (
    <div className="component-table-head">
      <div className="main-block">
        <div className="layout-head">
          <label>FPGA &gt; Memory</label>
        </div>
        <TableBase header={mainTableHeader}>
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
                  <Actions
                    onEditClick={() => { setEditIndex(index); setModalOpen(true); }}
                  />
                </tr>
              )
            ))
          }
        </TableBase>
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
      <div className="power-table-wrapper">
        <PowerTable
          title="Memory power"
          total={null}
          resourcesHeaders={resourcesHeaders}
          resources={powerTable}
          subHeader="Sub System"
        />
      </div>
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
