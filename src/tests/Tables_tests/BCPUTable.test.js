import React from 'react';
import { render, screen } from '@testing-library/react';
import BCPUTable from '../../components/Tables/BCPUTable';
import * as server from '../../utils/serverAPI';
import '@testing-library/jest-dom';
import { SocTotalPowerProvider } from '../../SOCTotalPowerProvider';
import { GlobalStateProvider } from '../../GlobalStateProvider';

jest.mock('../../utils/serverAPI', () => ({
  GET: jest.fn(),
  PATCH: jest.fn(),
  peripheralPath: jest.fn(),
  api: {
    fetch: jest.fn(),
  },
  Elem: {
    peripherals: 'peripherals-endpoint',
  },
}));

describe('BCPUTable Component', () => {
  const device = 'testDevice';
  const update = false;
  const notify = jest.fn();

  const mockUseGlobalState = jest.fn(() => ({
    GetOptions: jest.fn(() => ['Option1', 'Option2']),
    bcpuNames: [{ text: 'BCPU1' }, { text: 'BCPU2' }],
  }));

  jest.mock('../../GlobalStateProvider', () => ({
    useGlobalState: mockUseGlobalState,
  }));

  const mockUseSocTotalPower = jest.fn(() => ({
    updateTotalPower: jest.fn(),
  }));

  jest.mock('../../SOCTotalPowerProvider', () => ({
    useSocTotalPower: mockUseSocTotalPower,
  }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <SocTotalPowerProvider>
        <GlobalStateProvider>
          <BCPUTable device={device} update={update} notify={notify} />
        </GlobalStateProvider>
      </SocTotalPowerProvider>
    );
  };

  test('should render BCPUTable component correctly', () => {
    renderComponent();
    const titleElement = screen.getByText(/BCPU power/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('should call server.GET when component is mounted', async () => {
    renderComponent();
    expect(server.GET).toHaveBeenCalled();
  });
});
