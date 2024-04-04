import React from 'react';

import '../style/DesignParametesTable.css';

function DesignParametesTable() {
  return (
    <div className="param-element-container">
      <div className="param-element">
        <div>LUTs</div>
        <select>
          <option>10%</option>
          <option>20%</option>
        </select>
      </div>
      <div className="param-element">
        <div>FFs</div>
        <select>
          <option>10%</option>
          <option>20%</option>
        </select>
      </div>
      <div className="param-element">
        <div>BRAMs</div>
        <select>
          <option>10%</option>
          <option>20%</option>
        </select>
      </div>
      <div className="param-element">
        <div>DSP</div>
        <select>
          <option>10%</option>
          <option>20%</option>
        </select>
      </div>
      <div className="param-element">
        <div className="ios">
          <div>I/O Inputs</div>
          <div>I/O Outputs</div>
        </div>
        <select id="ios">
          <option>10%</option>
          <option>20%</option>
        </select>
      </div>
      <div className="param-element">
        <div>RISC-V ACPU</div>
        <select>
          <option>10%</option>
          <option>20%</option>
        </select>
        <select>
          <option>10%</option>
          <option>20%</option>
        </select>
      </div>
      <div className="param-element">
        <div>DDR</div>
        <select>
          <option>10%</option>
          <option>20%</option>
        </select>
        <select>
          <option>10%</option>
          <option>20%</option>
        </select>
        <select>
          <option>10%</option>
          <option>20%</option>
        </select>
      </div>
      <div className="param-element">
        <div>OCM</div>
        <select>
          <option>10%</option>
          <option>20%</option>
        </select>
        <select>
          <option>10%</option>
          <option>20%</option>
        </select>
      </div>
    </div>
  );
}

export default DesignParametesTable;
