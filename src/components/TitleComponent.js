import React from 'react';
import PropTypes from 'prop-types';
import { fixed } from '../utils/common';

import './style/TitleComponent.css';

function TitleComponent({
  title, staticText, dynamicPower, staticPower,
}) {
  function getTotal() {
    return dynamicPower + staticPower;
  }
  return (
    <>
      <div className="bold-text-title">{title}</div>
      <div className="row-container">
        <div className="bold-text">Total</div>
        <div className="label-value bold-text">
          {fixed(getTotal())}
          {' W'}
        </div>
        <div className="label-value bold-text label-percent">0 %</div>
      </div>
      <div className="row-container">
        <div className="grayed-text">Dynamic</div>
        <div className="grayed-text label-value">
          {fixed(dynamicPower)}
          {' W'}
        </div>
        <div className="grayed-text label-value label-percent">
          {fixed(getTotal() ? ((dynamicPower / getTotal()) * 100) : 0, 0)}
          {' %'}
        </div>
      </div>
      <div className="row-container">
        <div className="grayed-text">{staticText}</div>
        <div className="grayed-text label-value">
          {fixed(staticPower)}
          {' W'}
        </div>
        <div className="grayed-text label-value label-percent">
          {fixed(getTotal() ? ((staticPower / getTotal()) * 100) : 0, 0)}
          {' %'}
        </div>
      </div>
    </>
  );
}

TitleComponent.propTypes = {
  title: PropTypes.string.isRequired,
  staticText: PropTypes.string.isRequired,
  dynamicPower: PropTypes.number.isRequired,
  staticPower: PropTypes.number.isRequired,
};

export default TitleComponent;
