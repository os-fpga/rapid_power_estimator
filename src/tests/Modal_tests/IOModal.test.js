import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IOModal from '../../components/ModalWindows/IOModal';
import { FieldType } from '../../utils/common';

const mockCloseModal = jest.fn();
const mockOnSubmit = jest.fn();

const mockDefaultValue = {
  name: 'Test Port',
  bus_width: 16,
  clock: 'Clock1',
  duty_cycle: 50,
  direction: 'Input',
  io_standard: 'Standard1',
  drive_strength: 'Strength1',
  slew_rate: 'Fast',
  differential_termination: 'Termination1',
  io_pull_up_down: 'PullUp',
  io_data_type: 'Type1',
  input_enable_rate: 100,
  output_enable_rate: 200,
  synchronization: 'Sync1',
  toggle_rate: 1.5,
};

const mockClocks = ['Clock1', 'Clock2'];
const mockOptions = {
  IO_Direction: ['Input', 'Output'],
  IO_Standard: ['Standard1', 'Standard2'],
  IO_Drive_Strength: ['Strength1', 'Strength2'],
  IO_Slew_Rate: ['Fast', 'Slow'],
  IO_differential_termination: ['Termination1', 'Termination2'],
  IO_Data_Type: ['Type1', 'Type2'],
  IO_Synchronization: ['Sync1', 'Sync2'],
  IO_Pull_up_down: ['PullUp', 'PullDown'],
};

jest.mock('../../ClockSelectionProvider', () => ({
  useClockSelection: () => ({
    clocks: mockClocks,
  }),
}));

jest.mock('../../GlobalStateProvider', () => ({
  useGlobalState: () => ({
    GetOptions: (option) => mockOptions[option],
  }),
}));

describe('IOModal Component', () => {
  beforeEach(() => {
    render(
      <IOModal
        title="Test IO Modal"
        defaultValue={mockDefaultValue}
        closeModal={mockCloseModal}
        onSubmit={mockOnSubmit}
      />
    );
  });

  it('renders the modal with the correct title', () => {
    expect(screen.getByText('Test IO Modal')).toBeInTheDocument();
  });

  it('calls closeModal when the close button is clicked', () => {
    const closeButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(closeButton);
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('calls onSubmit with correct data when the form is submitted', () => {
    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);
    expect(mockOnSubmit).toHaveBeenCalledWith(mockDefaultValue);
  });

  it('updates the RTL Port Name field when changed', () => {
    const nameInput = screen.getByDisplayValue('Test Port');
    fireEvent.change(nameInput, { target: { value: 'Updated Port' } });
    expect(nameInput.value).toBe('Updated Port');
  });

  it('updates the bus width field when changed', () => {
    const busWidthInput = screen.getByDisplayValue('16');
    fireEvent.change(busWidthInput, { target: { value: '32' } });
    expect(busWidthInput.value).toBe('32');
  });

  it('updates the clock field when changed', () => {
    const clockSelect = screen.getByDisplayValue('Clock1');
    fireEvent.change(clockSelect, { target: { value: 'Clock2' } });
    expect(screen.getByDisplayValue('Clock2')).toBeInTheDocument();
  });
});
