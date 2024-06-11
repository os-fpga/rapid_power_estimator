import React from 'react';
import { InputNumber } from 'antd';
import { PercentSelector, Checkbox, Dropdown } from '../ComponentsLib';
import {
  ddr, ddrRate, ddrWidth, endpoints,
} from '../../utils/designParameter';
import { useGlobalState } from '../../GlobalStateProvider';

import '../style/DesignParametesTable.css';

function ResourceUtility({ name, value, setValue }) {
  return (
    <div className="param-element">
      <div className="parameter-name">{name}</div>
      <PercentSelector max={90} value={value} setValue={setValue} />
    </div>
  );
}

function DesignParametesTable() {
  const [lutUtils, setLutUtils] = React.useState(0);
  const [ffUtils, setFFUtils] = React.useState(0);
  const [bramUtils, setBramUtils] = React.useState(0);
  const [dspUtils, setDspUtils] = React.useState(0);
  const [ioSelection, setIoSelection] = React.useState(0);
  const [enableAcpu, setEnableAcpu] = React.useState(true);
  const [enableOcm, setEnableOcm] = React.useState(true);
  const [enableDdr, setEnableDdr] = React.useState(true);
  const [acpuFreq, setAcpuFreq] = React.useState(0);
  const [ddrSelection, setDdrSelection] = React.useState(0);
  const [ddrRateSel, setDdrRateSel] = React.useState(0);
  const [ddrWidthSel, setDdrWidthSel] = React.useState(0);
  const [ocmEndpoint, setOcmEndpoint] = React.useState(0);
  const { GetOptions } = useGlobalState();
  const ioStandard = GetOptions('IO_Standard');

  return (
    <div className="param-element-container-main">
      <div className="param-element-header">
        <div className="component-label">Design Parameters</div>
        <button type="button" className="calc-button">Calculate</button>
      </div>
      <div className="param-element-container">
        <ResourceUtility name="LUTs" value={lutUtils} setValue={setLutUtils} />
        <ResourceUtility name="FFs" value={ffUtils} setValue={setFFUtils} />
        <ResourceUtility name="BRAMs" value={bramUtils} setValue={setBramUtils} />
        <ResourceUtility name="DSP" value={dspUtils} setValue={setDspUtils} />
        <div className="param-element">
          <div className="ios parameter-name">
            <div>I/O Inputs</div>
            <div>I/O Outputs</div>
          </div>
          <Dropdown id="ios" value={ioSelection} onChangeHandler={setIoSelection} items={ioStandard} />
        </div>
        <div className="param-element">
          <Checkbox label="RISC-V ACPU" id="acpu" isChecked={enableAcpu} checkHandler={setEnableAcpu} />
          <InputNumber
            className="acpuInput"
            formatter={(value) => `${value} MHz`}
            parser={(value) => parseInt(value.replace(' MHz', ''), 10)}
            min={0}
            max={533}
            value={acpuFreq}
            onChange={setAcpuFreq}
            changeOnWheel
          />
        </div>
        <div className="param-element">
          <Checkbox label="DDR" id="ddr" isChecked={enableDdr} checkHandler={setEnableDdr} />
          <Dropdown value={ddrSelection} onChangeHandler={setDdrSelection} items={ddr} />
          <Dropdown value={ddrRateSel} onChangeHandler={setDdrRateSel} items={ddrRate} />
          <Dropdown value={ddrWidthSel} onChangeHandler={setDdrWidthSel} items={ddrWidth} />
        </div>
        <div className="param-element">
          <Checkbox label="OCM" id="ocm" isChecked={enableOcm} checkHandler={setEnableOcm} />
          <Dropdown value={ocmEndpoint} onChangeHandler={setOcmEndpoint} items={endpoints} />
        </div>
      </div>
    </div>
  );
}

export default DesignParametesTable;
