import React from 'react';
import { Table, fixed } from '../utils/common';
import TitleComponent from './TitleComponent';

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
        <div className="clickable blocks-row" onClick={() => tableOpen(Table.Clocking)}>
          <div className="bold-text-title">Clocking</div>
          <div className="grayed-text">
            {fixed(clocking)}
            {' W'}
          </div>
        </div>
        <div className="clickable blocks-row" onClick={() => tableOpen(Table.FLE)}>
          <div className="bold-text-title">FLE</div>
          <div className="grayed-text">
            {fixed(fle)}
            {' W'}
          </div>
        </div>
      </div>
      <div className="fpga-rowx">
        <div className="clickable blocks-row" onClick={() => tableOpen(Table.BRAM)}>
          <div className="bold-text-title">BRAM</div>
          <div className="grayed-text">
            {fixed(bram)}
            {' W'}
          </div>
        </div>
        <div className="clickable blocks-row" onClick={() => tableOpen(Table.DSP)}>
          <div className="bold-text-title">DSP</div>
          <div className="grayed-text">
            {fixed(dsp)}
            {' W'}
          </div>
        </div>
      </div>
      <div className="fpga-rowx">
        <div className="clickable" id="io" onClick={() => tableOpen(Table.IO)}>
          <div className="bold-text-title">IO</div>
          <div className="grayed-text">
            {fixed(io)}
            {' W'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FpgaComponent;
