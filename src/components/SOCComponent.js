import React from 'react';
import PropTypes from 'prop-types';
import PeripheralsComponent from './PeripheralsComponent';
import { Table } from '../utils/common';
import TitleComponent from './TitleComponent';
import ABCPUComponent from './ABCPUComponent';
import DMAComponent from './DMAComponent';
import ConnectivityComponent from './ConnectivityComponent';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { useGlobalState } from '../GlobalStateProvider';

import './style/SOCTable.css';

function SOCComponent({ device, setOpenedTable, peripherals }) {
  const { totalConsumption } = useSocTotalPower();
  const { socState } = useGlobalState();

  const processingComplex = totalConsumption.processing_complex;

  const acpu = processingComplex.dynamic.components.find((elem) => elem.type === 'acpu');
  const bcpu = processingComplex.dynamic.components.find((elem) => elem.type === 'bcpu');

  return (
    <div className="top-l2-col1">
      <div className="top-l2-col1-row1">
        <div className="top-l2-col1-row1-elem" onClick={() => setOpenedTable(Table.ACPU)}>
          <ABCPUComponent
            device={device}
            title="ACPU"
            index="acpu"
            power={acpu ? acpu.power : 0}
            percent={acpu ? acpu.percentage : 0}
            messages={socState.acpu}
            peripherals={peripherals}
          />
        </div>
        <div className="top-l2-col1-row1-elem" onClick={() => setOpenedTable(Table.BCPU)}>
          <ABCPUComponent
            device={device}
            title="BCPU"
            index="bcpu"
            power={bcpu ? bcpu.power : 0}
            percent={bcpu ? bcpu.percentage : 0}
            messages={socState.bcpu}
            peripherals={peripherals}
          />
        </div>
        <div className="top-l2-col1-row1-elem-text">
          <TitleComponent
            title="SOC"
            staticText="Static"
            dynamicPower={{
              power: processingComplex.dynamic.power,
              percentage: processingComplex.dynamic.percentage,
            }}
            staticPower={{
              power: processingComplex.static.power,
              percentage: processingComplex.static.percentage,
            }}
            total={{
              power: processingComplex.total_power,
              percentage: processingComplex.total_percentage,
            }}
          />
        </div>
      </div>
      <div className="top-l2-col1-row2">
        <div className="top-l2-col1-row2-elem" onClick={() => setOpenedTable(Table.DMA)}>
          <DMAComponent device={device} peripherals={peripherals} />
        </div>
        <div className="top-l2-col1-row2-elem" onClick={() => setOpenedTable(Table.Connectivity)}>
          <ConnectivityComponent device={device} peripherals={peripherals} />
        </div>
      </div>
      <div onClick={() => setOpenedTable(Table.Peripherals)}>
        <PeripheralsComponent device={device} />
      </div>
    </div>
  );
}

SOCComponent.propTypes = {
  device: PropTypes.string,
  setOpenedTable: PropTypes.func.isRequired,
};

SOCComponent.defaultProps = {
  device: '',
};

export default SOCComponent;
