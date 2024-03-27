import React from 'react';
import PropTypes from 'prop-types';
import PeripheralsComponent from './PeripheralsComponent';
import { Table, State } from '../utils/common';
import TitleComponent from './TitleComponent';
import ABCPUComponent from './ABCPUComponent';
import DMAComponent from './DMAComponent';
import ConnectivityComponent from './ConnectivityComponent';
import { subscribe, unsubscribe } from '../utils/events';
import * as server from '../utils/serverAPI';

import './style/SOCTable.css';

function SOCTable({ device, setOpenedTable }) {
  const [dynamicPower, setDynamicPower] = React.useState(0);
  const [staticPower, setStaticPower] = React.useState(0);
  const [acpuPower, setAcpuPower] = React.useState(0);
  const [bcpuPower, setBcpuPower] = React.useState(0);

  function componentChanged() {
    if (device !== null) {
      server.GET(server.api.consumption(server.Elem.peripherals, device), (data) => {
        setDynamicPower(data.total_acpu_power
          + data.total_bcpu_power
          + data.total_peripherals_power
          + data.total_dma_power
          + data.total_noc_interconnect_power
          + data.total_memory_power);
        setAcpuPower(data.total_acpu_power);
        setBcpuPower(data.total_bcpu_power);
      });
      // todo, pending for backend implementation
      setStaticPower(0);
    }
  }

  React.useEffect(() => {
    subscribe('cpuChanged', componentChanged);
    subscribe('dmaChanged', componentChanged);
    subscribe('peripheralsChanged', componentChanged);
    subscribe('interconnectChanged', componentChanged);
    subscribe('memoryChanged', componentChanged);
    return () => {
      unsubscribe('cpuChanged', componentChanged);
      unsubscribe('dmaChanged', componentChanged);
      unsubscribe('peripheralsChanged', componentChanged);
      unsubscribe('interconnectChanged', componentChanged);
      unsubscribe('memoryChanged', componentChanged);
    };
  });

  React.useEffect(() => {
    if (device !== null) componentChanged();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  const warn = 0.003; // TBD
  const error = 0.016; // TBD

  return (
    <div className="top-l2-col1">
      <div className="top-l2-col1-row1">
        <div className="top-l2-col1-row1-elem" onClick={() => setOpenedTable(Table.ACPU)}>
          <State refValue={acpuPower} warn={warn} err={error}>
            <ABCPUComponent
              device={device}
              title="ACPU"
              index="acpu"
              power={acpuPower}
            />
          </State>
        </div>
        <div className="top-l2-col1-row1-elem" onClick={() => setOpenedTable(Table.BCPU)}>
          <State refValue={bcpuPower} warn={warn} err={error}>
            <ABCPUComponent
              device={device}
              title="BCPU"
              index="bcpu"
              power={bcpuPower}
            />
          </State>
        </div>
        <div className="top-l2-col1-row1-elem-text">
          <TitleComponent
            title="SOC"
            staticText="Static"
            dynamicPower={dynamicPower}
            staticPower={staticPower}
          />
        </div>
      </div>
      <div className="top-l2-col1-row2">
        <div className="top-l2-col1-row2-elem" onClick={() => setOpenedTable(Table.DMA)}>
          <DMAComponent device={device} />
        </div>
        <div className="top-l2-col1-row2-elem" onClick={() => setOpenedTable(Table.Connectivity)}>
          <ConnectivityComponent device={device} />
        </div>
      </div>
      <PeripheralsComponent setOpenedTable={setOpenedTable} device={device} />
    </div>
  );
}

SOCTable.propTypes = {
  device: PropTypes.string,
  setOpenedTable: PropTypes.func.isRequired,
};

SOCTable.defaultProps = {
  device: null,
};

export default SOCTable;
