import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { State, ComponentLabel, AddButton, Checkbox, PercentSelector, Dropdown } from '../components/ComponentsLib';

describe('State Component', () => {
  it('renders correctly with error state', () => {
    const messages = [[{ type: 'error' }]];
    const { container } = render(<State messages={messages}>Error State</State>);
    expect(container.firstChild).toHaveClass('clickable error');
  });

  it('renders correctly with warning state', () => {
    const messages = [[{ type: 'warn' }]];
    const { container } = render(<State messages={messages}>Warning State</State>);
    expect(container.firstChild).toHaveClass('clickable warning');
  });

  it('renders correctly with normal state', () => {
    const { container } = render(<State>Normal State</State>);
    expect(container.firstChild).toHaveClass('clickable normal');
  });
});

describe('ComponentLabel', () => {
  it('renders the label correctly', () => {
    const { getByText } = render(<ComponentLabel name="Test Label" />);
    expect(getByText('FPGA')).toBeInTheDocument();
    expect(getByText('Test Label')).toBeInTheDocument();
  });
});

describe('AddButton', () => {
  it('renders and clicks the button', () => {
    const onClick = jest.fn();
    const { getByText } = render(<AddButton onClick={onClick} disabled={false} />);
    fireEvent.click(getByText('Add'));
    expect(onClick).toHaveBeenCalled();
  });

  it('button is disabled', () => {
    const onClick = jest.fn();
    const { getByText } = render(<AddButton onClick={onClick} disabled={true} />);
    expect(getByText('Add').closest('button')).toBeDisabled();
  });
});

describe('Checkbox', () => {
  it('toggles checkbox correctly', () => {
    const checkHandler = jest.fn();
    const { getByLabelText } = render(<Checkbox id="test-checkbox" isChecked={false} checkHandler={checkHandler} label="Test Checkbox" />);
    
    const checkbox = getByLabelText('Test Checkbox');
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkHandler).toHaveBeenCalled();
  });
});

describe('PercentSelector', () => {
  it('renders and selects percentage', () => {
    const setValue = jest.fn();
    const { getByDisplayValue } = render(<PercentSelector value={20} setValue={setValue} max={100} />);
    
    const select = getByDisplayValue('20 %');
    fireEvent.change(select, { target: { value: '30' } });
    expect(setValue).toHaveBeenCalledWith(30);
  });
});

describe('Dropdown', () => {
  it('renders dropdown and selects value', () => {
    const onChangeHandler = jest.fn();
    const items = [
      { id: 1, text: 'Option 1' },
      { id: 2, text: 'Option 2' }
    ];
    const { getByDisplayValue } = render(<Dropdown id="test-dropdown" value={1} onChangeHandler={onChangeHandler} items={items} />);
    
    const dropdown = getByDisplayValue('Option 1');
    fireEvent.change(dropdown, { target: { value: '2' } });
    expect(onChangeHandler).toHaveBeenCalledWith(2);
  });
});
