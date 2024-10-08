import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConnectivityModal from '../../components/ModalWindows/ConnectivityModal';
import { useClockSelection } from '../../ClockSelectionProvider';
import { useGlobalState } from '../../GlobalStateProvider';

jest.mock('../../ClockSelectionProvider');
jest.mock('../../GlobalStateProvider');

const mockCloseModal = jest.fn();
const mockOnSubmit = jest.fn();
const mockDefaultValue = {
  clock: 'Clock1',
  name: 'Endpoint1',
  activity: 'High',
  read_write_rate: 5,
  toggle_rate: 0.5,
};

const mockClocks = ['Clock1', 'Clock2'];
const mockConnectivityNames = ['Endpoint1', 'Endpoint2'];
const mockLoadActivity = ['High', 'Medium', 'Low'];

describe('ConnectivityModal Component', () => {
  beforeEach(() => {
    useClockSelection.mockReturnValue({ clocks: mockClocks });
    useGlobalState.mockReturnValue({
      GetOptions: (type) => {
        if (type === 'Port_Activity') return mockLoadActivity;
        return [];
      },
    });

    render(
      <ConnectivityModal
        closeModal={mockCloseModal}
        onSubmit={mockOnSubmit}
        defaultValue={mockDefaultValue}
        title="Connectivity Modal"
        connectivityNames={mockConnectivityNames}
      />
    );
  });

  it('renders the modal with the correct title', () => {
    expect(screen.getByText('Connectivity Modal')).toBeInTheDocument();
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

  it('renders the correct options in the Clock select dropdown', () => {
    const clockSelect = screen.getByDisplayValue('Clock1');
    fireEvent.click(clockSelect); 
    expect(screen.getByText('Clock1')).toBeInTheDocument();
    expect(screen.getByText('Clock2')).toBeInTheDocument();
  });
});
