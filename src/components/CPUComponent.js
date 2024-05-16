import React from 'react';
import PropTypes from 'prop-types';
import { fixed } from '../utils/common';

import './style/CPUComponent.css';

const text = [
  'Endpoint 1', 'Endpoint 2', 'Endpoint 3', 'Endpoint 4',
];

function CPUComponent({
  title, power, percent = 0, name, endpointText = text, ep0 = 0, ep1 = 0, ep2 = 0, ep3 = 0,
}) {
  return (
    <div className="cpu-component-top">
      <div className="cpu-component-l1">
        <div className="cpu-component-title">{title}</div>
        <div className="cpu-component-power grayed-text">
          {fixed(power, 3)}
          {' W'}
        </div>
        <div className="cpu-component-power grayed-text">
          {fixed(percent, 0)}
          {' %'}
        </div>
      </div>
      <div className="cpu-component-l2">
        <div className="cpu-component-power grayed-text">{name}</div>
      </div>
      <div className="cpu-component-l3 grayed-text">
        <div className="cpu-component-power">{endpointText[0]}</div>
        <div className="cpu-component-power-val">
          {fixed(ep0, 3)}
          {' W'}
        </div>
      </div>
      <div className="cpu-component-l3 grayed-text">
        <div className="cpu-component-power">{endpointText[1]}</div>
        <div className="cpu-component-power-val">
          {fixed(ep1, 3)}
          {' W'}
        </div>
      </div>
      <div className="cpu-component-l3 grayed-text">
        <div className="cpu-component-power">{endpointText[2]}</div>
        <div className="cpu-component-power-val">
          {fixed(ep2, 3)}
          {' W'}
        </div>
      </div>
      <div className="cpu-component-l3 grayed-text">
        <div className="cpu-component-power">{endpointText[3]}</div>
        <div className="cpu-component-power-val">
          {fixed(ep3, 3)}
          {' W'}
        </div>
      </div>
    </div>
  );
}

CPUComponent.propTypes = {
  title: PropTypes.string.isRequired,
  power: PropTypes.number.isRequired,
  percent: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  endpointText: PropTypes.arrayOf(PropTypes.string),
  ep0: PropTypes.number.isRequired,
  ep1: PropTypes.number.isRequired,
  ep2: PropTypes.number.isRequired,
  ep3: PropTypes.number.isRequired,
};

CPUComponent.defaultProps = {
  endpointText: text,
};

export default CPUComponent;
