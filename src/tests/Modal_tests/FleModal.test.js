import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FleModal from '../../components/ModalWindows/FleModal';
import { FieldType } from '../../utils/common';

const mockCloseModal = jest.fn();
const mockOnSubmit = jest.fn();

const mockDefaultValue = {
  name: 'Test Name',
  lut6: 32,
  flip_flop: 16,
  clock: 'Clock1',
  toggle_rate: 1.5,
  glitch_factor: 'Factor1',
  clock_enable_rate: 50,
};

const mockClocks = ['Clock1', 'Clock2'];
const mockGlitchFactor = ['Factor1', 'Factor2'];

jest.mock('../../ClockSelectionProvider', () => ({
  useClockSelection: () => ({
    clocks: mockClocks,
  }),
}));

jest.mock('../../GlobalStateProvider', () => ({
  useGlobalState: () => ({
    GetOptions: (option) => (option === 'Glitch_Factor' ? mockGlitchFactor : []),
  }),
}));

describe('FleModal Component', () => {
  beforeEach(() => {
    render(
      <FleModal
        title="Test Fle Modal"
        defaultValue={mockDefaultValue}
        closeModal={mockCloseModal}
        onSubmit={mockOnSubmit}
      />
    );
  });

  it('renders the modal with the correct title', () => {
    expect(screen.getByText('Test Fle Modal')).toBeInTheDocument();
  });

  it('renders the Name/Hierarchy field with correct default value', () => {
    const nameInput = screen.getByDisplayValue('Test Name');
    expect(nameInput).toBeInTheDocument();
  });

  it('renders the LUT6 field with correct default value', () => {
    const lut6Input = screen.getByDisplayValue('32');
    expect(lut6Input).toBeInTheDocument();
  });

  it('renders the FF/Latch field with correct default value', () => {
    const ffInput = screen.getByDisplayValue('16');
    expect(ffInput).toBeInTheDocument();
  });

  it('renders the clock select field with correct default value', () => {
    const clockSelect = screen.getByDisplayValue('Clock1');
    expect(clockSelect).toBeInTheDocument();
  });
  
  it('renders the toggle rate field with correct default value', () => {
    const toggleRateInput = screen.getByDisplayValue('150.0');  
    expect(toggleRateInput).toBeInTheDocument();
  });
  
  it('renders the clock enable rate field with correct default value', () => {
    const clockEnableInput = screen.getByDisplayValue('5000');  
    expect(clockEnableInput).toBeInTheDocument();
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

  it('updates the Name/Hierarchy field when changed', () => {
    const nameInput = screen.getByDisplayValue('Test Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    expect(nameInput.value).toBe('Updated Name');
  });

  it('updates the LUT6 field when changed', () => {
    const lut6Input = screen.getByDisplayValue('32');
    fireEvent.change(lut6Input, { target: { value: '64' } });
    expect(lut6Input.value).toBe('64');
  });

  it('updates the clock select field when changed', () => {
    const clockSelect = screen.getByDisplayValue('Clock1');
    fireEvent.change(clockSelect, { target: { value: 'Clock2' } });
    expect(screen.getByDisplayValue('Clock2')).toBeInTheDocument();
  });
});
