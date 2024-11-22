import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { Tooltip } from 'antd';
import { PowerCell } from './TableCells';
import { fixed, color } from '../../utils/common';
import { State } from '../ComponentsLib';
import { api, PATCH, GET } from '../../utils/serverAPI'; 
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
  title, data = [], total = 0, percent = 0, deviceId = 'MPW1'
}) {
  const [thermalData, setThermalData] = useState({
    ambientTypical: 25,
    ambientWorstCase: 50,
    thetaJa: 10,
  });

  const [powerData, setPowerData] = useState({
    powerBudget: 1.00,
    fpgaScaling: 25,
    pcScaling: 25,
  });

  const ambientTypicalRef = useRef(null);
  const ambientWorstCaseRef = useRef(null);
  const thetaJaRef = useRef(null);
  const powerBudgetRef = useRef(null);
  const fpgaScalingRef = useRef(null);
  const pcScalingRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        GET(api.consumption('consumption', deviceId), (result) => {
          if (result && result.specification) {
            const { specification } = result;
            setThermalData({
              ambientTypical: specification.thermal.ambient.typical,
              ambientWorstCase: specification.thermal.ambient.worstcase,
              thetaJa: specification.thermal.theta_ja,
            });
            setPowerData({
              powerBudget: specification.power.budget,
              fpgaScaling: specification.power.typical_dynamic_scaling.fpga_complex * 100,
              pcScaling: specification.power.typical_dynamic_scaling.processing_complex * 100,
            });
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [deviceId]);

  const updateBackend = async (updatedData) => {
    try {
      PATCH(api.deviceInfo(deviceId), updatedData, () => {
        console.log('Backend updated successfully');
        fetchData(); // refetching to sync UI with backend
      });
    } catch (error) {
      console.error("Error updating backend:", error);
    }
  };

  const handleFieldUpdate = (field, value) => {
    const updatedThermalData = { ...thermalData };
    const updatedPowerData = { ...powerData };

    if (field in thermalData) {
      updatedThermalData[field] = value;
    } else {
      updatedPowerData[field] = value;
    }

    setThermalData(updatedThermalData);
    setPowerData(updatedPowerData);

    const updatedData = {
      specification: {
        thermal: updatedThermalData,
        power: updatedPowerData,
      },
    };

    updateBackend(updatedData);
  };

  const enforceNumericInput = (e) => {
    const value = e.target.value;
    const valid = /^-?\d*\.?\d*%?$/.test(value);
    if (!valid) {
      e.target.value = value.slice(0, -1);
    }
  };

  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === 'Enter' && nextFieldRef && nextFieldRef.current) {
      nextFieldRef.current.focus();
    }
  };

  const getErrors = (messages) => messages?.filter((item) => item.some((inner) => inner.type === 'error')) || [];
  const getWarnings = (messages) => messages?.filter((item) => item.some((inner) => inner.type === 'warn')) || [];

  const buildMessage = (messages) => 
    messages.reduce((acc, item, currentIndex) => {
      item.forEach((i, index) => acc.push(<span key={`${currentIndex}+${index}`}>{i.text}<br /></span>));
      return acc;
    }, []);

  const message = (messages) => {
    const errors = getErrors(messages);
    return errors.length > 0 ? buildMessage(errors) : buildMessage(getWarnings(messages));
  };

  const statusColor = (messages) => color(getErrors(messages).length > 0, getWarnings(messages).length > 0);

  return (
    <div className="pst-container main-border">
      {title === 'FPGA Complex and Core Power' && (
        <div className="thermal-power-specification">
          <div className="spec-header">Thermal Specification</div>
          <table className="spec-table">
            <thead>
              <tr>
                <th></th>
                <th className="typical-header">Typical</th>
                <th className="worst-header">Worst-Case</th>
              </tr>
            </thead>
            <tbody>
              <tr className="ambient-row">
                <td>Ambient</td>
                <td className="value-cell">
                  <input
                    type="text"
                    value={thermalData.ambientTypical}
                    onChange={(e) => handleFieldUpdate('ambientTypical', e.target.value)}
                    onInput={enforceNumericInput}
                    ref={ambientTypicalRef}
                    onKeyDown={(e) => handleKeyDown(e, ambientWorstCaseRef)}
                  /> °C
                </td>
                <td className="value-cell">
                  <input
                    type="text"
                    value={thermalData.ambientWorstCase}
                    onChange={(e) => handleFieldUpdate('ambientWorstCase', e.target.value)}
                    onInput={enforceNumericInput}
                    ref={ambientWorstCaseRef}
                    onKeyDown={(e) => handleKeyDown(e, thetaJaRef)}
                  /> °C
                </td>
              </tr>
              <tr className="theta-row">
                <td colSpan="3" className="value-cell">
                  ΘJA:
                  <input
                    type="text"
                    value={thermalData.thetaJa}
                    onChange={(e) => handleFieldUpdate('thetaJa', e.target.value)}
                    onInput={enforceNumericInput}
                    ref={thetaJaRef}
                    onKeyDown={(e) => handleKeyDown(e, powerBudgetRef)}
                  /> °C/W
                </td>
              </tr>
            </tbody>
          </table>

          <div className="spec-header">Power Specification</div>
          <table className="power-spec-table">
            <tbody>
              <tr>
                <td>Power Budget</td>
                <td className="scaling-cell">
                  <input
                    type="text"
                    value={powerData.powerBudget}
                    onChange={(e) => handleFieldUpdate('powerBudget', e.target.value)}
                    onInput={enforceNumericInput}
                    ref={powerBudgetRef}
                    onKeyDown={(e) => handleKeyDown(e, fpgaScalingRef)}
                  /> W
                </td>
              </tr>
              <tr>
                <td>Typical Dynamic Scaling %</td>
                <td className="scaling-cell">
                  FPGA:
                  <input
                    type="text"
                    value={powerData.fpgaScaling}
                    onChange={(e) => handleFieldUpdate('fpgaScaling', e.target.value)}
                    onInput={enforceNumericInput}
                    ref={fpgaScalingRef}
                    onKeyDown={(e) => handleKeyDown(e, pcScalingRef)}
                  /> %
                </td>
                <td className="scaling-cell">
                  PC:
                  <input
                    type="text"
                    value={powerData.pcScaling}
                    onChange={(e) => handleFieldUpdate('pcScaling', e.target.value)}
                    onInput={enforceNumericInput}
                    ref={pcScalingRef}
                  /> %
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="no-wrap bold-text-title">{title || 'FPGA Complex and Core Power'}</div>
      <div>
        <table className="pst-table">
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className="dot-td"><State messages={item.messages} baseClass="dot" /></td>
                <td className="no-wrap">{item.text || 'N/A'}</td>
                <PowerCell val={item.power || 0} />
                <td className="no-wrap" style={{ textAlign: 'right' }}>
                  {`${fixed(item.percent || 0, 0)} %`}
                </td>
                <td className="fixed-col">
                  {(getErrors(item.messages).length > 0 || getWarnings(item.messages).length > 0) && (
                    <PowerSummaryTableToolTip
                      title={message(item.messages)}
                      statusColor={statusColor(item.messages)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="spacer" />
      <div className="pst-bottom">
        <div className="pst-bottom-progress">
          <label htmlFor="progress-bar">
            {`${fixed(percent || 0, 0)} %`}
          </label>
          <progress id="progress-bar" value={percent || 0} max={100} />
        </div>
        <div className="pst-bottom-total bold-text-title">
          Total
          <span className="bold-text-title">{`  ${fixed(total || 0)} W`}</span>
        </div>
      </div>
    </div>
  );
}

PowerSummaryTable.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  total: PropTypes.number.isRequired,
  percent: PropTypes.number.isRequired,
  deviceId: PropTypes.string.isRequired,
};

export default PowerSummaryTable;
