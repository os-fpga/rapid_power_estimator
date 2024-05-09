import React from 'react';
import PropTypes from 'prop-types';
import * as server from '../utils/serverAPI';
import { fixed, percentage } from '../utils/common';
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
  const { power, dynamicPower } = useSocTotalPower();
  const { socState } = useGlobalState();

  const update = React.useCallback(() => {
    if (peripherals) {
      const { memory } = peripherals;
      if (memory) {
        memory.forEach((mem) => {
          const index = parseInt(mem.href.slice(-1), 10);
          server.GET(server.peripheralPath(device, mem.href), (memJson) => {
            setMemData((prev) => prev.map((it, idx) => {
              if (index === idx) return memJson;
              return it;
            }));
          });
        });
      }
    }
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

  return (
    <State messages={socState.memory} baseClass={getBaseClass()}>
      <div className="mem-line">
        <div className="bold-text">{Title}</div>
        <div className="grayed-text bold-text mem-value">
          {fixed(power.total_memory_power)}
          {' W'}
        </div>
        <div className="grayed-text bold-text mem-value">
          {percentage(power.total_memory_power, dynamicPower)}
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
};

MemoryComponent.defaultProps = {
  device: null,
};

export default MemoryComponent;
