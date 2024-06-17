import React from 'react';
import PropTypes from 'prop-types';
import * as server from '../utils/serverAPI';
import { fixed, getPeripherals } from '../utils/common';
import { subscribe, unsubscribe } from '../utils/events';
import { useSelection } from '../SelectionProvider';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { State } from './ComponentsLib';
import { useGlobalState } from '../GlobalStateProvider';

import './style/MemoryComponent.css';

function MemoryComponent({ device, peripherals }) {
  const [dev, setDev] = React.useState(null);
  const [memData, setMemData] = React.useState([
    {
      name: 'DDR',
      consumption: {
        block_power: 0,
        percentage: 0,
      },
    },
    {
      name: 'On Chip',
      consumption: {
        block_power: 0,
        percentage: 0,
      },
    },
  ]);
  const { selectedItem } = useSelection();
  const { totalConsumption } = useSocTotalPower();
  const { socState } = useGlobalState();
  const ddr = getPeripherals(peripherals, 'ddr');
  const ocm = getPeripherals(peripherals, 'ocm');
  const href = [...ddr, ...ocm];

  const update = React.useCallback(() => {
    href.forEach((mem) => {
      const index = href.indexOf(mem);
      server.GET(server.peripheralPath(device, mem.href), (memJson) => {
        setMemData((prev) => prev.map((it, idx) => {
          if (index === idx) return memJson;
          return it;
        }));
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, peripherals]);

  React.useEffect(() => update(), [update]);

  React.useEffect(() => {
    subscribe('memoryChanged', update);
    return () => { unsubscribe('memoryChanged', update); };
  });

  if (dev !== device) {
    setDev(device);
    if (device !== null) update();
  }

  const Title = 'Memory';
  function getBaseClass() {
    return (selectedItem === Title) ? 'mem-container selected' : 'mem-container';
  }

  const memory = totalConsumption.processing_complex.dynamic.components.find((elem) => elem.type === 'memory');

  return (
    <State messages={socState.memory} baseClass={getBaseClass()}>
      <div className="mem-line">
        <div className="bold-text">{Title}</div>
        <div className="grayed-text bold-text mem-value">
          {fixed(memory ? memory.power : 0)}
          {' W'}
        </div>
        <div className="grayed-text bold-text mem-value">
          {fixed(memory ? memory.percentage : 0, 0)}
          {' %'}
        </div>
      </div>
      <div className="mem-grid">
        {
          memData.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className="mem-line-parent grayed-text">
              <div className="mem-name">{item.name}</div>
              <div className="mem-value">
                {fixed(item.consumption.block_power)}
                {' W'}
              </div>
              <div className="mem-value">
                {fixed(item.consumption.percentage, 0)}
                {' %'}
              </div>
            </div>
          ))
      }
      </div>
    </State>
  );
}

MemoryComponent.propTypes = {
  device: PropTypes.string,
  peripherals: PropTypes.oneOfType([PropTypes.array]).isRequired,
};

MemoryComponent.defaultProps = {
  device: null,
};

export default MemoryComponent;
