import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BramModal from '../../components/ModalWindows/BramModal';
import { FieldType } from '../../utils/common';
import { useClockSelection } from '../../ClockSelectionProvider';
import { useGlobalState } from '../../GlobalStateProvider';

jest.mock('../../ClockSelectionProvider');
jest.mock('../../GlobalStateProvider');

const mockCloseModal = jest.fn();
const mockOnSubmit = jest.fn();
const mockDefaultValue = {
  name: 'BRAM_1',
  type: 'BRAM_36K',
  bram_used: 2,
  port_a_clock: 'Clock1',
  port_a_width: 32,
  port_a_write_enable_rate: 0.5,
  port_a_read_enable_rate: 0.5,
  port_a_toggle_rate: 0.3,
  port_b_clock: 'Clock2',
  port_b_width: 32,
  port_b_write_enable_rate: 0.6,
  port_b_read_enable_rate: 0.6,
  port_b_toggle_rate: 0.4,
};

const mockClocks = ['Clock1', 'Clock2'];
const mockBramType = ['BRAM_18K', 'BRAM_36K'];

describe('BramModal Component', () => {
  beforeEach(() => {
    useClockSelection.mockReturnValue({ clocks: mockClocks });
    useGlobalState.mockReturnValue({
      GetOptions: () => mockBramType,
    });

    render(
      <BramModal
        closeModal={mockCloseModal}
        onSubmit={mockOnSubmit}
        defaultValue={mockDefaultValue}
        title="BRAM Modal"
      />
    );
  });

  it('renders the modal with correct title', () => {
    expect(screen.getByText('BRAM Modal')).toBeInTheDocument();
  });

  it('calls closeModal when the close button is clicked', () => {
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('calls onSubmit with correct data when the form is submitted', () => {
    const submitButton = screen.getByText(/ok/i);
    fireEvent.click(submitButton);
    expect(mockOnSubmit).toHaveBeenCalledWith(mockDefaultValue);
  });

  it('renders the Cancel button', () => {
    const cancelButton = screen.getByText(/cancel/i);
    expect(cancelButton).toBeInTheDocument();
  });
});
