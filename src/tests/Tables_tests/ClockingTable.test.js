import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClockingTable from '../../components/Tables/ClockingTable';
import * as server from '../../utils/serverAPI';

jest.mock('../../utils/serverAPI', () => ({
  GET: jest.fn(),
  PATCH: jest.fn(),
  DELETE: jest.fn(),
  POST: jest.fn(),
  api: {
    fetch: jest.fn((elem, device) => `/api/${elem}/${device}`),
    index: jest.fn((elem, device, index) => `/api/${elem}/${device}/${index}`),
    consumption: jest.fn((elem, device) => `/api/${elem}/${device}/consumption`),
  },
  Elem: {
    clocking: 'clocking',
  },
}));

jest.mock('../../utils/common', () => ({
  fixed: jest.fn((number, precision = 2) => number.toFixed(precision)),
  GetText: jest.fn((id, options) => options.find((option) => option.id === id)?.name || ''),
  color: jest.fn((isError, isWarning, isInfo) => (isError ? 'red' : isWarning ? 'yellow' : 'green')), // Mock the color function
}));

jest.mock('../../ClockSelectionProvider', () => ({
  useClockSelection: jest.fn(() => ({
    setClocks: jest.fn(),
  })),
}));

jest.mock('../../GlobalStateProvider', () => ({
  useGlobalState: jest.fn(() => ({
    GetOptions: jest.fn((key) => {
      if (key === 'Clock_State') return [{ id: 1, name: 'Enabled' }, { id: 0, name: 'Disabled' }];
      if (key === 'Source') return [{ id: 0, name: 'External' }, { id: 1, name: 'Internal' }];
      return [];
    }),
    updateGlobalState: jest.fn(),
  })),
}));

jest.mock('../../SOCTotalPowerProvider', () => ({
  useSocTotalPower: jest.fn(() => ({
    updateTotalPower: jest.fn(),
  })),
}));

describe('ClockingTable Component', () => {
  const mockDevice = 'device1';
  const mockClockingData = [
    {
      description: 'Clock 1',
      source: 0,
      port: 'CLK0',
      frequency: 1000000,
      enable: true,
      state: 1,
      consumption: {
        fan_out: 5,
        block_power: 10,
        interconnect_power: 3,
        percentage: 50,
        messages: [],
      },
    },
  ];

  beforeEach(() => {
    server.GET.mockImplementation((url, callback) => {
      if (url.includes('consumption')) {
        callback({
          total_clock_block_power: 10,
          total_clock_interconnect_power: 3,
          total_pll_power: 5,
          total_clocks_used: 2,
          total_clocks_available: 5,
          total_plls_used: 1,
          total_plls_available: 2,
        });
      } else {
        callback(mockClockingData);
      }
    });
  });

  test('renders the component and the power table', async () => {
    render(<ClockingTable device={mockDevice} update={false} notify={jest.fn()} />);

    expect(screen.getByText('Clocking')).toBeInTheDocument();
    expect(screen.getByText('Clock power')).toBeInTheDocument();
    expect(screen.getByText('Clocks')).toBeInTheDocument();
    expect(screen.getByText('PLLs')).toBeInTheDocument();
  });
});
