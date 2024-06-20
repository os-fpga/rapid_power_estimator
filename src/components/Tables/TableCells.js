import React from 'react';
import { fixed, GetText } from '../../utils/common';

function showFreq(value) {
  if (value < 999) return `${fixed(value, 0)} Hz`;
  if (value < 999999) return `${fixed(value / 1000, 0)} kHz`;
  return `${fixed(value / 1000000, 0)} MHz`;
}

export function PercentsCell({ rowSpan, precition, val }) {
  return (
    <td rowSpan={rowSpan}>
      {fixed(val * 100, precition || 0)}
      {' %'}
    </td>
  );
}

export function FrequencyCell({ rowSpan, val }) {
  return <td rowSpan={rowSpan}>{showFreq(val)}</td>;
}

export function PowerCell({ rowSpan, val }) {
  return (
    <td className="no-wrap" rowSpan={rowSpan}>
      {fixed(val, 3)}
      {' W'}
    </td>
  );
}

export function SelectionCell({ val, values }) {
  return <td>{GetText(val, values)}</td>;
}

export function BandwidthCell({ val }) {
  return <td>{`${val} MB/s`}</td>;
}
