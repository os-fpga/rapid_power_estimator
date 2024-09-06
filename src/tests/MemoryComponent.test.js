import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemoryComponent from '../components/MemoryComponent';
import * as server from '../utils/serverAPI';
import { useSelection } from '../SelectionProvider';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { useGlobalState } from '../GlobalStateProvider';

// Mock utility functions and hooks
jest.mock('../utils/serverAPI');
jest.mock('../SelectionProvider', () => ({
  useSelection: jest.fn(),
}));
jest.mock('../SOCTotalPowerProvider', () => ({
  useSocTotalPower: jest.fn(),
}));
jest.mock('../GlobalStateProvider', () => ({
  useGlobalState: jest.fn(),
}));

describe('MemoryComponent', () => {
  const mockPeripherals = [
    { name: 'DDR', href: 'ddr-href' },
    { name: 'On Chip', href: 'ocm-href' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useSelection.mockReturnValue({
      selectedItem: 'Memory',
    });
    useSocTotalPower.mockReturnValue({
      totalConsumption: {
        processing_complex: {
          dynamic: {
            components: [
              { type: 'memory', power: 10, percentage: 20 },
            ],
          },
        },
      },
    });
    useGlobalState.mockReturnValue({
      socState: {
        memory: [],
      },
    });
  });

  test('renders the MemoryComponent with correct initial values', () => {
    render(<MemoryComponent device="test-device" peripherals={mockPeripherals} />);

    expect(screen.getByText('Memory')).toBeInTheDocument();
    
    // Function matcher to handle spaces and number formatting
    expect(screen.getByText((content) => content.includes('10.000') && content.includes('W'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('20') && content.includes('%'))).toBeInTheDocument();
  });

  test('renders peripheral data with default values', async () => {
    render(<MemoryComponent device="test-device" peripherals={mockPeripherals} />);

    // Check for default values for peripherals (0.00 W and 0 %)
    expect(screen.getByText('DDR')).toBeInTheDocument();
    expect(screen.getAllByText((content) => content.includes('0.000') && content.includes('W')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('0') && content.includes('%')).length).toBeGreaterThan(0);
  });

  test('renders default values when memory data is not available', () => {
    useSocTotalPower.mockReturnValue({
      totalConsumption: {
        processing_complex: {
          dynamic: {
            components: [],
          },
        },
      },
    });

    render(<MemoryComponent device="test-device" peripherals={mockPeripherals} />);

    expect(screen.getByText('Memory')).toBeInTheDocument();
    expect(screen.getAllByText((content) => content.includes('0.000') && content.includes('W')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('0') && content.includes('%')).length).toBeGreaterThan(0);
  });

  test('subscribes and unsubscribes to memoryChanged event', () => {
    const subscribeMock = jest.spyOn(require('../utils/events'), 'subscribe');
    const unsubscribeMock = jest.spyOn(require('../utils/events'), 'unsubscribe');

    const { unmount } = render(<MemoryComponent device="test-device" peripherals={mockPeripherals} />);

    expect(subscribeMock).toHaveBeenCalledWith('memoryChanged', expect.any(Function));

    // Unmount the component and check if unsubscribe is called
    unmount();
    expect(unsubscribeMock).toHaveBeenCalledWith('memoryChanged', expect.any(Function));
  });
});
