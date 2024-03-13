import React from 'react';
import { AiFillThunderbolt } from 'react-icons/ai';
import { fixed } from '../utils/common';

import './style/TypicalWorstComponent.css';

function Column({ title, power, temp }) {
  return (
    <div className="column">
      <div className="grayed-text title-div">{title}</div>
      <div className="column-h2">
        <div className="indicator" />
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
  return (
    <div className="twc-main">
      <Column title="Typical" power={20} temp={25} />
      <Column title="Worst case" power={20} temp={85} />
    </div>
  );
}

export default TypicalWorstComponent;
