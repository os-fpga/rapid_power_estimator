import React from 'react';
import PropTypes from 'prop-types';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { Tooltip } from 'antd';
import { PowerCell } from './TableCells';
import { fixed, color } from '../../utils/common';
import { State } from '../ComponentsLib';

import '../style/PowerSummaryTable.css';

function PowerSummaryTableToolTip({ title, statusColor }) {
  return (
    <Tooltip title={title} color={statusColor} placement="left">
      <div>
        <IoMdCloseCircleOutline color={statusColor} size={18} />
      </div>
    </Tooltip>
  );
}
function PowerSummaryTable({
  title, data, total, percent,
}) {
  function getErrors(messages) {
    if (messages === undefined) return [];
    const errors = messages.filter((item) => item.filter((inner) => inner.type === 'error').length > 0);
    return errors;
  }
  function getWarning(messages) {
    if (messages === undefined) return [];
    const warnings = messages.filter((item) => item.filter((inner) => inner.type === 'warn').length > 0);
    return warnings;
  }
  function buildMessage(messages) {
    return messages.reduce((sum, item) => {
      item.forEach((i, index) => sum.push(
        // eslint-disable-next-line react/no-array-index-key
        <span key={index}>
          {i.text}
          <br />
        </span>,
      ));
      return sum;
    }, []);
  }
  function message(messages) {
    const errors = getErrors(messages);
    if (errors.length > 0) {
      return buildMessage(errors);
    }
    const warnings = getWarning(messages);
    if (warnings.length > 0) {
      return buildMessage(warnings);
    }
    return '';
  }

  function isError(messages) { return getErrors(messages).length > 0; }
  function isWarning(messages) { return getWarning(messages).length > 0; }
  function statusColor(messages) {
    return color(isError(messages), isWarning(messages));
  }
  return (
    <div className="pst-container main-border">
      <div className="no-wrap bold-text-title">{title}</div>
      <div>
        <table className="pst-table">
          <tbody>
            {
              data.map((item) => (
                <tr key={item.text}>
                  <td className="dot-td"><State messages={item.messages} baseClass="dot" /></td>
                  <td className="no-wrap">{item.text}</td>
                  <PowerCell val={item.power} />
                  <td className="no-wrap" style={{ textAlign: 'right' }}>
                    {`${fixed(item.percent, 0)} %`}
                  </td>
                  <td className="fixed-col">
                    {
                      (isError(item.messages) || isWarning(item.messages)) && (
                        <PowerSummaryTableToolTip
                          title={message(item.messages)}
                          statusColor={statusColor(item.messages)}
                        />
                      )
                    }
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
            {`${fixed(percent, 0)} %`}
          </label>
          <progress id="progress-bar" value={percent} max={100} />
        </div>
        <div className="pst-bottom-total bold-text-title">
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
