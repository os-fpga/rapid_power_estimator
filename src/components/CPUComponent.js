import React from 'react';
import { fixed } from '../utils/common';

import './style/CPUComponent.css';

function CPUComponent({
  title, power, name, ep0 = 0, ep1 = 0, ep2 = 0, ep3 = 0,
}) {
  return (
    <div className="cpu-component-top">
      <div className="cpu-component-l1">
        <div className="cpu-component-title">{title}</div>
        <div className="cpu-component-power">
          {fixed(power, 3)}
          {' W'}
        </div>
      </div>
      <div className="cpu-component-l2">
        <div className="cpu-component-power grayed-text">{name}</div>
      </div>
      <div className="cpu-component-l3 grayed-text">
        <div className="cpu-component-power">Endpoint 1</div>
        <div className="cpu-component-power-val">
          {fixed(ep0, 3)}
          {' W'}
        </div>
      </div>
      <div className="cpu-component-l3 grayed-text">
        <div className="cpu-component-power">Endpoint 2</div>
        <div className="cpu-component-power-val">
          {fixed(ep1, 3)}
          {' W'}
        </div>
      </div>
      <div className="cpu-component-l3 grayed-text">
        <div className="cpu-component-power">Endpoint 3</div>
        <div className="cpu-component-power-val">
          {fixed(ep2, 3)}
          {' W'}
        </div>
      </div>
      <div className="cpu-component-l3 grayed-text">
        <div className="cpu-component-power">Endpoint 4</div>
        <div className="cpu-component-power-val">
          {fixed(ep3, 3)}
          {' W'}
        </div>
      </div>
    </div>
  );
}

export default CPUComponent;
