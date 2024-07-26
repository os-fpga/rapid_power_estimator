import React from 'react';
import PropTypes from 'prop-types';
import PowerSummaryTable from './Tables/PowerSummaryTable';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { useGlobalState } from '../GlobalStateProvider';

function SOCSummaryComponent({ device }) {
  const dataDefault = [
    {
      text: 'Memory',
      power: 0,
      percent: 0,
      messages: [],
    },
    {
      text: 'Peripherals',
      power: 0,
      percent: 0,
      messages: [],
    },
    {
      text: 'ACPU',
      power: 0,
      percent: 0,
      messages: [],
    },
    {
      text: 'DMA',
      power: 0,
      percent: 0,
      messages: [],
    },
    {
      text: 'Interconnect',
      power: 0,
      percent: 0,
      messages: [],
    },
    {
      text: 'BCPU',
      power: 0,
      percent: 0,
      messages: [],
    },
    {
      text: 'Processing Dynamic',
      power: 0,
      percent: 0,
      messages: [],
    },
    {
      text: 'Processing Static',
      power: 0,
      percent: 0,
      messages: [],
    },
  ];
  const [data, setData] = React.useState(dataDefault);
  const { totalConsumption } = useSocTotalPower();
  const { socState } = useGlobalState();

  function getPeripheralsMessages() {
    let arr = [];
    Object.entries(socState).forEach((item) => {
      if (item.length > 1) {
        const [key, array] = item;
        if (key !== 'acpu' && key !== 'bcpu' && key !== 'ocm' && key !== 'ddr' && key !== 'dma' && key !== 'fpga_complex') {
          arr = arr.concat(array);
        }
      }
    });
    return arr;
  }

  const processingComplex = totalConsumption.processing_complex;

  React.useEffect(() => {
    const newData = dataDefault;
    const { dynamic } = totalConsumption.processing_complex;
    const memory = dynamic.components.find((element) => element.type === 'memory');
    if (memory) {
      newData[0].power = memory.power;
      newData[0].percent = memory.percentage;
      let memoryMessages = [];
      if (socState.ddr !== undefined) memoryMessages = [...socState.ddr];
      if (socState.ocm !== undefined) memoryMessages = [...memoryMessages, ...socState.ocm];
      newData[0].messages = memoryMessages;
    }
    const peripherals = dynamic.components.find((element) => element.type === 'peripherals');
    if (peripherals) {
      newData[1].power = peripherals.power;
      newData[1].percent = peripherals.percentage;
      newData[1].messages = getPeripheralsMessages();
    }
    const acpu = dynamic.components.find((element) => element.type === 'acpu');
    if (acpu) {
      newData[2].power = acpu.power;
      newData[2].percent = acpu.percentage;
      newData[2].messages = socState.acpu;
    }
    const dma = dynamic.components.find((element) => element.type === 'dma');
    if (dma) {
      newData[3].power = dma.power;
      newData[3].percent = dma.percentage;
      newData[3].messages = socState.dma;
    }
    const noc = dynamic.components.find((element) => element.type === 'noc');
    if (noc) {
      newData[4].power = noc.power;
      newData[4].percent = noc.percentage;
      newData[4].messages = socState.fpga_complex;
    }
    const bcpu = dynamic.components.find((element) => element.type === 'bcpu');
    if (bcpu) {
      newData[5].power = bcpu.power;
      newData[5].percent = bcpu.percentage;
      newData[5].messages = socState.bcpu;
    }

    newData[6].power = processingComplex.dynamic.power;
    newData[6].percent = processingComplex.dynamic.percentage;
    newData[7].power = processingComplex.static.power;
    newData[7].percent = processingComplex.static.percentage;
    setData([...newData]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, socState, totalConsumption]);

  return (
    <PowerSummaryTable
      title="Processing Complex (SOC) Power"
      data={data}
      total={processingComplex.total_power}
      percent={processingComplex.total_percentage}
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
