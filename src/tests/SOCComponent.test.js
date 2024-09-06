import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SOCComponent from '../components/SOCComponent';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { useGlobalState } from '../GlobalStateProvider';
import { Table } from '../utils/common';

jest.mock('../SOCTotalPowerProvider', () => ({
  useSocTotalPower: jest.fn(),
}));

jest.mock('../GlobalStateProvider', () => ({
  useGlobalState: jest.fn(),
}));

jest.mock('../components/ABCPUComponent', () => () => <div>Mocked ABCPUComponent</div>);
jest.mock('../components/DMAComponent', () => () => <div>Mocked DMAComponent</div>);
jest.mock('../components/ConnectivityComponent', () => () => <div>Mocked ConnectivityComponent</div>);
jest.mock('../components/PeripheralsComponent', () => () => <div>Mocked PeripheralsComponent</div>);
jest.mock('../components/TitleComponent', () => () => <div>Mocked TitleComponent</div>);

describe('SOCComponent', () => {
  const mockSetOpenedTable = jest.fn();
  const mockPeripherals = [];

  beforeEach(() => {
    useSocTotalPower.mockReturnValue({
      totalConsumption: {
        processing_complex: {
          dynamic: {
            power: 100,
            percentage: 50,
            components: [
              { type: 'acpu', power: 50, percentage: 25 },
              { type: 'bcpu', power: 40, percentage: 20 },
            ],
          },
          static: {
            power: 30,
            percentage: 10,
          },
          total_power: 130,
          total_percentage: 60,
        },
      },
    });

    useGlobalState.mockReturnValue({
      socState: {
        acpu: ['ACPU Message'],
        bcpu: ['BCPU Message'],
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders SOCComponent with correct child components', () => {
    render(<SOCComponent device="test-device" setOpenedTable={mockSetOpenedTable} peripherals={mockPeripherals} />);

    // Use getAllByText since there are two ABCPUComponents (ACPU and BCPU)
    const acpuComponents = screen.getAllByText('Mocked ABCPUComponent');
    expect(acpuComponents.length).toBe(2);

    expect(screen.getByText('Mocked TitleComponent')).toBeInTheDocument();
    expect(screen.getByText('Mocked DMAComponent')).toBeInTheDocument();
    expect(screen.getByText('Mocked ConnectivityComponent')).toBeInTheDocument();
    expect(screen.getByText('Mocked PeripheralsComponent')).toBeInTheDocument();
  });

  test('clicks on ACPU and opens ACPU table', () => {
    render(<SOCComponent device="test-device" setOpenedTable={mockSetOpenedTable} peripherals={mockPeripherals} />);

    const acpuElement = screen.getAllByText('Mocked ABCPUComponent')[0];
    fireEvent.click(acpuElement);

    expect(mockSetOpenedTable).toHaveBeenCalledWith(Table.ACPU);
  });

  test('clicks on BCPU and opens BCPU table', () => {
    render(<SOCComponent device="test-device" setOpenedTable={mockSetOpenedTable} peripherals={mockPeripherals} />);

    const bcpuElement = screen.getAllByText('Mocked ABCPUComponent')[1];
    fireEvent.click(bcpuElement);

    expect(mockSetOpenedTable).toHaveBeenCalledWith(Table.BCPU);
  });

  test('clicks on DMA and opens DMA table', () => {
    render(<SOCComponent device="test-device" setOpenedTable={mockSetOpenedTable} peripherals={mockPeripherals} />);

    const dmaElement = screen.getByText('Mocked DMAComponent');
    fireEvent.click(dmaElement);

    expect(mockSetOpenedTable).toHaveBeenCalledWith(Table.DMA);
  });

  test('clicks on Connectivity and opens Connectivity table', () => {
    render(<SOCComponent device="test-device" setOpenedTable={mockSetOpenedTable} peripherals={mockPeripherals} />);

    const connectivityElement = screen.getByText('Mocked ConnectivityComponent');
    fireEvent.click(connectivityElement);

    expect(mockSetOpenedTable).toHaveBeenCalledWith(Table.Connectivity);
  });

  test('clicks on Peripherals and opens Peripherals table', () => {
    render(<SOCComponent device="test-device" setOpenedTable={mockSetOpenedTable} peripherals={mockPeripherals} />);

    const peripheralsElement = screen.getByText('Mocked PeripheralsComponent');
    fireEvent.click(peripheralsElement);

    expect(mockSetOpenedTable).toHaveBeenCalledWith(Table.Peripherals);
  });
});
