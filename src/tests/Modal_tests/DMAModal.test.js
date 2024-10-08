import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DMAModal from '../../components/ModalWindows/DMAModal';

const mockCloseModal = jest.fn();
const mockOnSubmit = jest.fn();

const mockDefaultValue = {
  name: 'DMA Channel 1',
  source: 'Source1',
  destination: 'Destination1',
  activity: 'High',
  read_write_rate: 10,
  toggle_rate: 0.5,
};

describe('DMAModal Component', () => {
  beforeEach(() => {
    render(
      <DMAModal
        closeModal={mockCloseModal}
        onSubmit={mockOnSubmit}
        defaultValue={mockDefaultValue}
        title="DMA Modal"
        loadActivity={['High', 'Medium', 'Low']}
        source={['Source1', 'Source2']}
      />
    );
  });

  it('renders the modal with the correct title', () => {
    expect(screen.getByText('DMA Modal')).toBeInTheDocument();
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

  it('renders the correct default value for the "Channel Name" input', () => {
    const nameInput = screen.getByDisplayValue('DMA Channel 1');
    expect(nameInput).toBeInTheDocument();
  });
});
