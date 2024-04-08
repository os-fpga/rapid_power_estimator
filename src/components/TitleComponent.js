import React from 'react';
import PropTypes from 'prop-types';
import { fixed } from '../utils/common';
import { useSocTotalPower } from '../SOCTotalPowerProvider';

import './style/TitleComponent.css';

function TitleComponent({
  title, staticText, dynamicPower, staticPower,
}) {
  const { calcPercents } = useSocTotalPower();
  function getTotal() {
    return dynamicPower + staticPower;
  }
  return (
    <div>
      <div className="bold-text-title">{title}</div>
      <div className="title-grid">
        <div className="title-comp-total-text">Total</div>
        <div className="label-value title-comp-total-text">
          {fixed(getTotal())}
          {' W'}
        </div>
        <div className="label-value title-comp-total-text">
          {fixed(calcPercents(getTotal()), 0)}
          {' %'}
        </div>
        <div className="grayed-text">Dynamic</div>
        <div className="grayed-text label-value">
          {fixed(dynamicPower)}
          {' W'}
        </div>
        <div className="grayed-text label-value">
          {fixed(getTotal() ? ((dynamicPower / getTotal()) * 100) : 0, 0)}
          {' %'}
        </div>
        <div className="grayed-text">{staticText}</div>
        <div className="grayed-text label-value">
          {fixed(staticPower)}
          {' W'}
        </div>
        <div className="grayed-text label-value">
          {fixed(getTotal() ? ((staticPower / getTotal()) * 100) : 0, 0)}
          {' %'}
        </div>
      </div>
    </div>
  );
}

TitleComponent.propTypes = {
  title: PropTypes.string.isRequired,
  staticText: PropTypes.string.isRequired,
  dynamicPower: PropTypes.number.isRequired,
  staticPower: PropTypes.number.isRequired,
};

export default TitleComponent;
