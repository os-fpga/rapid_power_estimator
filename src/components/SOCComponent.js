import React from 'react';
import PropTypes from 'prop-types';
import PeripheralsComponent from './PeripheralsComponent';
import { Table, State, percentage } from '../utils/common';
import TitleComponent from './TitleComponent';
import ABCPUComponent from './ABCPUComponent';
import DMAComponent from './DMAComponent';
import ConnectivityComponent from './ConnectivityComponent';
import { useSelection } from '../SelectionProvider';
import { useSocTotalPower } from '../SOCTotalPowerProvider';

import './style/SOCTable.css';

function SOCTable({ device, setOpenedTable }) {
  const { selectedItem } = useSelection();
  const {
    power, dynamicPower, staticPower, updateTotalPower,
  } = useSocTotalPower();

  function componentChanged() {
    if (device !== null) {
      updateTotalPower(device);
    }
  }

  React.useEffect(() => {
    if (device !== null) componentChanged();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  const warn = 0.003; // TBD
  const error = 0.016; // TBD

  function getBaseName(item) {
    return (selectedItem === item) ? 'clickable selected' : 'clickable';
  }

  return (
    <div className="top-l2-col1">
      <div className="top-l2-col1-row1">
        <div className="top-l2-col1-row1-elem" onClick={() => setOpenedTable(Table.ACPU)}>
          <State refValue={power.total_acpu_power} warn={warn} err={error} baseClass={getBaseName('ACPU')}>
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
          <State refValue={power.total_bcpu_power} warn={warn} err={error} baseClass={getBaseName('BCPU')}>
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
