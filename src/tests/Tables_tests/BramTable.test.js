import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BramTable from '../../components/Tables/BramTable';
import * as server from '../../utils/serverAPI';
import * as common from '../../utils/common';

jest.mock('../../components/ModalWindows/BramModal', () => ({
  __esModule: true,
  default: ({ onSubmit, closeModal }) => (
    <div data-testid="bram-modal">
      <button data-testid="submit" onClick={() => onSubmit({ name: 'BRAM Test' })}>Submit</button>
      <button data-testid="close-modal" onClick={closeModal}>Close</button>
    </div>
  ),
}));

jest.mock('../../utils/serverAPI');
jest.mock('../../ClockSelectionProvider', () => ({
  useClockSelection: () => ({ defaultClock: jest.fn().mockReturnValue('100 MHz') })
}));
jest.mock('../../GlobalStateProvider', () => ({
  useGlobalState: () => ({
    updateGlobalState: jest.fn(),
    GetOptions: jest.fn().mockReturnValue([{ id: 1, name: 'BRAM_Type' }]),
  })
}));
jest.mock('../../SOCTotalPowerProvider', () => ({
  useSocTotalPower: () => ({ updateTotalPower: jest.fn() })
}));

jest.spyOn(common, 'fixed').mockImplementation((number, precision = 3) => {
  if (isNaN(number)) {
    return '0'; // default value for invalid numbers
  }
  return Number(number).toFixed(precision);
});

describe('BramTable Component', () => {
  beforeEach(() => {
    server.GET.mockImplementation((url, callback) => {
      const mockBramData = [
        {
          name: 'BRAM Block 1',
          enable: true,
          type: 0,
          bram_used: 10,
          port_a: {
            clock: '200 MHz',
            width: 18,
            write_enable_rate: 50,
            read_enable_rate: 50,
            toggle_rate: 20
          },
          port_b: {
            clock: '200 MHz',
            width: 18,
            write_enable_rate: 50,
            read_enable_rate: 50,
            toggle_rate: 20
          },
          consumption: {
            port_a: { clock_frequency: '200 MHz', output_signal_rate: 10, ram_depth: 1024 },
            port_b: { clock_frequency: '200 MHz', output_signal_rate: 10, ram_depth: 1024 },
            block_power: 5,
            interconnect_power: 2,
            percentage: 50,
            messages: []
          }
        }
      ];
      callback(mockBramData);
    });

    server.PATCH.mockImplementation((url, data, callback) => {
      callback();
    });

    server.DELETE.mockImplementation((url, callback) => {
      callback();
    });
  });

  test('renders table headers and power table', () => {
    render(<BramTable device="device1" update={true} notify={jest.fn()} />);

    expect(screen.getByText('BRAM power')).toBeInTheDocument();
        const usedHeaders = screen.getAllByText('Used');
    expect(usedHeaders.length).toBeGreaterThan(0);

    const totalHeaders = screen.getAllByText('Total');
    expect(totalHeaders.length).toBeGreaterThan(0);
    expect(screen.getByText(/BRAM Type/i)).toBeInTheDocument();
    expect(screen.getByText(/Action/i)).toBeInTheDocument();
    expect(screen.getByText(/Name\/Hierarchy/i)).toBeInTheDocument();
  });

  test('handles enabling/disabling BRAM rows', async () => {
    render(<BramTable device="device1" update={true} notify={jest.fn()} />);

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(server.PATCH).toHaveBeenCalledTimes(1);
    });
  });

  test('handles add/edit BRAM row via modal', async () => {
    render(<BramTable device="device1" update={true} notify={jest.fn()} />);

    fireEvent.click(screen.getByText(/Add/i));

    await waitFor(() => {
      expect(screen.getByTestId('bram-modal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('submit'));

    await waitFor(() => {
      expect(server.POST).toHaveBeenCalledTimes(1);
    });

    // closing the modal
    fireEvent.click(screen.getByTestId('close-modal'));

    expect(screen.queryByTestId('bram-modal')).not.toBeInTheDocument();
  });
});
