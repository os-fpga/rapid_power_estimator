import React from 'react';
import PropTypes from 'prop-types';
import CPUComponent from '../CPUComponent';
import Peripherals from '../Peripherals';
import { Table } from '../../utils/common';
import TitleComponent from '../TitleComponent';
import ABCPUComponent from '../ABCPUComponent';
import DMAComponent from '../DMAComponent';

import '../style/SOCTable.css';

function SOCTable({
  device, setOpenedTable, power, acpuStateChanged, bcpuStateChanged, dmaStateChanged,
}) {
  function getDynamic() {
    return power.acpu + power.bcpu + power.peripherals
      + power.dma + power.interconnect + power.memory;
  }
  function getStatic() {
    // TODO, calculated at backend
    return 0;
  }

  return (
    <div className="top-l2-col1">
      <div className="top-l2-col1-row1">
        <div className="top-l2-col1-row1-elem clickable" onClick={() => setOpenedTable(Table.ACPU)}>
          <ABCPUComponent
            device={device}
            title="ACPU"
            index="acpu"
            power={power.acpu}
            stateChanged={acpuStateChanged}
          />
        </div>
        <div className="top-l2-col1-row1-elem clickable" onClick={() => setOpenedTable(Table.BCPU)}>
          <ABCPUComponent
            device={device}
            title="BCPU"
            index="bcpu"
            power={power.bcpu}
            stateChanged={bcpuStateChanged}
          />
        </div>
        <div className="top-l2-col1-row1-elem-text">
          <TitleComponent
            title="SOC"
            staticText="Static"
            dynamicPower={getDynamic()}
            staticPower={getStatic()}
          />
        </div>
      </div>
      <div className="top-l2-col1-row2">
        <div className="top-l2-col1-row2-elem clickable" onClick={() => setOpenedTable(Table.DMA)}>
          <DMAComponent
            device={device}
            power={power.dma}
            stateChanged={dmaStateChanged}
          />
        </div>
        <div className="top-l2-col1-row2-elem clickable" onClick={() => setOpenedTable(Table.Connectivity)}>
          <CPUComponent title="Connectivity" power={power.interconnect} />
        </div>
      </div>
      <Peripherals setOpenedTable={setOpenedTable} power={power.peripherals} device={device} />
    </div>
  );
}

SOCTable.propTypes = {
  device: PropTypes.string,
  setOpenedTable: PropTypes.func.isRequired,
  power: PropTypes.oneOfType([
    PropTypes.object,
  ]),
  acpuStateChanged: PropTypes.bool.isRequired,
  bcpuStateChanged: PropTypes.bool.isRequired,
  dmaStateChanged: PropTypes.bool.isRequired,
};

SOCTable.defaultProps = {
  device: null,
  power: {
    acpu: 0,
    bcpu: 0,
    peripherals: 0,
    dma: 0,
    interconnect: 0,
    memory: 0,
  },
};

export default SOCTable;
