import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IOModal from '../../components/ModalWindows/IOModal';

const FieldType = {
  textarea: 'textarea',
  number: 'number',
  selectClock: 'selectClock',
  float: 'float',
  select: 'select',
};

jest.mock('../../ClockSelectionProvider', () => ({
  useClockSelection: () => ({
    clocks: ['Clock1', 'Clock2'],
  }),
}));

jest.mock('../../GlobalStateProvider', () => ({
  useGlobalState: () => ({
    GetOptions: (key) => {
      const options = {
        IO_Direction: ['Input', 'Output'],
        IO_Standard: ['LVDS', 'CMOS'],
        IO_Drive_Strength: ['Low', 'Medium', 'High'],
        IO_Slew_Rate: ['Fast', 'Slow'],
        IO_differential_termination: ['Yes', 'No'],
        IO_Data_Type: ['Signed', 'Unsigned'],
        IO_Synchronization: ['Synchronous', 'Asynchronous'],
        IO_Pull_up_down: ['Pullup', 'Pulldown'],
      };
      return options[key];
    },
  }),
}));

jest.mock('../../components/ModalWindows/ModalWindow', () => ({ title, closeModal, onSubmit, fields }) => (
  <div data-testid="modal">
    <h1>{title}</h1>
    {fields.map((field) => (
      <div key={field.id}>
        <label>{field.text}</label>
        <input
          type={field.fieldType === FieldType.number ? 'number' : 'text'}
          defaultValue={field.value}
          aria-label={field.text}
        />
      </div>
    ))}
    <button onClick={closeModal}>Close</button>
    <button onClick={onSubmit}>Submit</button>
  </div>
));

const mockCloseModal = jest.fn();
const mockOnSubmit = jest.fn();

const mockDefaultValue = {
  name: 'IO Port 1',
  bus_width: 16,
  clock: 'Clock1',
  duty_cycle: 50,
  direction: 'Input',
  io_standard: 'LVDS',
  drive_strength: 'Medium',
  slew_rate: 'Fast',
  differential_termination: 'Yes',
  io_data_type: 'Signed',
  input_enable_rate: 1.5,
  output_enable_rate: 2.0,
  synchronization: 'Synchronous',
  toggle_rate: 0.5,
  io_pull_up_down: 'Pullup',
};

describe('IOModal Component', () => {
  beforeEach(() => {
    render(
      <IOModal
        closeModal={mockCloseModal}
        onSubmit={mockOnSubmit}
        defaultValue={mockDefaultValue}
        title="I/O Modal"
      />
    );
  });

  it('renders the modal with the correct title', () => {
    expect(screen.getByText('I/O Modal')).toBeInTheDocument();
  });

  it('displays the correct default values in the form fields', () => {
    expect(screen.getByLabelText('RTL Port Name')).toHaveValue('IO Port 1');
    expect(screen.getByLabelText('Bus width')).toHaveValue('16');  // Expect string value
    expect(screen.getByLabelText('Clock')).toHaveValue('Clock1');
    expect(screen.getByLabelText('Duty cycle')).toHaveValue('50');  // Expect string value
    expect(screen.getByLabelText('Direction')).toHaveValue('Input');
    expect(screen.getByLabelText('IO Standard')).toHaveValue('LVDS');
    expect(screen.getByLabelText('Drive Strength')).toHaveValue('Medium');
    expect(screen.getByLabelText('Slew Rate')).toHaveValue('Fast');
    expect(screen.getByLabelText('Differential Termination')).toHaveValue('Yes');
    expect(screen.getByLabelText('Data Type')).toHaveValue('Signed');
    expect(screen.getByLabelText('Input Enable Rate')).toHaveValue('1.5');  // Expect string value
    expect(screen.getByLabelText('Synchronization')).toHaveValue('Synchronous');
    expect(screen.getByLabelText('Toggle Rate')).toHaveValue('0.5');  // Expect string value
    expect(screen.getByLabelText('Pullup / Pulldown')).toHaveValue('Pullup');
  });

  it('calls closeModal when the Close button is clicked', () => {
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('calls onSubmit when the Submit button is clicked', () => {
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
