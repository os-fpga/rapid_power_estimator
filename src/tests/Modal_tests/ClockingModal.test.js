import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClockingModal from '../../components/ModalWindows/ClockingModal';
import { FieldType } from '../../utils/common';
import { useGlobalState } from '../../GlobalStateProvider';

jest.mock('../../GlobalStateProvider');

const mockCloseModal = jest.fn();
const mockOnSubmit = jest.fn();
const mockDefaultValue = {
  source: 'Source1',
  description: 'Test Description',
  port: 'Port1',
  frequency: 100,
  state: 'Active',
};

const mockSources = ['Source1', 'Source2'];
const mockStates = ['Active', 'Inactive'];

describe('ClockingModal Component', () => {
  beforeEach(() => {
    useGlobalState.mockReturnValue({
      GetOptions: (type) => {
        if (type === 'Clock_State') return mockStates;
        if (type === 'Source') return mockSources;
        return [];
      },
    });

    render(
      <ClockingModal
        closeModal={mockCloseModal}
        onSubmit={mockOnSubmit}
        defaultValue={mockDefaultValue}
        title="Clocking Modal"
      />
    );
  });

  it('renders the modal with the correct title', () => {
    expect(screen.getByText('Clocking Modal')).toBeInTheDocument();
  });

  it('calls closeModal when the close button is clicked', () => {
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('calls onSubmit with the correct data when the form is submitted', () => {
    const submitButton = screen.getByText(/ok/i);
    fireEvent.click(submitButton);
    expect(mockOnSubmit).toHaveBeenCalledWith(mockDefaultValue);
  });

  it('renders the Cancel button', () => {
    const cancelButton = screen.getByText(/cancel/i);
    expect(cancelButton).toBeInTheDocument();
  });

  it('renders the Frequency input field as a number type', () => {
    const frequencyInput = screen.getByDisplayValue(100);
    expect(frequencyInput).toHaveAttribute('type', 'number');
  });
});
