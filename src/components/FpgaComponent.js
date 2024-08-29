import React from 'react';
import { Table } from '../utils/common';
import TitleComponent from './TitleComponent';
import FpgaCell from './FpgaCell';
import { useGlobalState } from '../GlobalStateProvider';
import { useSocTotalPower } from '../SOCTotalPowerProvider';

import './style/FpgaComponent.css';

function FpgaComponent({ tableOpen }) {
  const {
    clockingState, fleState, bramState, dspState, ioState,
  } = useGlobalState();

  const { totalConsumption } = useSocTotalPower();
  const fpgaComplex = totalConsumption.fpga_complex;
  const { dynamic } = totalConsumption.fpga_complex;
  const clocking = dynamic.components.find((elem) => elem.type === 'clocking');
  const fle = dynamic.components.find((elem) => elem.type === 'fabric_le');
  const bram = dynamic.components.find((elem) => elem.type === 'bram');
  const dsp = dynamic.components.find((elem) => elem.type === 'dsp');
  const io = dynamic.components.find((elem) => elem.type === 'io');

  return (
    <div className="fpga-main">
      <div className="fpga-main-head">
        <TitleComponent
          staticText="Core Static"
          title="FPGA"
          dynamicPower={{
            power: fpgaComplex.dynamic.power,
            percentage: fpgaComplex.dynamic.percentage,
          }}
          staticPower={{
            power: fpgaComplex.static.power,
            percentage: fpgaComplex.static.percentage,
          }}
          total={{ power: fpgaComplex.total_power, percentage: fpgaComplex.total_percentage }}
        />
      </div>
      <div className="fpga-rowx">
        <div className="blocks-row" onClick={() => tableOpen(Table.Clocking)}>
          <FpgaCell
            title="Clocking"
            power={clocking ? clocking.power : 0}
            messages={clockingState}
          />
        </div>
        <div className="blocks-row" onClick={() => tableOpen(Table.FLE)}>
          <FpgaCell
            title="FLE"
            power={fle ? fle.power : 0}
            messages={fleState}
          />
        </div>
      </div>
      <div className="fpga-rowx">
        <div className="blocks-row" onClick={() => tableOpen(Table.BRAM)}>
          <FpgaCell
            title="BRAM"
            power={bram ? bram.power : 0}
            messages={bramState}
          />
        </div>
        <div className="blocks-row" onClick={() => tableOpen(Table.DSP)}>
          <FpgaCell
            title="DSP"
            power={dsp ? dsp.power : 0}
            messages={dspState}
          />
        </div>
      </div>
      <div className="fpga-rowx" onClick={() => tableOpen(Table.IO)}>
        <div className="blocks-row">
          <FpgaCell
            title="IO"
            power={io ? io.power : 0}
            messages={ioState}
          />
        </div>
      </div>
    </div>
  );
}

export default FpgaComponent;
