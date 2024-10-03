import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PowerTable from '../../components/Tables/PowerTable';
import * as common from '../../utils/common';

jest.mock('../../utils/common', () => ({
  ...jest.requireActual('../../utils/common'),
  fixed: jest.fn(),
}));

describe('PowerTable Component', () => {
  const resourcesHeaders = ['Used', 'Total', 'Power', '%'];
  const resources = [
    ['Resource 1', 10, 2, '20%', '10%'],
    ['Resource 2', 10, 3, '15%', '5%'],
  ];

  beforeEach(() => {
    common.fixed.mockImplementation((value) => value.toFixed(2));
  });

  test('renders the PowerTable component with the correct title and total', () => {
    render(
      <PowerTable
        title="Test Power Table"
        total={10}
        resourcesHeaders={resourcesHeaders}
        resources={resources}
      />
    );
    expect(screen.getByText('Test Power Table')).toBeInTheDocument();
    expect(screen.getByText('10.00 W')).toBeInTheDocument();
  });

  test('renders the subHeader correctly when provided', () => {
    render(
      <PowerTable
        title="Test Power Table"
        total={10}
        resourcesHeaders={resourcesHeaders}
        resources={resources}
        subHeader="Test Resources"
      />
    );
    expect(screen.getByText('Test Resources')).toBeInTheDocument();
  });

  test('displays null total if total is not provided', () => {
    render(
      <PowerTable
        title="Test Power Table"
        total={null}
        resourcesHeaders={resourcesHeaders}
        resources={resources}
      />
    );
    expect(screen.queryByText('Total')).toBeInTheDocument();
    expect(screen.queryByText('10.00 W')).not.toBeInTheDocument();
  });

  test('calls fixed function correctly for each resource and total', () => {
    render(
      <PowerTable
        title="Test Power Table"
        total={10}
        resourcesHeaders={resourcesHeaders}
        resources={resources}
      />
    );
    expect(common.fixed).toHaveBeenCalledWith(10);
  });

  test('renders percentage correctly based on resources length', () => {
    render(
      <PowerTable
        title="Test Power Table"
        total={10}
        resourcesHeaders={resourcesHeaders}
        resources={resources}
      />
    );
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
  });
});
