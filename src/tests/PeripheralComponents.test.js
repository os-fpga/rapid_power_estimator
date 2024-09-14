import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PeripheralsComponent from '../components/PeripheralsComponent';
import * as server from '../utils/serverAPI';
import { useSelection } from '../SelectionProvider';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { useGlobalState } from '../GlobalStateProvider';

// Mocking external dependencies
jest.mock('../utils/serverAPI');
jest.mock('../SelectionProvider');
jest.mock('../SOCTotalPowerProvider');
jest.mock('../GlobalStateProvider');

describe('PeripheralsComponent', () => {
  beforeEach(() => {
    useSelection.mockReturnValue({ selectedItem: 'Peripherals' });
    useSocTotalPower.mockReturnValue({
      totalConsumption: {
        processing_complex: {
          dynamic: {
            components: [{ type: 'peripherals', power: 10, percentage: 5 }],
          },
        },
      },
    });
    useGlobalState.mockReturnValue({
      socState: {
        i2c: [],
        spi: [],
        pwm: [],
        usb2: [],
        uart0: [],
        uart1: [],
        gpio: [],
        jtag: [],
        gige: [],
      },
    });
  });

  it('renders PeripheralsComponent with initial data', () => {
    render(<PeripheralsComponent device="device1" />);

    expect(screen.getByText('Peripherals')).toBeInTheDocument();

    expect(screen.getByText((content, element) => content.startsWith('10') && content.endsWith('W'))).toBeInTheDocument();

    expect(screen.getByText((content, element) => content.startsWith('5') && content.endsWith('%'))).toBeInTheDocument();
  });

  it('fetches peripherals data from the server and updates table', async () => {
    // Mocking the server API to return test data for peripherals
    server.GET.mockImplementationOnce((url, callback) => {
      const testData = [
        { type: 'i2c', href: 'test-href', name: 'I2C' },
        { type: 'spi', href: 'test-href', name: 'SPI' },
      ];
      callback(testData);
    });

    server.peripheralPath.mockReturnValue('test-url');

    server.GET.mockImplementationOnce((url, callback) => {
      callback({
        consumption: {
          block_power: 5,
        },
      });
    });

    const { container } = render(<PeripheralsComponent device="device1" />);

    await waitFor(() => {
      expect(container.querySelector('.periph-internal-font-header')).toHaveTextContent('I2C');
      expect(container.querySelector('.periph-internal-font')).toHaveTextContent(/5(\.\d{3})? W/);
    });
  });

  it('renders PeripheralRow with empty blocks when data is missing', () => {
    const { container } = render(<PeripheralsComponent device="device1" />);

    const emptyBlocks = container.querySelectorAll('.periph-rowx-empty');
    expect(emptyBlocks.length).toBe(9); 
  });

  it('updates state when new device is passed', () => {
    const { rerender } = render(<PeripheralsComponent device="device1" />);
    expect(screen.getByText('Peripherals')).toBeInTheDocument();

    rerender(<PeripheralsComponent device="device2" />);
    expect(screen.getByText('Peripherals')).toBeInTheDocument();
  });
});
