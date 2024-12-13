import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GlobalStateProvider, useGlobalState } from '../GlobalStateProvider';
import * as server from '../utils/serverAPI';

jest.mock('../utils/serverAPI', () => ({
  GET: jest.fn(),
  api: {
    fetch: jest.fn((elem, device) => `/mock-api/${elem}/${device}`),
  },
  Elem: {
    clocking: 'clocking',
    fle: 'fle',
    bram: 'bram',
    dsp: 'dsp',
    io: 'io',
    peripherals: 'peripherals',
  },
  peripheralPath: jest.fn((device, path) => `/mock-api/peripheral/${device}/${path}`),
  attributes: jest.fn(() => '/mock-api/attributes'),
}));

const TestComponent = () => {
  const { updateGlobalState, clockingState, peripherals, acpuNames, fetchAttributes, GetOptions } = useGlobalState();
  const options = GetOptions('mock-attribute');

  return (
    <div>
      <div data-testid="clocking-state">{clockingState.join(', ')}</div>
      <div data-testid="peripherals-count">{peripherals.length}</div>
      <div data-testid="acpu-names">{acpuNames.map(acpu => acpu.text).join(', ')}</div>
      <button onClick={() => updateGlobalState('mock-device')}>Update Global State</button>
      <button onClick={fetchAttributes}>Fetch Attributes</button>
      <div data-testid="options">{options.join(', ')}</div>
    </div>
  );
};

describe('GlobalStateProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders GlobalStateProvider and provides default context values', () => {
    render(
      <GlobalStateProvider fetch={server.GET}>
        <TestComponent />
      </GlobalStateProvider>
    );

    expect(screen.getByTestId('clocking-state')).toHaveTextContent('');
    expect(screen.getByTestId('peripherals-count')).toHaveTextContent('0');
    expect(screen.getByTestId('acpu-names')).toHaveTextContent('');
  });

  test('updatePeripherals fetches and updates the peripheral data correctly', async () => {
    server.GET.mockImplementation((url, callback) => {
      if (url.includes('peripherals')) {
        callback([{ href: '/mock-peripheral', type: 'DMA' }]);
      } else if (url.includes('mock-peripheral')) {
        callback({ consumption: { messages: 'DMA Message' }, targets: 8 });
      }
    });

    render(
      <GlobalStateProvider fetch={server.GET}>
        <TestComponent />
      </GlobalStateProvider>
    );

    const updateButton = screen.getByText('Update Global State');

    await act(async () => {
      updateButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('peripherals-count')).toHaveTextContent('1');
    });
  });
});
