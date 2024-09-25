import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FpgaComponent from '../components/FpgaComponent';
import { SelectionProvider } from '../SelectionProvider';
import '@testing-library/jest-dom';

jest.mock('../SOCTotalPowerProvider', () => ({
  useSocTotalPower: () => ({
    totalConsumption: {
      fpga_complex: {
        dynamic: {
          components: [
            { type: 'clocking', power: 100 },
            { type: 'fabric_le', power: 200 },
            { type: 'bram', power: 300 },
            { type: 'dsp', power: 400 },
            { type: 'io', power: 500 },
          ],
          power: 1500,
          percentage: 75,
        },
        static: {
          power: 500,
          percentage: 25,
        },
        total_power: 2000,
        total_percentage: 100,
      },
    },
  }),
}));

jest.mock('../GlobalStateProvider', () => ({
  useGlobalState: () => ({
    clockingState: [],
    fleState: [],
    bramState: [],
    dspState: [],
    ioState: [],
  }),
}));

test('renders FPGA title without crashing', () => {
  render(
    <SelectionProvider>
      <FpgaComponent tableOpen={jest.fn()} />
    </SelectionProvider>
  );

  expect(screen.getByText('FPGA')).toBeInTheDocument();
});

test('displays the correct total power for FPGA component', () => {
  render(
    <SelectionProvider>
      <FpgaComponent tableOpen={jest.fn()} />
    </SelectionProvider>
  );

  expect(screen.getByText(/2000/i)).toBeInTheDocument();
});
