import React from 'react';
import { render, screen, waitF } from '@testing-library/react';
import '@testing-library/jest-dom';
import PeripheralsTable from '../../components/Tables/PeripheralsTable';
import { GlobalStateProvider } from '../../GlobalStateProvider';
import { SocTotalPowerProvider } from '../../SOCTotalPowerProvider';
import * as server from '../../utils/serverAPI'; 

jest.mock('../../utils/serverAPI', () => ({
  GET: jest.fn(),
  PATCH: jest.fn(),
  peripheralPath: jest.fn(),
}));

describe('PeripheralsTable Component', () => {
  const mockPeripheralsUrl = [
    { href: 'mock-peripheral-href1', type: 'spi' },
    { href: 'mock-peripheral-href2', type: 'jtag' },
  ];

  test('renders PeripheralsTable header correctly', () => {
    render(
      <GlobalStateProvider>
        <SocTotalPowerProvider>
          <PeripheralsTable device="mock-device" peripheralsUrl={mockPeripheralsUrl} update={false} notify={jest.fn()} />
        </SocTotalPowerProvider>
      </GlobalStateProvider>
    );

    expect(screen.getByText('Peripherals')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Usage')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('IO used')).toBeInTheDocument();
    expect(screen.getByText('Block Power')).toBeInTheDocument();
  });
});
