import React from 'react';
import PropTypes from 'prop-types';
import PeripheralsComponent from './PeripheralsComponent';
import { Table, percentage } from '../utils/common';
import TitleComponent from './TitleComponent';
import ABCPUComponent from './ABCPUComponent';
import DMAComponent from './DMAComponent';
import ConnectivityComponent from './ConnectivityComponent';
import { useSelection } from '../SelectionProvider';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { State } from './ComponentsLib';
import { useGlobalState } from '../GlobalStateProvider';

import './style/SOCTable.css';

function SOCTable({ device, setOpenedTable }) {
  const { selectedItem } = useSelection();
  const {
    power, dynamicPower, staticPower,
  } = useSocTotalPower();
  const { socState } = useGlobalState();

  function getBaseName(item) {
    return (selectedItem === item) ? 'clickable selected' : 'clickable';
  }

  return (
    <div className="top-l2-col1">
      <div className="top-l2-col1-row1">
        <div className="top-l2-col1-row1-elem" onClick={() => setOpenedTable(Table.ACPU)}>
          <State messages={socState.acpu} baseClass={getBaseName('ACPU')}>
            <ABCPUComponent
              device={device}
              title="ACPU"
              index="acpu"
              power={power.total_acpu_power}
              percent={percentage(power.total_acpu_power, dynamicPower)}
            />
          </State>
        </div>
        <div className="top-l2-col1-row1-elem" onClick={() => setOpenedTable(Table.BCPU)}>
          <State messages={socState.bcpu} baseClass={getBaseName('BCPU')}>
            <ABCPUComponent
              device={device}
              title="BCPU"
              index="bcpu"
              power={power.total_bcpu_power}
              percent={percentage(power.total_bcpu_power, dynamicPower)}
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
      <div onClick={() => setOpenedTable(Table.Peripherals)}>
        <PeripheralsComponent device={device} />
      </div>
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
