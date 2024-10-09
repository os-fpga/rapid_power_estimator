import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModalWindow from '../../components/ModalWindows/ModalWindow';
import { FieldType } from '../../utils/common';

const mockCloseModal = jest.fn();
const mockOnSubmit = jest.fn();

const mockFields = [
  {
    fieldType: FieldType.textarea,
    id: 'name',
    text: 'Name',
    value: 'Test Name',
  },
  {
    fieldType: FieldType.number,
    id: 'age',
    text: 'Age',
    value: 25,
  },
  {
    fieldType: FieldType.float,
    id: 'percentage',
    text: 'Percentage',
    value: 0.5,
    step: 0.1,
  },
  {
    fieldType: FieldType.selectClock,
    id: 'clock',
    text: 'Clock',
    values: ['Clock1', 'Clock2'],
    value: 'Clock1',
  },
];

const mockDefaultValue = {
  name: 'Test Name',
  age: 25,
  percentage: 0.5,
  clock: 'Clock1',
};

describe('ModalWindow Component', () => {
  beforeEach(() => {
    render(
      <ModalWindow
        title="Test Modal"
        defaultValue={mockDefaultValue}
        onSubmit={mockOnSubmit}
        closeModal={mockCloseModal}
        fields={mockFields}
      />
    );
  });

  it('renders the modal with the correct title', () => {
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('renders all input fields with correct default values', () => {
    expect(screen.getByDisplayValue('Test Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('25')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50.0')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Clock1')).toBeInTheDocument();
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

  it('updates the name field when changed', () => {
    const nameInput = screen.getByDisplayValue('Test Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    expect(nameInput.value).toBe('Updated Name');
  });

  it('updates the age field when changed', () => {
    const ageInput = screen.getByDisplayValue('25');
    fireEvent.change(ageInput, { target: { value: '30' } });
    expect(ageInput.value).toBe('30');
  });

  it('updates the percentage field when changed', () => {
    const percentageInput = screen.getByDisplayValue('50.0');
    fireEvent.change(percentageInput, { target: { value: '60.0' } });
    expect(percentageInput.value).toBe('60.0');
  });

  it('updates the clock field when changed', () => {
    const clockSelect = screen.getByDisplayValue('Clock1');
    fireEvent.change(clockSelect, { target: { value: 'Clock2' } });
    expect(screen.getByDisplayValue('Clock2')).toBeInTheDocument();
  });
});
