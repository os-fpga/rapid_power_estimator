import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PeripheralsModal from '../../components/ModalWindows/PeripheralsModal';

jest.mock('../../components/ModalWindows/ModalWindow', () => ({ title, closeModal, fields, onSubmit }) => (
  <div data-testid="modal">
    <h1>{title}</h1>
    <button onClick={closeModal}>Close</button>
    {fields.map((field) => (
      <div key={field.id}>
        <label>{field.text}</label>
        <input defaultValue={field.value} aria-label={field.text} />
      </div>
    ))}
    <button onClick={onSubmit}>Submit</button>
  </div>
));

const mockCloseModal = jest.fn();
const mockOnSubmit = jest.fn();

const mockDefaultValue = {
  usage: ['Low', 'Medium', 'High'],
  performance: ['Good', 'Better', 'Best'],
  performance_id: 'perf_1',
  io_used: true,
  data: [
    {
      data: {
        usage: 'High',
        name: 'Peripheral 1',
        io_used: 5,
        performance: 'Best',
      },
    },
  ],
};

describe('PeripheralsModal Component', () => {
  beforeEach(() => {
    render(
      <PeripheralsModal
        closeModal={mockCloseModal}
        onSubmit={mockOnSubmit}
        defaultValue={mockDefaultValue}
        index={0}
      />
    );
  });

  it('renders the modal window with correct title', () => {
    expect(screen.getByText('Peripheral 1')).toBeInTheDocument();
  });

  it('calls closeModal when the modal is closed', () => {
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('calls onSubmit when the form is submitted', () => {
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
