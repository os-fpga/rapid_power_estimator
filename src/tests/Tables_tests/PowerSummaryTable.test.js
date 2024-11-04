import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import PowerSummaryTable from '../../components/Tables/PowerSummaryTable';
import { Tooltip } from 'antd';

jest.mock('antd', () => ({
  Tooltip: jest.fn(({ title, children }) => <div>{children} <span>{title}</span></div>),
}));

jest.mock('../../utils/common', () => ({
  fixed: jest.fn((number, precision = 2) => number.toFixed(precision)),
  color: jest.fn((isError, isWarning) => (isError ? 'red' : isWarning ? 'yellow' : 'green')),
}));

describe('PowerSummaryTable Component', () => {
  const mockData = [
    {
      text: 'Item 1',
      power: 10,
      percent: 20,
      messages: [[{ type: 'warn', text: 'Warning message' }]],
    },
    {
      text: 'Item 2',
      power: 20,
      percent: 40,
      messages: [[{ type: 'error', text: 'Error message' }]],
    },
    {
      text: 'Item 3',
      power: 30,
      percent: 60,
      messages: [],
    },
  ];

  test('renders the table title and bottom total', () => {
    render(<PowerSummaryTable title="Power Summary" data={mockData} total={60} percent={80} />);
    expect(screen.getByText('Power Summary')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('60.00') && content.includes('W'))).toBeInTheDocument();
    expect(screen.getByText('80 %')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('value', '80');
    expect(progressBar).toHaveAttribute('max', '100');
  });

  test('renders power cells and percentage for each row', () => {
    render(<PowerSummaryTable title="Power Summary" data={mockData} total={60} percent={80} />);
    mockData.forEach((item) => {
      expect(screen.getByText(item.text)).toBeInTheDocument();
      expect(screen.getByText(`${item.power.toFixed(3)} W`)).toBeInTheDocument();
      expect(screen.getByText(`${item.percent.toFixed(0)} %`)).toBeInTheDocument();
    });
  });

  test('renders warning and error tooltips', () => {
    render(<PowerSummaryTable title="Power Summary" data={mockData} total={60} percent={80} />);
    const warningRow = screen.getByText('Item 1').closest('tr');
    const warningTooltip = within(warningRow).getByText('Warning message');
    expect(warningTooltip).toBeInTheDocument();
    const errorRow = screen.getByText('Item 2').closest('tr');
    const errorTooltip = within(errorRow).getByText('Error message');
    expect(errorTooltip).toBeInTheDocument();
  });

  test('does not render tooltip for rows without messages', () => {
    render(<PowerSummaryTable title="Power Summary" data={mockData} total={60} percent={80} />);
    const noMessageRow = screen.getByText('Item 3').closest('tr');
    expect(within(noMessageRow).queryByText('Warning message')).toBeNull();
    expect(within(noMessageRow).queryByText('Error message')).toBeNull();
  });

  test('total and percent values match sum of data', () => {
    render(<PowerSummaryTable title="Power Summary" data={mockData} total={60} percent={80} />);
  
    const displayedTotal = screen.getByText((content) => content.includes('60.00') && content.includes('W'));
    expect(displayedTotal).toBeInTheDocument();
  
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('value', '80');
    expect(progressBar).toHaveAttribute('max', '100');
  });  

  test('renders correctly with no data entries', () => {
    render(<PowerSummaryTable title="Power Summary" data={[]} total={0} percent={0} />);
  
    expect(screen.getByText('Power Summary')).toBeInTheDocument();
  
    expect(screen.getByText('0.00 W')).toBeInTheDocument();
    expect(screen.getByText('0 %')).toBeInTheDocument();
  
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('value', '0');
  });  
});
