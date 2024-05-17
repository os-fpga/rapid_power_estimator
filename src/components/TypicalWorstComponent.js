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
            {`${fixed(temp, 0)} °C`}
          </div>
        </div>
      </div>
    </div>
  );
}

function TypicalWorstComponent() {
  const { totalConsumption } = useSocTotalPower();

  const typical = totalConsumption.total_power_temperature.find((elem) => elem.type === 'typical');
  const worsecase = totalConsumption.total_power_temperature.find((elem) => elem.type === 'worsecase');

  return (
    <div className="twc-main main-border">
      <Column
        title="Typical"
        power={typical ? typical.power : 0}
        messages={[]}
        temp={typical ? typical.temperature : 0}
      />
      <Column
        title="Worst case"
        power={worsecase ? worsecase.power : 0}
        messages={[]}
        temp={worsecase ? worsecase.temperature : 0}
      />
    </div>
  );
}

export default TypicalWorstComponent;
