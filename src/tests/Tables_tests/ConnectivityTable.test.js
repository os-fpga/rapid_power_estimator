import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConnectivityTable from '../../components/Tables/ConnectivityTable';
import * as server from '../../utils/serverAPI';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';
import { useClockSelection } from '../../ClockSelectionProvider';
import { useGlobalState } from '../../GlobalStateProvider';

jest.mock('../../utils/serverAPI');
jest.mock('../../SOCTotalPowerProvider', () => ({
  useSocTotalPower: jest.fn(),
}));
jest.mock('../../ClockSelectionProvider', () => ({
  useClockSelection: jest.fn(),
}));
jest.mock('../../GlobalStateProvider', () => ({
  useGlobalState: jest.fn(),
}));

describe('ConnectivityTable Component', () => {
  const device = 'test-device';
  const peripherals = [{ href: 'test-link', name: 'fpga_complex' }];
  const mockUpdateTotalPower = jest.fn();
  const mockUpdateGlobalState = jest.fn();
  const mockNotify = jest.fn();

  beforeEach(() => {
    useSocTotalPower.mockReturnValue({
      updateTotalPower: mockUpdateTotalPower,
    });
    useClockSelection.mockReturnValue({
      defaultClock: jest.fn(() => '100 MHz'),
    });
    useGlobalState.mockReturnValue({
      GetOptions: jest.fn(() => ['Idle', 'Active']),
      updateGlobalState: mockUpdateGlobalState,
      connectivityNames: [{ text: 'Endpoint1' }, { text: 'Endpoint2' }],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the ConnectivityTable component', () => {
    render(
      <ConnectivityTable
        device={device}
        peripherals={peripherals}
        update={false}
        notify={mockNotify}
      />
    );
    expect(screen.getByText('Connectivity')).toBeInTheDocument();
    expect(screen.getByText('Connectivity power')).toBeInTheDocument();
  });

  test('displays rows when endpoints are available', async () => {
    server.GET.mockImplementation((url, callback) => {
      callback({
        ports: [{ href: '/port/1', consumption: { noc_power: 10 }, name: 'port1' }],
      });
    });

    render(
      <ConnectivityTable
        device={device}
        peripherals={peripherals}
        update={false}
        notify={mockNotify}
      />
    );

    await waitFor(() => expect(screen.getByText('NOC Interconnect')).toBeInTheDocument());
  });

  test('checks if the Add button is initially disabled', () => {
    render(
      <ConnectivityTable
        device={device}
        peripherals={peripherals}
        update={false}
        notify={mockNotify}
      />
    );
  
    const addButton = screen.getByRole('button', { name: /add/i });
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeDisabled();
  }); 
});
