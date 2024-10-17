import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DspTable from '../../components/Tables/DspTable';
import * as server from '../../utils/serverAPI';
import * as common from '../../utils/common';

jest.mock('../../utils/serverAPI', () => ({
  GET: jest.fn(),
  PATCH: jest.fn(),
  DELETE: jest.fn(),
  POST: jest.fn(),
  api: {
    fetch: jest.fn((elem, deviceId) => `/api/${elem}/${deviceId}`),
    consumption: jest.fn((elem, deviceId) => `/api/consumption/${elem}/${deviceId}`),
    index: jest.fn((elem, deviceId, index) => `/api/${elem}/${deviceId}/${index}`),
  },
  Elem: {
    dsp: 'dsp',
  },
}));

jest.mock('../../utils/common', () => ({
  fixed: jest.fn((number) => number.toFixed(2)),
  GetText: jest.fn((key, options) => options.find((option) => option.id === key)?.text || ''),
  color: jest.fn(() => 'green'),
}));

jest.mock('../../ClockSelectionProvider', () => ({
  useClockSelection: jest.fn(() => ({ defaultClock: jest.fn(() => '100 MHz') })),
}));

jest.mock('../../GlobalStateProvider', () => ({
  useGlobalState: jest.fn(() => ({
    GetOptions: jest.fn(() => [{ id: 1, text: 'Mode1' }, { id: 2, text: 'Pipeline1' }]),
    updateGlobalState: jest.fn(),
  })),
}));

jest.mock('../../SOCTotalPowerProvider', () => ({
  useSocTotalPower: jest.fn(() => ({ updateTotalPower: jest.fn() })),
}));

describe('DspTable Component', () => {
  const mockDspData = [
    {
      name: 'DSP Block 1',
      enable: true,
      number_of_multipliers: 10,
      dsp_mode: 1,
      a_input_width: 16,
      b_input_width: 16,
      clock: '100 MHz',
      pipelining: 2,
      toggle_rate: 0.8,
      consumption: {
        dsp_blocks_used: 5,
        clock_frequency: 1000000,
        output_signal_rate: 3.2,
        block_power: 15,
        interconnect_power: 5,
        percentage: 50,
        messages: [],
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component and the power table', async () => {
    server.GET.mockImplementation((url, callback) => {
      if (url.includes('/api/dsp/')) {
        callback(mockDspData);
      } else if (url.includes('/api/consumption/dsp/')) {
        callback({
          total_dsp_block_power: 15,
          total_dsp_interconnect_power: 5,
          total_dsp_blocks_used: 5,
          total_dsp_blocks_available: 10,
        });
      }
    });

    render(<DspTable device="device1" update={false} notify={jest.fn()} />);

    expect(screen.getByText('DSP')).toBeInTheDocument();
    expect(screen.getByText('DSP power')).toBeInTheDocument();
    expect(screen.getByText('Name/Hierarchy')).toBeInTheDocument();
    expect(screen.getByText('Block Power')).toBeInTheDocument();
  });

  test('renders DSP data in the table', async () => {
    server.GET.mockImplementation((url, callback) => {
      if (url.includes('/api/dsp/')) {
        callback(mockDspData);
      } else if (url.includes('/api/consumption/dsp/')) {
        callback({
          total_dsp_block_power: 15,
          total_dsp_interconnect_power: 5,
          total_dsp_blocks_used: 5,
          total_dsp_blocks_available: 10,
        });
      }
    });

    render(<DspTable device="device1" update={false} notify={jest.fn()} />);

    expect(screen.getByText('DSP Block 1')).toBeInTheDocument();
    expect(screen.getByText('Mode1')).toBeInTheDocument();
    expect(screen.getAllByText('16')[0]).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('100 MHz')).toBeInTheDocument();
    expect(screen.getByText('15.00 W')).toBeInTheDocument();
  });
});
