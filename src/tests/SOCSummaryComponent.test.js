import React from 'react';
import { render, screen } from '@testing-library/react';
import SOCSummaryComponent from '../components/SOCSummaryComponent';
import PowerSummaryTable from '../components/Tables/PowerSummaryTable';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { useGlobalState } from '../GlobalStateProvider';
import '@testing-library/jest-dom';

jest.mock('../SOCTotalPowerProvider', () => ({
  useSocTotalPower: jest.fn(),
}));

jest.mock('../GlobalStateProvider', () => ({
  useGlobalState: jest.fn(),
}));

jest.mock('../components/Tables/PowerSummaryTable', () => jest.fn(() => <div>Mock PowerSummaryTable</div>));

describe('SOCSummaryComponent', () => {
  beforeEach(() => {
    useSocTotalPower.mockReturnValue({
      totalConsumption: {
        processing_complex: {
          dynamic: { power: 0, percentage: 0, components: [] },
          static: { power: 0, percentage: 0 },
          total_power: 0,
          total_percentage: 0,
        },
      },
    });

    useGlobalState.mockReturnValue({
      socState: {},
    });
  });

  it('renders without crashing', () => {
    render(<SOCSummaryComponent device="test-device" />);
    expect(screen.getByText('Mock PowerSummaryTable')).toBeInTheDocument();
  });

  it('passes correct data to PowerSummaryTable', () => {
    render(<SOCSummaryComponent device="test-device" />);
    expect(PowerSummaryTable).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Processing Complex (SOC) Power',
        data: expect.any(Array),
        total: 0,
        percent: 0,
      }),
      expect.anything()
    );
  });

  it('renders with the correct device prop', () => {
    render(<SOCSummaryComponent device="test-device" />);
    expect(PowerSummaryTable).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.any(Array),
      }),
      expect.anything()
    );
  });

  it('initializes with default data values', () => {
    const { dynamic } = useSocTotalPower().totalConsumption.processing_complex;
    const memory = dynamic.components.find((element) => element.type === 'memory');

    render(<SOCSummaryComponent device="test-device" />);
    
    const expectedData = [
      { text: 'Memory', power: memory?.power || 0, percent: memory?.percentage || 0, messages: [] },
      { text: 'Peripherals', power: 0, percent: 0, messages: [] },
      { text: 'ACPU', power: 0, percent: 0, messages: [] },
      { text: 'DMA', power: 0, percent: 0, messages: [] },
      { text: 'Interconnect', power: 0, percent: 0, messages: [] },
      { text: 'BCPU', power: 0, percent: 0, messages: [] },
      { text: 'Processing Dynamic', power: 0, percent: 0, messages: [] },
      { text: 'Processing Static', power: 0, percent: 0, messages: [] },
    ];

    expect(PowerSummaryTable).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expectedData,
      }),
      expect.anything()
    );
  });

  it('passes the correct title to PowerSummaryTable', () => {
    render(<SOCSummaryComponent device="test-device" />);
    expect(PowerSummaryTable).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Processing Complex (SOC) Power',
      }),
      expect.anything()
    );
  });
});
