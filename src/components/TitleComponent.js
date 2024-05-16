import React from 'react';
import PropTypes from 'prop-types';
import { fixed } from '../utils/common';
import './style/TitleComponent.css';

function TitleComponent({
  title, staticText, dynamicPower, staticPower, total,
}) {
  return (
    <div>
      <div className="bold-text-title">{title}</div>
      <div className="title-grid">
        <div className="title-comp-total-text">Total</div>
        <div className="label-value title-comp-total-text">
          {fixed(total.power)}
          {' W'}
        </div>
        <div className="label-value title-comp-total-text">
          {fixed(total.percentage, 0)}
          {' %'}
        </div>
        <div className="grayed-text">Dynamic</div>
        <div className="grayed-text label-value">
          {fixed(dynamicPower.power)}
          {' W'}
        </div>
        <div className="grayed-text label-value">
          {fixed(dynamicPower.percentage, 0)}
          {' %'}
        </div>
        <div className="grayed-text">{staticText}</div>
        <div className="grayed-text label-value">
          {fixed(staticPower.power)}
          {' W'}
        </div>
        <div className="grayed-text label-value">
          {fixed(staticPower.percentage, 0)}
          {' %'}
        </div>
      </div>
    </div>
  );
}

TitleComponent.propTypes = {
  title: PropTypes.string.isRequired,
  staticText: PropTypes.string.isRequired,
  dynamicPower: PropTypes.oneOfType([PropTypes.object]).isRequired,
  staticPower: PropTypes.oneOfType([PropTypes.object]).isRequired,
  total: PropTypes.oneOfType([PropTypes.object]).isRequired,
};

export default TitleComponent;
