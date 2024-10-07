import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ABCPUModal from '../../components/ModalWindows/ABCPUModal';
import { FieldType } from '../../utils/common';

const mockCloseModal = jest.fn();
const mockOnSubmit = jest.fn();
const mockDefaultValue = {
  name: 'endpoint1',
  activity: 'idle',
  read_write_rate: 2.0,
  toggle_rate: 1.0,
};
const mockEndpoints = ['endpoint1', 'endpoint2', 'endpoint3'];
const mockLoadActivity = ['idle', 'active', 'busy'];

describe('ABCPUModal Component', () => {
  beforeEach(() => {
    render(
      <ABCPUModal
        closeModal={mockCloseModal}
        onSubmit={mockOnSubmit}
        defaultValue={mockDefaultValue}
        endpoints={mockEndpoints}
        title="Test Modal"
        loadActivity={mockLoadActivity}
      />
    );
  });

  it('renders the modal with correct title', () => {
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('calls closeModal when the modal is closed', () => {
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('calls onSubmit with correct data when the form is submitted', () => {
    const submitButton = screen.getByText(/ok/i);
    fireEvent.click(submitButton);
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: mockDefaultValue.name,
      activity: mockDefaultValue.activity,
      read_write_rate: mockDefaultValue.read_write_rate,
      toggle_rate: mockDefaultValue.toggle_rate,
    });
  });

  // New simple tests
  it('renders the Cancel button', () => {
    const cancelButton = screen.getByText(/cancel/i);
    expect(cancelButton).toBeInTheDocument();
  });

  it('displays correct number of options in the endpoint select field', () => {
    const endpointSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(endpointSelect);
    expect(endpointSelect).toBeInTheDocument();
    expect(endpointSelect.options.length).toBe(mockEndpoints.length);
  });

  it('renders the OK button', () => {
    const okButton = screen.getByText(/ok/i);
    expect(okButton).toBeInTheDocument();
  });
});
