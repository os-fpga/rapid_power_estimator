import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TypicalWorstComponent from '../components/TypicalWorstComponent';
import { useSocTotalPower } from '../SOCTotalPowerProvider';

// Mocks useSocTotalPower
jest.mock('../SOCTotalPowerProvider', () => ({
  useSocTotalPower: jest.fn(),
}));

// Implements the fixed function
const fixed = (value, precision) => {
  if (isNaN(value)) {
    return '0.00';
  }
  return Number(value).toFixed(precision);
};

describe('TypicalWorstComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders typical and worst case columns with correct values', () => {
    // Mocks total power consumption
    useSocTotalPower.mockReturnValue({
      totalConsumption: {
        total_power_temperature: [
          { type: 'typical', power: 10.123, temperature: 45 },
          { type: 'worsecase', power: 20.456, temperature: 65 },
        ],
      },
    });

    // Renders the component
    render(<TypicalWorstComponent />);

    // Checks that the typical column renders correctly
    expect(screen.getByText('Typical')).toBeInTheDocument();
    expect(screen.getByText(`${fixed(10.123, 2)} W`)).toBeInTheDocument();
    expect(screen.getByText(`${fixed(45, 0)} °C`)).toBeInTheDocument();

    // Checks that the worst-case column renders correctly
    expect(screen.getByText('Worst case')).toBeInTheDocument();
    expect(screen.getByText(`${fixed(20.456, 2)} W`)).toBeInTheDocument();
    expect(screen.getByText(`${fixed(65, 0)} °C`)).toBeInTheDocument();
  });

  test('renders default values when typical and worst case are not available', () => {
    // Mocks total power consumption with an empty array
    useSocTotalPower.mockReturnValue({
      totalConsumption: {
        total_power_temperature: [],
      },
    });

    // Renders the component
    render(<TypicalWorstComponent />);

    // Checks that the typical and worst-case columns render default values
    expect(screen.getByText('Typical')).toBeInTheDocument();
    expect(screen.getAllByText(`${fixed(0, 2)} W`).length).toBe(2);
    expect(screen.getAllByText(`${fixed(0, 0)} °C`).length).toBe(2);

    expect(screen.getByText('Worst case')).toBeInTheDocument();
  });

  test('renders the thunderbolt icon in both columns', () => {
    // Mocks total power consumption
    useSocTotalPower.mockReturnValue({
      totalConsumption: {
        total_power_temperature: [
          { type: 'typical', power: 10.123, temperature: 45 },
          { type: 'worsecase', power: 20.456, temperature: 65 },
        ],
      },
    });

    // Renders the component
    render(<TypicalWorstComponent />);

    // Checks for the thunderbolt icon in both columns
    const thunderboltIcons = document.querySelectorAll('.thunder');
    expect(thunderboltIcons.length).toBe(2);
  });
});
