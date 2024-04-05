import React from 'react';
import { fixed } from '../../utils/common';

import '../style/PowerTable.css';

function PowerTable({
  title, total, resourcesHeaders, resources, subHeader = 'Resources',
}) {
  return (
    <div className="power-table-main main-border">
      <div className="header">{title}</div>
      {total !== null && (
        <div>
          <table className="total-table header">
            <tbody>
              <tr>
                <td>Total</td>
                <td className="no-wrap">
                  {fixed(parseFloat(total))}
                  {' W'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <div className="header">{subHeader}</div>
      <div>
        <table className="resources-table">
          <thead>
            <tr className="innerHeader">
              <th aria-label="empty" />
              {
                resourcesHeaders.map((item) => <th key={item}>{item}</th>)
              }
            </tr>
          </thead>
          <tbody>
            {
              resources.map((item, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={index}>
                  <td className="innerHeader no-wrap">{item[0]}</td>
                  <td>{item[1]}</td>
                  <td className="no-wrap">
                    {item[2]}
                    {item.length === 3 ? ' %' : ''}
                  </td>
                  <td className="no-wrap">
                    {item[3]}
                    {item.length === 4 ? ' %' : ''}
                  </td>
                  <td className="no-wrap">
                    {item[4]}
                    {item.length === 5 ? ' %' : ''}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PowerTable;
