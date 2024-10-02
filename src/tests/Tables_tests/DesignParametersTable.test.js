import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DesignParametesTable from '../../components/Tables/DesignParametesTable';
import '@testing-library/jest-dom';

jest.mock('../../GlobalStateProvider', () => ({
  useGlobalState: () => ({
    GetOptions: jest.fn(() => ['IO_Option1', 'IO_Option2']),
  }),
}));

describe('DesignParametesTable Component', () => {
  test('renders the component with all elements', () => {
    render(<DesignParametesTable />);
    
    expect(screen.getByText('LUTs')).toBeInTheDocument();
    expect(screen.getByText('FFs')).toBeInTheDocument();
    expect(screen.getByText('BRAMs')).toBeInTheDocument();
    expect(screen.getByText('DSP')).toBeInTheDocument();
    expect(screen.getByLabelText('RISC-V ACPU')).toBeInTheDocument();
    expect(screen.getByLabelText('DDR')).toBeInTheDocument();
    expect(screen.getByLabelText('OCM')).toBeInTheDocument();
    expect(screen.getByText('Calculate')).toBeInTheDocument();
  });

  test('handles checking and unchecking ACPU checkbox', () => {
    render(<DesignParametesTable />);
    
    const acpuCheckbox = screen.getByLabelText('RISC-V ACPU');
    
    expect(acpuCheckbox.checked).toBe(true);
    
    fireEvent.click(acpuCheckbox);
    expect(acpuCheckbox.checked).toBe(false);
  });

  test('handles changing ACPU frequency input', () => {
    render(<DesignParametesTable />);
    
    const acpuInput = screen.getByDisplayValue('0 MHz');
    
    fireEvent.change(acpuInput, { target: { value: '400' } });
    expect(acpuInput.value).toBe('400 MHz');
  });

  test('handles changing DDR selection dropdown', () => {
    render(<DesignParametesTable />);
    
    const ddrDropdown = screen.getByLabelText('DDR');
    
    fireEvent.change(ddrDropdown, { target: { value: 'DDR_Option2' } });
    expect(ddrDropdown.value).toBe('DDR_Option2');
  });

  test('handles clicking the calculate button', () => {
    render(<DesignParametesTable />);
    
    const calculateButton = screen.getByText('Calculate');
    
    fireEvent.click(calculateButton);
  });
});
