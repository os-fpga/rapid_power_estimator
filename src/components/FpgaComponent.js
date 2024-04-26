import React from 'react';
import { Table } from '../utils/common';
import TitleComponent from './TitleComponent';
import FpgaCell from './FpgaCell';
import { useGlobalState } from '../GlobalStateProvider';

import './style/FpgaComponent.css';

function FpgaComponent({
  clocking, fle, dsp, bram, io, staticPower = 0, tableOpen,
}) {
  const {
    clockingState, fleState, bramState, dspState, ioState,
  } = useGlobalState();
  function getDynamic() {
    return clocking + fle + dsp + bram + io;
  }
  function getStatic() {
    return staticPower;
  }

  return (
    <div className="fpga-main">
      <div className="fpga-main-head">
        <TitleComponent
          staticText="Core Static"
          title="FPGA"
          dynamicPower={getDynamic()}
          staticPower={getStatic()}
        />
      </div>
      <div className="fpga-rowx">
        <div className="blocks-row" onClick={() => tableOpen(Table.Clocking)}>
          <FpgaCell
            title="Clocking"
            power={clocking}
            messages={clockingState}
          />
        </div>
        <div className="blocks-row" onClick={() => tableOpen(Table.FLE)}>
          <FpgaCell
            title="FLE"
            power={fle}
            messages={fleState}
          />
        </div>
      </div>
      <div className="fpga-rowx">
        <div className="blocks-row" onClick={() => tableOpen(Table.BRAM)}>
          <FpgaCell
            title="BRAM"
            power={bram}
            messages={bramState}
          />
        </div>
        <div className="blocks-row" onClick={() => tableOpen(Table.DSP)}>
          <FpgaCell
            title="DSP"
            power={dsp}
            messages={dspState}
          />
        </div>
      </div>
      <div className="fpga-rowx" onClick={() => tableOpen(Table.IO)}>
        <div className="blocks-row">
          <FpgaCell
            title="IO"
            power={io}
            messages={ioState}
          />
        </div>
      </div>
    </div>
  );
}

export default FpgaComponent;
