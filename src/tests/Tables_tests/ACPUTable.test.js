import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ACPUTable from '../../components/Tables/ACPUTable';
import * as server from '../../utils/serverAPI';
import { useSocTotalPower } from '../../SOCTotalPowerProvider';
import { useGlobalState } from '../../GlobalStateProvider';

jest.mock('../../utils/serverAPI');
jest.mock('../../SOCTotalPowerProvider', () => ({
  useSocTotalPower: jest.fn(),
}));
jest.mock('../../GlobalStateProvider', () => ({
  useGlobalState: jest.fn(),
}));

describe('ACPUTable Component', () => {
  const mockDevice = 'mockDevice';
  const mockNotify = jest.fn();
  const mockUpdateTotalPower = jest.fn();
  const mockUpdateGlobalState = jest.fn();
  const mockAcpuNames = [{ text: 'ACPU1' }, { text: 'ACPU2' }];
  const mockLoadActivity = [{ label: 'Low', value: 0 }, { label: 'High', value: 1 }];

  beforeEach(() => {
    useSocTotalPower.mockReturnValue({
      updateTotalPower: mockUpdateTotalPower,
    });
    useGlobalState.mockReturnValue({
      GetOptions: () => mockLoadActivity,
      updateGlobalState: mockUpdateGlobalState,
      acpuNames: mockAcpuNames,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the Add button', () => {
    render(<ACPUTable device={mockDevice} update={false} notify={mockNotify} />);

    const addButton = screen.getByRole('button', { name: /add/i });
    expect(addButton).toBeInTheDocument();
  });
});
