import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FPGASummaryComponent from '../components/FPGASummaryComponent';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { useGlobalState } from '../GlobalStateProvider';
import PowerSummaryTable from '../components/Tables/PowerSummaryTable';

// Mocking utility functions and components
jest.mock('../SOCTotalPowerProvider', () => ({
  useSocTotalPower: jest.fn(),
}));
jest.mock('../GlobalStateProvider', () => ({
  useGlobalState: jest.fn(),
}));
jest.mock('../components/Tables/PowerSummaryTable', () => jest.fn(() => <div>Mocked PowerSummaryTable</div>));

describe('FPGASummaryComponent', () => {
  const mockTotalConsumption = {
    fpga_complex: {
      dynamic: {
        components: [
          { type: 'clocking', power: 10, percentage: 15 },
          { type: 'fabric_le', power: 20, percentage: 25 },
          { type: 'bram', power: 30, percentage: 35 },
          { type: 'dsp', power: 40, percentage: 45 },
          { type: 'io', power: 50, percentage: 55 },
        ],
        power: 100,
        percentage: 60,
      },
      static: {
        power: 200,
        percentage: 70,
      },
      total_power: 300,
      total_percentage: 80,
    },
  };

  const mockGlobalState = {
    clockingState: ['Clocking Message'],
    fleState: ['FLE Message'],
    bramState: ['BRAM Message'],
    dspState: ['DSP Message'],
    ioState: ['IO Message'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useSocTotalPower.mockReturnValue({ totalConsumption: mockTotalConsumption });
    useGlobalState.mockReturnValue(mockGlobalState);
  });

  test('renders the FPGASummaryComponent with default values', () => {
    render(<FPGASummaryComponent device="test-device" />);

    // Checking that PowerSummaryTable is rendered
    expect(screen.getByText('Mocked PowerSummaryTable')).toBeInTheDocument();

    // Checking if PowerSummaryTable is called with the correct props
    expect(PowerSummaryTable).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'FPGA Complex and Core Power',
        data: expect.any(Array),
        total: 300,
        percent: 80,
      }),
      expect.anything()
    );
  });

  test('updates power data based on totalConsumption and global state', () => {
    render(<FPGASummaryComponent device="test-device" />);

    // Checking that PowerSummaryTable data is updated correctly
    const expectedData = [
      { text: 'Clocking', power: 10, percent: 15, messages: ['Clocking Message'] },
      { text: 'FLE', power: 20, percent: 25, messages: ['FLE Message'] },
      { text: 'BRAM', power: 30, percent: 35, messages: ['BRAM Message'] },
      { text: 'DSP', power: 40, percent: 45, messages: ['DSP Message'] },
      { text: 'I/O', power: 50, percent: 55, messages: ['IO Message'] },
      { text: 'FPGA Dynamic', power: 100, percent: 60, messages: [] },
      { text: 'FPGA/Core Static', power: 200, percent: 70, messages: [] },
    ];

    expect(PowerSummaryTable).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expectedData,
        total: 300,
        percent: 80,
      }),
      expect.anything()
    );
  });

  test('renders default values when totalConsumption data is not available', () => {
    useSocTotalPower.mockReturnValue({
      totalConsumption: {
        fpga_complex: {
          dynamic: { components: [], power: 0, percentage: 0 },
          static: { power: 0, percentage: 0 },
          total_power: 0,
          total_percentage: 0,
        },
      },
    });

    // Make sure the global state mock returns empty arrays for the messages
    useGlobalState.mockReturnValue({
      clockingState: [],
      fleState: [],
      bramState: [],
      dspState: [],
      ioState: [],
    });

    render(<FPGASummaryComponent device="test-device" />);

    const expectedData = [
      { text: 'Clocking', power: 0, percent: 0, messages: [] },
      { text: 'FLE', power: 0, percent: 0, messages: [] },
      { text: 'BRAM', power: 0, percent: 0, messages: [] },
      { text: 'DSP', power: 0, percent: 0, messages: [] },
      { text: 'I/O', power: 0, percent: 0, messages: [] },
      { text: 'FPGA Dynamic', power: 0, percent: 0, messages: [] },
      { text: 'FPGA/Core Static', power: 0, percent: 0, messages: [] },
    ];

    expect(PowerSummaryTable).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expectedData,
        total: 0,
        percent: 0,
      }),
      expect.anything()
    );
  });
});
