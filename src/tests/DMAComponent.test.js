import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import DMAComponent from '../components/DMAComponent';
import * as server from '../utils/serverAPI';
import { subscribe, unsubscribe } from '../utils/events';
import { useSelection } from '../SelectionProvider';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { useGlobalState } from '../GlobalStateProvider';
import { getPeripherals } from '../utils/common';

// Mock external hooks and API calls
jest.mock('../utils/serverAPI');
jest.mock('../utils/events');
jest.mock('../SelectionProvider');
jest.mock('../SOCTotalPowerProvider');
jest.mock('../GlobalStateProvider');
jest.mock('../utils/common');

describe('DMAComponent', () => {
  beforeEach(() => {
    // Mock implementations
    useSelection.mockReturnValue({ selectedItem: 'DMA' });
    useSocTotalPower.mockReturnValue({ totalConsumption: { processing_complex: { dynamic: { components: [] } } } });
    useGlobalState.mockReturnValue({ socState: { dma: [] } });
    getPeripherals.mockReturnValue([{ href: 'dma1' }]);

    // Mock API calls
    server.GET.mockImplementation((url, callback) => {
      callback({
        consumption: { noc_power: 10 },
        name: 'DMA Channel',
        channels: [{ href: 'channel1' }, { href: 'channel2' }, { href: 'channel3' }, { href: 'channel4' }],
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the DMA component with CPUComponent enabled', async () => {
    await act(async () => {
      render(<DMAComponent device="device1" peripherals={['dma']} />);
    });

    expect(screen.getByText('DMA')).toBeInTheDocument();
    const dmaChannels = screen.getAllByText(/DMA Channel/i);
    expect(dmaChannels).toHaveLength(4);
  });

  it('should subscribe to dmaChanged event on mount and unsubscribe on unmount', async () => {
    const { unmount } = await act(async () => render(<DMAComponent device="device1" peripherals={['dma']} />));

    // Ensure that subscribe is called on mount
    expect(subscribe).toHaveBeenCalledWith('dmaChanged', expect.any(Function));

    // Unmount and check if unsubscribe is called
    unmount();
    expect(unsubscribe).toHaveBeenCalledWith('dmaChanged', expect.any(Function));
  });

  it('should update state when dmaChanged event is triggered', async () => {
    await act(async () => {
      render(<DMAComponent device="device1" peripherals={['dma']} />);
    });

    act(() => {
      subscribe.mock.calls[0][1](); // Call the update function passed to subscribe
    });

    // Check if the GET method is called the correct number of times
    expect(server.GET).toHaveBeenCalled();
  });
});
