import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemoryModal from '../../components/ModalWindows/MemoryModal';
import { useGlobalState } from '../../GlobalStateProvider';

const mockFieldType = {
  select: 'select',
  number: 'number',
};

jest.mock('../../components/ModalWindows/ModalWindow', () => ({ title, closeModal, fields, onSubmit }) => (
  <div data-testid="modal">
    <h1>{title}</h1>
    <button onClick={closeModal}>Close</button>
    {fields.map((field) => (
      <div key={field.id}>
        <label>{field.text}</label>
        {field.fieldType === mockFieldType.select ? (
          <select value={field.value} aria-label={field.text}>
            {field.values.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="number"
            value={field.value}
            aria-label={field.text}
            readOnly
          />
        )}
      </div>
    ))}
    <button onClick={onSubmit}>Submit</button>
  </div>
));

jest.mock('../../GlobalStateProvider', () => ({
  useGlobalState: () => ({
    GetOptions: jest.fn((type) => {
      switch (type) {
        case 'Peripherals_Usage':
          return ['Low', 'Medium', 'High'];
        case 'Memory_Type':
          return ['DDR4', 'DDR3', 'DDR2'];
        default:
          return [];
      }
    }),
  }),
}));

const mockCloseModal = jest.fn();
const mockOnSubmit = jest.fn();

const mockDefaultValue = {
  name: 'Memory Component 1',
  usage: 'Medium',
  memory_type: 'DDR4',
  data_rate: 3200,
  width: 64,
};

describe('MemoryModal Component', () => {
  beforeEach(() => {
    render(
      <MemoryModal
        closeModal={mockCloseModal}
        onSubmit={mockOnSubmit}
        defaultValue={mockDefaultValue}
      />
    );
  });

  it('renders the modal window with correct title', () => {
    expect(screen.getByText('Memory Component 1')).toBeInTheDocument();
  });

  it('renders the data rate input field with correct default value', () => {
    const dataRateInput = screen.getByLabelText('Data Rate');
    expect(dataRateInput).toHaveValue(3200);
  });

  it('renders the width input field with correct default value', () => {
    const widthInput = screen.getByLabelText('Width');
    expect(widthInput).toHaveValue(64);
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

  it('renders the modal window', () => {
    const modal = screen.getByTestId('modal');
    expect(modal).toBeInTheDocument();
  });
});
