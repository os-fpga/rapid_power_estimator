import React from 'react';
import { AiFillThunderbolt } from 'react-icons/ai';
import { fixed, State } from '../utils/common';
import { useSocTotalPower } from '../SOCTotalPowerProvider';

import './style/TypicalWorstComponent.css';

function Column({
  title, power, warnPow, errPow, temp,
}) {
  return (
    <div className="column">
      <div className="grayed-text title-div">{title}</div>
      <div className="column-h2">
        <State refValue={power} warn={warnPow} err={errPow} baseClass="indicator" />
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

const warnTypical = 10; // TBD
const errorTypical = 40; // TBD

const warnWorst = 40; // TBD
const errorWorst = 10; // TBD

function TypicalWorstComponent() {
  const { thermalData } = useSocTotalPower();
  return (
    <div className="twc-main main-border">
      <Column
        title="Typical"
        power={thermalData.typical.total_power}
        warnPow={warnTypical}
        errPow={errorTypical}
        temp={thermalData.typical.thermal}
      />
      <Column
        title="Worst case"
        power={thermalData.worsecase.total_power}
        warnPow={warnWorst}
        errPow={errorWorst}
        temp={thermalData.worsecase.thermal}
      />
    </div>
  );
}

export default TypicalWorstComponent;
