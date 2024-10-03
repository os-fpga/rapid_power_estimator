import React from 'react';
import { render } from '@testing-library/react';
import { PercentsCell, FrequencyCell, PowerCell, SelectionCell, BandwidthCell, DisabledCell } from '../../components/Tables/TableCells';
import { fixed, GetText } from '../../utils/common';

jest.mock('../../utils/common', () => ({
  fixed: jest.fn((val, precision) => val.toFixed(precision)),
  GetText: jest.fn((val, values) => values[val] || 'Unknown')
}));

function showFreq(value) {
  if (value < 999) return `${fixed(value, 0)} Hz`;
  if (value < 999999) return `${fixed(value / 1000, 0)} kHz`;
  return `${fixed(value / 1000000, 0)} MHz`;
}

describe('showFreq', () => {
  it('should return Hz when value is less than 999', () => {
    expect(showFreq(500)).toBe('500 Hz');
  });

  it('should return kHz when value is between 1000 and 999999', () => {
    expect(showFreq(1500)).toBe('2 kHz');
  });

  it('should return MHz when value is more than 999999', () => {
    expect(showFreq(1500000)).toBe('2 MHz');
  });
});

describe('PercentsCell', () => {
  it('should render with correct percentage and precision', () => {
    const { container } = render(<PercentsCell rowSpan={1} precition={2} val={0.85} />);
    expect(fixed).toHaveBeenCalledWith(0.85 * 100, 2);
    expect(container.textContent).toBe('85.00 %');
  });

  it('should render with default precision when not provided', () => {
    const { container } = render(<PercentsCell rowSpan={1} val={0.5} />);
    expect(fixed).toHaveBeenCalledWith(0.5 * 100, 0);
    expect(container.textContent).toBe('50 %');
  });
});

describe('FrequencyCell', () => {
  it('should render correct frequency in Hz', () => {
    const { container } = render(<FrequencyCell rowSpan={1} val={500} />);
    expect(container.textContent).toBe('500 Hz');
  });

  it('should render correct frequency in kHz', () => {
    const { container } = render(<FrequencyCell rowSpan={1} val={1500} />);
    expect(container.textContent).toBe('2 kHz');
  });

  it('should render correct frequency in MHz', () => {
    const { container } = render(<FrequencyCell rowSpan={1} val={1500000} />);
    expect(container.textContent).toBe('2 MHz');
  });
});

describe('PowerCell', () => {
  it('should render correct power value with 3 decimal places', () => {
    const { container } = render(<PowerCell rowSpan={1} val={3.456} />);
    expect(fixed).toHaveBeenCalledWith(3.456, 3);
    expect(container.textContent).toBe('3.456 W');
  });
});

describe('SelectionCell', () => {
  it('should render correct text from values', () => {
    const values = { 1: 'Option 1', 2: 'Option 2' };
    const { container } = render(<SelectionCell val={1} values={values} />);
    expect(GetText).toHaveBeenCalledWith(1, values);
    expect(container.textContent).toBe('Option 1');
  });

  it('should render "Unknown" when value is not found in values', () => {
    const values = { 1: 'Option 1', 2: 'Option 2' };
    const { container } = render(<SelectionCell val={3} values={values} />);
    expect(GetText).toHaveBeenCalledWith(3, values);
    expect(container.textContent).toBe('Unknown');
  });
});

describe('BandwidthCell', () => {
  it('should render correct bandwidth value in MB/s', () => {
    const { container } = render(<BandwidthCell val={100} />);
    expect(container.textContent).toBe('100 MB/s');
  });
});

describe('DisabledCell', () => {
  it('should render empty string when val is -1', () => {
    const { container } = render(<DisabledCell val={-1} />);
    expect(container.textContent).toBe('');
  });

  it('should render the value when val is not -1', () => {
    const { container } = render(<DisabledCell val={5} />);
    expect(container.textContent).toBe('5');
  });
});
