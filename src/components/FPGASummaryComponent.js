import React from 'react';
import PropTypes from 'prop-types';
import PowerSummaryTable from './Tables/PowerSummaryTable';
import { percentage } from '../utils/common';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { useGlobalState } from '../GlobalStateProvider';

function FPGASummaryComponent({
  device, clocking, fle, dsp, bram, io,
}) {
  const {
    clockingState, fleState, bramState, dspState, ioState,
  } = useGlobalState();
  const [data, setData] = React.useState([
    {
      text: 'Clocking',
      power: clocking,
      percent: 0,
      messages: [],
    },
    {
      text: 'FLE',
      power: fle,
      percent: 0,
      messages: [],
    },
    {
      text: 'BRAM',
      power: bram,
      percent: 0,
      messages: [],
    },
    {
      text: 'DSP',
      power: dsp,
      percent: 0,
      messages: [],
    },
    {
      text: 'I/O',
      power: io,
      percent: 0,
      messages: [],
    },
    {
      text: 'FPGA Dynamic',
      power: clocking + fle + dsp + bram + io,
      percent: 0,
      messages: [],
    },
    {
      text: 'FPGA/Core Static',
      power: 0,
      percent: 0,
      messages: [],
    },
  ]);
  const { calcPercents } = useSocTotalPower();

  React.useEffect(() => {
    const newData = data;
    const sum = clocking + fle + dsp + bram + io;
    const stat = 0;
    newData[0].power = clocking;
    newData[0].percent = percentage(clocking, sum);
    newData[0].messages = clockingState;
    newData[1].power = fle;
    newData[1].percent = percentage(fle, sum);
    newData[1].messages = fleState;
    newData[2].power = bram;
    newData[2].percent = percentage(bram, sum);
    newData[2].messages = bramState;
    newData[3].power = dsp;
    newData[3].percent = percentage(dsp, sum);
    newData[3].messages = dspState;
    newData[4].power = io;
    newData[4].percent = percentage(io, sum);
    newData[4].messages = ioState;
    newData[5].power = sum;
    newData[5].percent = percentage(sum, sum + stat);
    newData[6].power = stat;
    newData[6].percent = percentage(stat, sum + stat);
    setData([...newData]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, clocking, fle, dsp, bram, io, clockingState, fleState, bramState, dspState, ioState]);

  return (
    <PowerSummaryTable
      title="FPGA Complex and Core Power"
      data={data}
      total={data[5].power + data[6].power}
      percent={calcPercents(data[5].power + data[6].power)}
    />
  );
}

FPGASummaryComponent.propTypes = {
  device: PropTypes.string,
  clocking: PropTypes.number.isRequired,
  fle: PropTypes.number.isRequired,
  dsp: PropTypes.number.isRequired,
  bram: PropTypes.number.isRequired,
  io: PropTypes.number.isRequired,
};

FPGASummaryComponent.defaultProps = {
  device: null,
};

export default FPGASummaryComponent;
