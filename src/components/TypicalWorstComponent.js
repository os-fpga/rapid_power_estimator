import React from 'react';
import { AiFillThunderbolt } from 'react-icons/ai';
import { fixed } from '../utils/common';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { State } from './ComponentsLib';

import './style/TypicalWorstComponent.css';

function Column({
  title, power, messages, temp,
}) {
  return (
    <div className="column">
      <div className="grayed-text title-div">{title}</div>
      <div className="column-h2">
        <State messages={messages} baseClass="indicator" />
        <div>
          <div className="power-row big-font bold-text">
            <div className="no-wrap big-font">
              {fixed(power, 2)}
              {' W'}
            </div>
            <AiFillThunderbolt className="thunder" />
          </div>
          <div className="big-font grayed-text">
            {temp}
            {' C'}
          </div>
        </div>
      </div>
    </div>
  );
}

function TypicalWorstComponent() {
  const { thermalData } = useSocTotalPower();
  return (
    <div className="twc-main main-border">
      <Column
        title="Typical"
        power={thermalData.typical.total_power}
        messages={[]}
        temp={thermalData.typical.thermal}
      />
      <Column
        title="Worst case"
        power={thermalData.worsecase.total_power}
        messages={[]}
        temp={thermalData.worsecase.thermal}
      />
    </div>
  );
}

export default TypicalWorstComponent;
