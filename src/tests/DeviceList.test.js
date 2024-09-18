import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
// import 'isomorphic-fetch';
// import fetch from 'isomorphic-fetch';
import DeviceList from '../components/DeviceList';
import { SelectionProvider } from '../SelectionProvider';
import { SocTotalPowerProvider } from '../SOCTotalPowerProvider';
import * as server from '../utils/serverAPI';
import { GlobalStateProvider } from '../GlobalStateProvider';

jest.mock('../utils/serverAPI', () => ({
  GET: jest.fn(),
  deviceInfo: jest.fn(),
}));

const mockDevices = [
  { id: '1', series: 'Series A' },
  { id: '2', series: 'Series B' },
];

describe('DeviceList', () => {
  const handleDeviceChange = jest.fn();

  beforeEach(() => {
    server.GET.mockImplementation((_, callback) => {
      callback({ logic_density: 'High', package: 'FPGA', speedgrade: '1', temperature_grade: 'A' });
    });
  });

  test('renders the device selection and device info', () => {
    render(
      <SelectionProvider>
        <DeviceList devices={mockDevices} selectedDevice="" handleDeviceChange={handleDeviceChange} />
      </SelectionProvider>
    );

    expect(screen.getByLabelText(/Device:/i)).toBeInTheDocument();
    expect(screen.getByText('Select a device...')).toBeInTheDocument();
  });

  test('loads device info when a device is selected', () => {
    render(
      <SelectionProvider>
        <DeviceList devices={mockDevices} selectedDevice="" handleDeviceChange={handleDeviceChange} />
      </SelectionProvider>
    );

    fireEvent.change(screen.getByLabelText(/Device:/i), { target: { value: '1' } });

    expect(handleDeviceChange).toHaveBeenCalledWith('1');
    expect(server.GET).toHaveBeenCalled();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('FPGA')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  test('shows n/a when device info is not available', () => {
    server.GET.mockImplementation((_, callback) => {
      callback({});
    });

    render(
      <SelectionProvider>
        <DeviceList devices={mockDevices} selectedDevice="" handleDeviceChange={handleDeviceChange} />
      </SelectionProvider>
    );

    fireEvent.change(screen.getByLabelText(/Device:/i), { target: { value: '1' } });

    const naLabels = screen.getAllByText('(n/a)');
    expect(naLabels.length).toBe(4); 
    expect(naLabels[0]).toBeInTheDocument(); // Logic Density
    expect(naLabels[1]).toBeInTheDocument(); // Package
    expect(naLabels[2]).toBeInTheDocument(); // Speedgrade
    expect(naLabels[3]).toBeInTheDocument(); // Temp Grade
  });
});