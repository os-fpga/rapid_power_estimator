import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { SocTotalPowerProvider, useSocTotalPower } from '../SOCTotalPowerProvider';
import '@testing-library/jest-dom';

jest.mock('../utils/serverAPI', () => ({
  GET: jest.fn((url, callback) => callback({
    total_power_temperature: [],
    processing_complex: {
      dynamic: {
        components: [],
        power: 150,
        percentage: 75,
      },
      static: { power: 50, percentage: 25 },
      total_power: 200,
      total_percentage: 100,
    },
    fpga_complex: {
      dynamic: {
        components: [],
        power: 100,
        percentage: 50,
      },
      static: { power: 50, percentage: 50 },
      total_power: 150,
      total_percentage: 100,
    },
  })),
  api: {
    consumption: jest.fn(() => '/mock/api/consumption'),
  },
}));

const TestComponent = () => {
  const { totalConsumption, updateTotalPower } = useSocTotalPower();

  return (
    <div>
      <div data-testid="dynamic-power">{totalConsumption.processing_complex.dynamic.power}</div>
      <div data-testid="static-power">{totalConsumption.processing_complex.static.power}</div>
      <div data-testid="total-percentage">{totalConsumption.processing_complex.total_percentage}</div>
      <button onClick={() => updateTotalPower('mockDevice')}>Update Power</button>
      <button onClick={() => updateTotalPower('')}>Reset Power</button>
    </div>
  );
};

describe('SocTotalPowerProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders provider and default context values', () => {
    render(
      <SocTotalPowerProvider>
        <TestComponent />
      </SocTotalPowerProvider>
    );

    expect(screen.getByTestId('dynamic-power')).toHaveTextContent('0');
  });

  test('updates total power when updateTotalPower is called', async () => {
    render(
      <SocTotalPowerProvider>
        <TestComponent />
      </SocTotalPowerProvider>
    );

    const updateButton = screen.getByRole('button', { name: /update power/i });

    await act(async () => {
      updateButton.click();
    });

    expect(screen.getByTestId('dynamic-power')).toHaveTextContent('150');
  });

  test('updates static power correctly when updateTotalPower is called', async () => {
    render(
      <SocTotalPowerProvider>
        <TestComponent />
      </SocTotalPowerProvider>
    );

    const updateButton = screen.getByRole('button', { name: /update power/i });

    await act(async () => {
      updateButton.click();
    });

    expect(screen.getByTestId('static-power')).toHaveTextContent('50');
  });

  test('updates total percentage correctly when updateTotalPower is called', async () => {
    render(
      <SocTotalPowerProvider>
        <TestComponent />
      </SocTotalPowerProvider>
    );

    const updateButton = screen.getByRole('button', { name: /update power/i });

    await act(async () => {
      updateButton.click();
    });

    expect(screen.getByTestId('total-percentage')).toHaveTextContent('100');
  });
});
