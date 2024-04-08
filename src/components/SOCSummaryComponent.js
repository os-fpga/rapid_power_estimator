import React from 'react';
import PropTypes from 'prop-types';
import PowerSummaryTable from './Tables/PowerSummaryTable';
import { percentage } from '../utils/common';
import { useSocTotalPower } from '../SOCTotalPowerProvider';

function SOCSummaryComponent({ device }) {
  const [data, setData] = React.useState([
    {
      text: 'Memory',
      power: 0,
      percent: 0,
    },
    {
      text: 'Peripherals',
      power: 0,
      percent: 0,
    },
    {
      text: 'ACPU',
      power: 0,
      percent: 0,
    },
    {
      text: 'DMA',
      power: 0,
      percent: 0,
    },
    {
      text: 'Interconnect',
      power: 0,
      percent: 0,
    },
    {
      text: 'BCPU',
      power: 0,
      percent: 0,
    },
    {
      text: 'Processing Dynamic',
      power: 0,
      percent: 0,
    },
    {
      text: 'Processing Static',
      power: 0,
      percent: 0,
    },
  ]);
  const {
    power, dynamicPower, staticPower, calcPercents,
  } = useSocTotalPower();

  React.useEffect(() => {
    if (device !== null) {
      const newData = data;
      newData[0].power = power.total_memory_power;
      newData[0].percent = percentage(power.total_memory_power, dynamicPower);
      newData[1].power = power.total_peripherals_power;
      newData[1].percent = percentage(power.total_peripherals_power, dynamicPower);
      newData[2].power = power.total_acpu_power;
      newData[2].percent = percentage(power.total_acpu_power, dynamicPower);
      newData[3].power = power.total_dma_power;
      newData[3].percent = percentage(power.total_dma_power, dynamicPower);
      newData[4].power = power.total_noc_interconnect_power;
      newData[4].percent = percentage(power.total_noc_interconnect_power, dynamicPower);
      newData[5].power = power.total_bcpu_power;
      newData[5].percent = percentage(power.total_bcpu_power, dynamicPower);
      newData[6].power = dynamicPower;
      newData[6].percent = percentage(dynamicPower, dynamicPower + staticPower);
      newData[7].power = staticPower;
      newData[7].percent = percentage(staticPower, dynamicPower + staticPower);
      setData([...newData]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, power]);

  return (
    <PowerSummaryTable
      title="Processing Complex (SOC) Power"
      data={data}
      total={data[6].power + data[7].power}
      percent={calcPercents(data[6].power + data[7].power)}
    />
  );
}

SOCSummaryComponent.propTypes = {
  device: PropTypes.string,
};

SOCSummaryComponent.defaultProps = {
  device: null,
};

export default SOCSummaryComponent;
