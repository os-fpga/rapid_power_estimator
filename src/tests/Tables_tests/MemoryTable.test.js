import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemoryTable from '../../components/Tables/MemoryTable';
import { GlobalStateProvider } from '../../GlobalStateProvider';
import { SocTotalPowerProvider } from '../../SOCTotalPowerProvider';
import * as server from '../../utils/serverAPI';  

jest.mock('../../utils/serverAPI', () => ({
  GET: jest.fn(),
  PATCH: jest.fn(),
  peripheralPath: jest.fn(),
  Elem: {
    memory: 'memory',
  },
}));

jest.mock('../../utils/events', () => ({
  publish: jest.fn(),
}));

describe('MemoryTable Component', () => {
  const mockPeripherals = [
    { href: 'mock-memory-href1', id: 'ddr' },
    { href: 'mock-memory-href2', id: 'ocm' },
  ];

  const mockMemoryData = {
    name: 'DDR Memory',
    enable: true,
    usage: 0,
    memory_type: 1,
    data_rate: 800,
    width: 32,
    consumption: {
      block_power: 0.5,
      percentage: 40,
      messages: [{ text: 'Test message' }],
      write_bandwidth: 10,
      read_bandwidth: 15,
    },
  };

  beforeEach(() => {
    server.GET.mockImplementation((url, callback) => {
      if (url.includes('mock-memory-href')) {
        callback(mockMemoryData);
      }
    });
  });

  test('renders MemoryTable header correctly', () => {
    render(
      <GlobalStateProvider>
        <SocTotalPowerProvider>
          <MemoryTable device="mock-device" peripherals={mockPeripherals} update={false} notify={jest.fn()} />
        </SocTotalPowerProvider>
      </GlobalStateProvider>
    );

    const memoryHeaders = screen.getAllByText('Memory');
    expect(memoryHeaders[0]).toBeInTheDocument(); 
  });

  test('renders the correct power total in the MemoryTable', async () => {
    render(
      <GlobalStateProvider>
        <SocTotalPowerProvider>
          <MemoryTable device="mock-device" peripherals={mockPeripherals} update={false} notify={jest.fn()} />
        </SocTotalPowerProvider>
      </GlobalStateProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Memory power')).toBeInTheDocument(); 
      expect(screen.getByText('0.00')).toBeInTheDocument(); 
    });
  });
});
