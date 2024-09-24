import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ABCPUComponent from '../components/ABCPUComponent';

jest.mock('../utils/serverAPI', () => ({
  GET: jest.fn(),
  peripheralPath: jest.fn((device, href) => `/api/${device}/${href}`),
}));

jest.mock('../utils/events', () => ({
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
}));

jest.mock('../SelectionProvider', () => ({
  useSelection: () => ({ selectedItem: 'testItem' }),
}));

jest.mock('../utils/common', () => ({
  getPeripherals: jest.fn(() => [{ href: '/cpu1' }]),
  fixed: jest.fn((value, decimals) => `${value.toFixed(decimals)}`),
}));

describe('ABCPUComponent', () => {
  const defaultProps = {
    device: 'device1',
    title: 'Test CPU',
    index: 0,
    power: 100,
    percent: 50,
    peripherals: [{ href: '/cpu1' }],
    messages: [],
  };

  it('renders CPUComponent when enabled', () => {
    render(<ABCPUComponent {...defaultProps} />);
    expect(screen.getByText('Test CPU')).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });
});
