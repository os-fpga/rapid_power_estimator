import React from 'react';
import PropTypes from 'prop-types';
import PowerSummaryTable from './Tables/PowerSummaryTable';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { useGlobalState } from '../GlobalStateProvider';

function FPGASummaryComponent({ device }) {
  const {
    clockingState, fleState, bramState, dspState, ioState,
  } = useGlobalState();
  const defaultData = [
    {
      text: 'Clocking',
      power: 0,
      percent: 0,
      messages: [],
    },
    {
      text: 'FLE',
      power: 0,
      percent: 0,
      messages: [],
    },
    {
      text: 'BRAM',
      power: 0,
      percent: 0,
      messages: [],
    },
    {
      text: 'DSP',
      power: 0,
      percent: 0,
      messages: [],
    },
    {
      text: 'I/O',
      power: 0,
      percent: 0,
      messages: [],
    },
    {
      text: 'FPGA Dynamic',
      power: 0,
      percent: 0,
      messages: [],
    },
    {
      text: 'FPGA/Core Static',
      power: 0,
      percent: 0,
      messages: [],
    },
  ];
  const [data, setData] = React.useState(defaultData);
  const { totalConsumption } = useSocTotalPower();

  const fpgaComplex = totalConsumption.fpga_complex;

  React.useEffect(() => {
    const newData = defaultData;
    const { dynamic } = totalConsumption.fpga_complex;
    const clocking = dynamic.components.find((elem) => elem.type === 'clocking');
    if (clocking) {
      newData[0].power = clocking.power;
      newData[0].percent = clocking.percentage;
      newData[0].messages = clockingState;
    }
    const fle = dynamic.components.find((elem) => elem.type === 'fabric_le');
    if (fle) {
      newData[1].power = fle.power;
      newData[1].percent = fle.percentage;
      newData[1].messages = fleState;
    }
    const bram = dynamic.components.find((elem) => elem.type === 'bram');
    if (bram) {
      newData[2].power = bram.power;
      newData[2].percent = bram.percentage;
      newData[2].messages = bramState;
    }
    const dsp = dynamic.components.find((elem) => elem.type === 'bsp');
    if (dsp) {
      newData[3].power = dsp.power;
      newData[3].percent = dsp.percentage;
      newData[3].messages = dspState;
    }
    const io = dynamic.components.find((elem) => elem.type === 'io');
    if (io) {
      newData[4].power = io.power;
      newData[4].percent = io.percentage;
      newData[4].messages = ioState;
    }
    newData[5].power = fpgaComplex.dynamic.power;
    newData[5].percent = fpgaComplex.dynamic.percentage;
    newData[6].power = fpgaComplex.static.power;
    newData[6].percent = fpgaComplex.static.percentage;
    setData([...newData]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, clockingState, fleState, bramState, dspState, ioState, totalConsumption]);

  return (
    <PowerSummaryTable
      title="FPGA Complex and Core Power"
      data={data}
      total={fpgaComplex.total_power}
      percent={fpgaComplex.total_percentage}
    />
  );
}

FPGASummaryComponent.propTypes = {
  device: PropTypes.string,
};

FPGASummaryComponent.defaultProps = {
  device: null,
};

export default FPGASummaryComponent;
