import React from 'react';
import { Table } from '../utils/common';
import TitleComponent from './TitleComponent';
import FpgaCell from './FpgaCell';

import './style/FpgaComponent.css';

function FpgaComponent({
  clocking, fle, dsp, bram, io, staticPower = 0, tableOpen,
}) {
  function getDynamic() {
    return clocking + fle + dsp + bram + io;
  }
  function getStatic() {
    return staticPower;
  }

  const warn = 0.003; // TBD
  const error = 0.016; // TBD

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
            powerErr={error}
            powerWarm={warn}
          />
        </div>
        <div className="blocks-row" onClick={() => tableOpen(Table.FLE)}>
          <FpgaCell
            title="FLE"
            power={fle}
            powerErr={error}
            powerWarm={warn}
          />
        </div>
      </div>
      <div className="fpga-rowx">
        <div className="blocks-row" onClick={() => tableOpen(Table.BRAM)}>
          <FpgaCell
            title="BRAM"
            power={bram}
            powerErr={error}
            powerWarm={warn}
          />
        </div>
        <div className="blocks-row" onClick={() => tableOpen(Table.DSP)}>
          <FpgaCell
            title="DSP"
            power={dsp}
            powerErr={error}
            powerWarm={warn}
          />
        </div>
      </div>
      <div className="fpga-rowx" onClick={() => tableOpen(Table.IO)}>
        <div className="blocks-row">
          <FpgaCell
            title="IO"
            power={io}
            powerErr={error}
            powerWarm={warn}
          />
        </div>
      </div>
    </div>
  );
}

export default FpgaComponent;
