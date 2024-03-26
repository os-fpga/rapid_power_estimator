import React from 'react';
import PropTypes from 'prop-types';
import { fixed, State } from '../utils/common';

import './style/base.css';

function FpgaCell({
  power, powerWarm, powerErr, title,
}) {
  return (
    <State refValue={power} warn={powerWarm} err={powerErr}>
      <div className="bold-text-title">{title}</div>
      <div className="grayed-text">
        {fixed(power)}
        {' W'}
      </div>
    </State>
  );
}

FpgaCell.propTypes = {
  power: PropTypes.number.isRequired,
  powerWarm: PropTypes.number.isRequired,
  powerErr: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

export default FpgaCell;
