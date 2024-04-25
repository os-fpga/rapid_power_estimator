import React from 'react';
import PropTypes from 'prop-types';
import { fixed } from '../utils/common';
import { useSelection } from '../SelectionProvider';
import { State } from './ComponentsLib';

import './style/base.css';

function FpgaCell({ power, messages, title }) {
  const { selectedItem } = useSelection();
  function getBaseClass() {
    return (selectedItem === title) ? 'one-block clickable selected' : 'one-block clickable';
  }
  return (
    <State messages={messages} baseClass={getBaseClass()}>
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
  title: PropTypes.string.isRequired,
  messages: PropTypes.oneOfType([PropTypes.array]).isRequired,
};

export default FpgaCell;
