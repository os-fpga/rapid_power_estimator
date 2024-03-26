import React from 'react';
import PropTypes from 'prop-types';
import { PowerCell } from './TableCells';
import { fixed, State } from '../../utils/common';

import '../style/PowerSummaryTable.css';

function PowerSummaryTable({
  title, data, total, percent,
}) {
  const warn = 0.001; // TBD
  const error = 0.016; // TBD
  return (
    <div className="pst-container">
      <div className="no-wrap pst-title bold-text-title">{title}</div>
      <div>
        <table className="pst-table">
          <tbody>
            {
            data.map((item, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <tr key={index}>
                <td className="dot-td"><State refValue={item.power} err={error} warn={warn} baseClass="dot" /></td>
                <td className="no-wrap">{item.text}</td>
                <PowerCell val={item.power} />
                <td className="no-wrap">
                  {item.percent}
                  {' %'}
                </td>
              </tr>
            ))
          }
          </tbody>
        </table>
      </div>
      <div className="spacer" />
      <div className="pst-bottom">
        <div className="pst-bottom-progress">
          <label htmlFor="progress-bar">
            {' '}
            {percent}
            %
          </label>
          <progress id="progress-bar" value={percent} max={100} />
        </div>
        <div className="pst-bottom-total grayed-text bold-text-title">
          Total
          <span className="bold-text-title">{`  ${fixed(total)} W`}</span>
        </div>
      </div>
    </div>
  );
}

PowerSummaryTable.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.oneOfType([
    PropTypes.array,
  ]).isRequired,
  total: PropTypes.number.isRequired,
  percent: PropTypes.number.isRequired,
};

export default PowerSummaryTable;
