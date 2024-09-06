import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Notes from '../components/Notes';

describe('Notes component', () => {
  const mockOnSubmit = jest.fn();
  const mockCloseModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Notes component with default value', () => {
    const defaultValue = 'Initial Note';
    render(<Notes defaultValue={defaultValue} onSubmit={mockOnSubmit} closeModal={mockCloseModal} />);

    // Check if the Notes textarea has the default value
    expect(screen.getByText('Notes')).toBeInTheDocument();
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe(defaultValue);
  });

  test('handles text input and change of form state', () => {
    const defaultValue = 'Initial Note';
    render(<Notes defaultValue={defaultValue} onSubmit={mockOnSubmit} closeModal={mockCloseModal} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Updated Note' } });

    // Check if the form state is updated
    expect(textarea.value).toBe('Updated Note');
  });

  test('submits the form and calls onSubmit and closeModal', () => {
    const defaultValue = 'Test Note';
    render(<Notes defaultValue={defaultValue} onSubmit={mockOnSubmit} closeModal={mockCloseModal} />);

    // Find the submit button and fire submit event
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    // Check if the onSubmit and closeModal functions are called
    expect(mockOnSubmit).toHaveBeenCalledWith(defaultValue);
    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });

  test('closes the modal when Escape key is pressed', () => {
    render(<Notes defaultValue="Note" onSubmit={mockOnSubmit} closeModal={mockCloseModal} />);

    // Simulate pressing the Escape key
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    // Check if closeModal is called
    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });

  test('closes the modal when the close icon is clicked', () => {
    render(<Notes defaultValue="Note" onSubmit={mockOnSubmit} closeModal={mockCloseModal} />);

    // Use querySelector to select the close icon (which is an SVG element)
    const closeButton = document.querySelector('.close-btn');
    fireEvent.click(closeButton);

    // Check if closeModal is called
    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });
});

