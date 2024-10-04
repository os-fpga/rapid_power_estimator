import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import IOPowerTable from '../../components/Tables/IOPowerTable';
import { fixed } from '../../utils/common';

jest.mock('../../utils/common', () => ({
  fixed: jest.fn((value) => value.toFixed(1)),
}));

describe('IOPowerTable Component', () => {
  const mockResources = {
    io_usage: [
      {
        type: 'HP',
        total_banks_available: 3,
        total_io_available: 150,
        percentage: 60,
        usage: [
          { banks_used: 1, io_used: 50, io_available: 100, voltage: 1.2, error: false },
          { banks_used: 1, io_used: 30, io_available: 120, voltage: 1.8, error: false },
          { banks_used: 1, io_used: 40, io_available: 110, voltage: 2.5, error: true },
        ],
      },
    ],
  };

  test('renders IOPowerTable component with title and total power', () => {
    render(<IOPowerTable title="IO Power" total={15} resources={mockResources} />);
    expect(screen.getByText('IO Power')).toBeInTheDocument();
    expect(screen.getByText('15.0 W')).toBeInTheDocument();
  });

  test('renders resource table correctly', () => {
    render(<IOPowerTable title="IO Power" total={15} resources={mockResources} />);
    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.getByText('1.2')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('60.0')).toBeInTheDocument();
  });

  test('displays cells with error styling when error is true', () => {
    render(<IOPowerTable title="IO Power" total={15} resources={mockResources} />);
    const errorCells = screen.getAllByText('40');
    errorCells.forEach((cell) => {
      expect(cell).toHaveClass('error');
    });
  });

  test('renders multiple rows for resource usage', () => {
    render(<IOPowerTable title="IO Power" total={15} resources={mockResources} />);
    expect(screen.getAllByText('1').length).toBe(3);
  });

  test('renders correct number of rows for IO usage', () => {
    render(<IOPowerTable title="IO Power" total={15} resources={mockResources} />);
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(3);
  });

  test('renders correct voltage for first resource', () => {
    render(<IOPowerTable title="IO Power" total={15} resources={mockResources} />);
    expect(screen.getByText('1.2')).toBeInTheDocument();
  });

  test('renders correct total banks available', () => {
    render(<IOPowerTable title="IO Power" total={15} resources={mockResources} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('renders correct total IO available', () => {
    render(<IOPowerTable title="IO Power" total={15} resources={mockResources} />);
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  test('renders correct percentage value', () => {
    render(<IOPowerTable title="IO Power" total={15} resources={mockResources} />);
    expect(screen.getByText('60.0')).toBeInTheDocument();
  });

  test('renders second row voltage correctly', () => {
    render(<IOPowerTable title="IO Power" total={15} resources={mockResources} />);
    expect(screen.getByText('1.8')).toBeInTheDocument();
  });

  test('renders correct error status for third row', () => {
    render(<IOPowerTable title="IO Power" total={15} resources={mockResources} />);
    const errorCells = screen.getAllByText('40');
    errorCells.forEach((cell) => {
      expect(cell).toHaveClass('error');
    });
  });

  test('renders correct voltage for third row', () => {
    render(<IOPowerTable title="IO Power" total={15} resources={mockResources} />);
    expect(screen.getByText('2.5')).toBeInTheDocument();
  });

  test('displays correct power total format', () => {
    render(<IOPowerTable title="IO Power" total={15.23} resources={mockResources} />);
    expect(screen.getByText('15.2 W')).toBeInTheDocument();
  });
});
