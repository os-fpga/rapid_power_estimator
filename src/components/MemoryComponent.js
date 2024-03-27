import React from 'react';
import PropTypes from 'prop-types';
import * as server from '../utils/serverAPI';
import { fixed, State } from '../utils/common';
import { subscribe, unsubscribe } from '../utils/events';

import './style/MemoryComponent.css';

function MemoryComponent({ device }) {
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
  const [power, setPower] = React.useState(0);

  function update() {
    server.GET(server.api.consumption(server.Elem.peripherals, device), (data) => {
      setPower(data.total_memory_power);
    });
    server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
      const { memory } = data;
      memory.forEach((mem) => {
        const index = parseInt(mem.href.slice(-1), 10);
        server.GET(server.peripheralPath(device, mem.href), (memJson) => {
          const newData = memData.map((it, idx) => {
            if (index === idx) return memJson;
            return it;
          });
          setMemData(newData);
        });
      });
    });
  }

  React.useEffect(() => {
    subscribe('memoryChanged', update);
    return () => { unsubscribe('memoryChanged', update); };
  });

  React.useEffect(() => {
    if (device !== null) {
      update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  const warn = 0.001; // TBD
  const error = 0.016; // TBD

  return (
    <State refValue={power} warn={warn} err={error} baseClass="mem-container">
      <div className="mem-line">
        <div className="bold-text">Memory</div>
        <div className="grayed-text bold-text mem-value">
          {fixed(power)}
          {' W'}
        </div>
      </div>
      {
          memData.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className="mem-line grayed-text">
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
