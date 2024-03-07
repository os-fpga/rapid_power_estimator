import React from 'react';
import { AiFillThunderbolt } from 'react-icons/ai';
import { fixed } from '../../utils/common';

import '../style/PowerTable.css';

function IOPowerTable({ title, total, resources }) {
  return (
    <div className="power-table-main">
      <div className="header">{title}</div>
      <div>
        <table className="total-table header">
          <tbody>
            <tr>
              <td>Total</td>
              <td>
                {fixed(parseFloat(total))}
                {' W'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="header">Resources</div>
      <div>
        <table className="resources-table">
          <thead>
            <tr className="innerHeader">
              <th colSpan={2} />
              <th colSpan={2}>Bank</th>
              <th colSpan={3}>IO</th>
            </tr>
            <tr className="innerHeader">
              <th />
              <th><AiFillThunderbolt /></th>
              <th>Used</th>
              <th>Total</th>
              <th>I/O</th>
              <th>Available</th>
              <th>Total</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {
              resources.io_usage.map((elem) => (
                <React.Fragment key={elem.type}>
                  <tr>
                    <td className="innerHeader no-wrap" rowSpan={3}>{elem.type}</td>
                    <td>{elem.usage[0].voltage}</td>
                    <td>{elem.usage[0].banks_used}</td>
                    <td rowSpan={3}>{elem.total_banks_available}</td>
                    <td>{elem.usage[0].io_used}</td>
                    <td>{elem.usage[0].io_available}</td>
                    <td rowSpan={3}>{elem.total_io_available}</td>
                  </tr>
                  <tr>
                    <td>{elem.usage[1].voltage}</td>
                    <td>{elem.usage[1].banks_used}</td>
                    <td>{elem.usage[1].io_used}</td>
                    <td>{elem.usage[1].io_available}</td>
                  </tr>
                  <tr>
                    <td>{elem.usage[2].voltage}</td>
                    <td>{elem.usage[2].banks_used}</td>
                    <td>{elem.usage[2].io_used}</td>
                    <td>{elem.usage[2].io_available}</td>
                  </tr>
                </React.Fragment>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IOPowerTable;
