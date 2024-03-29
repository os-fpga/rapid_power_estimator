import React from 'react';
import PropTypes from 'prop-types';
import PowerSummaryTable from './Tables/PowerSummaryTable';
import { percentage } from '../utils/common';

function FPGASummaryComponent({
  device, clocking, fle, dsp, bram, io,
}) {
  const [data, setData] = React.useState([
    {
      text: 'Clocking',
      power: clocking,
      percent: 0,
    },
    {
      text: 'FLE',
      power: fle,
      percent: 0,
    },
    {
      text: 'BRAM',
      power: bram,
      percent: 0,
    },
    {
      text: 'DSP',
      power: dsp,
      percent: 0,
    },
    {
      text: 'I/O',
      power: io,
      percent: 0,
    },
    {
      text: 'FPGA Dynamic',
      power: clocking + fle + dsp + bram + io,
      percent: 0,
    },
    {
      text: 'FPGA/Core Static',
      power: 0,
      percent: 0,
    },
  ]);

  React.useEffect(() => {
    const newData = data;
    const sum = clocking + fle + dsp + bram + io;
    const stat = 0;
    newData[0].power = clocking;
    newData[0].percent = percentage(clocking, sum);
    newData[1].power = fle;
    newData[1].percent = percentage(fle, sum);
    newData[2].power = bram;
    newData[2].percent = percentage(bram, sum);
    newData[3].power = dsp;
    newData[3].percent = percentage(dsp, sum);
    newData[4].power = io;
    newData[4].percent = percentage(io, sum);
    newData[5].power = sum;
    newData[5].percent = percentage(sum, sum + stat);
    newData[6].power = stat;
    newData[6].percent = percentage(stat, sum + stat);
    setData([...newData]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, clocking, fle, dsp, bram, io]);

  return (
    <PowerSummaryTable
      title="FPGA Complex and Core Power"
      data={data}
      total={data[5].power + data[6].power}
      percent={0}
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
