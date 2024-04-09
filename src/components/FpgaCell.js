import React from 'react';
import PropTypes from 'prop-types';
import { fixed } from '../utils/common';
import { useSelection } from '../SelectionProvider';
import { State } from './ComponentsLib';

import './style/base.css';

function FpgaCell({
  power, powerWarm, powerErr, title,
}) {
  const { selectedItem } = useSelection();
  function getBaseClass() {
    return (selectedItem === title) ? 'one-block clickable selected' : 'one-block clickable';
  }
  return (
    <State refValue={power} warn={powerWarm} err={powerErr} baseClass={getBaseClass()}>
      <div className="bold-text-title">{title}</div>
      <div className="grayed-text">
        {fixed(power)}
        {' W'}
      </div>
      <div className="grayed-text">
        XX %
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
