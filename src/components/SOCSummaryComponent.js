import React from 'react';
import PropTypes from 'prop-types';
import PowerSummaryTable from './Tables/PowerSummaryTable';
import * as server from '../utils/serverAPI';
import { percentage } from '../utils/common';

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

  React.useEffect(() => {
    server.GET(server.api.consumption(server.Elem.peripherals, device), (consumption) => {
      const newData = data;
      const dynamic = consumption.total_memory_power
      + consumption.total_peripherals_power
      + consumption.total_acpu_power
      + consumption.total_dma_power
      + consumption.total_noc_interconnect_power
      + consumption.total_bcpu_power;
      const stat = 0;
      newData[0].power = consumption.total_memory_power;
      newData[0].percent = percentage(consumption.total_memory_power, dynamic);
      newData[1].power = consumption.total_peripherals_power;
      newData[1].percent = percentage(consumption.total_peripherals_power, dynamic);
      newData[2].power = consumption.total_acpu_power;
      newData[2].percent = percentage(consumption.total_acpu_power, dynamic);
      newData[3].power = consumption.total_dma_power;
      newData[3].percent = percentage(consumption.total_dma_power, dynamic);
      newData[4].power = consumption.total_noc_interconnect_power;
      newData[4].percent = percentage(consumption.total_noc_interconnect_power, dynamic);
      newData[5].power = consumption.total_bcpu_power;
      newData[5].percent = percentage(consumption.total_bcpu_power, dynamic);
      newData[6].power = dynamic;
      newData[6].percent = percentage(dynamic, dynamic + stat);
      newData[7].power = stat;
      newData[7].percent = percentage(stat, dynamic + stat);
      setData([...newData]);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  return (
    <PowerSummaryTable
      title="Processing Complex (SOC) Power"
      data={data}
      total={data[6].power + data[7].power}
      percent={0}
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
