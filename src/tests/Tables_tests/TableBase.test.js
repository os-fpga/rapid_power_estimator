import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Actions, EnableState, StatusColumn, TableBase } from  '../../components/Tables/TableBase';

jest.mock('../../components/ComponentsLib', () => ({
  Checkbox: ({ isChecked, checkHandler }) => (
    <input
      type="checkbox"
      checked={isChecked}
      onChange={checkHandler}
      data-testid="checkbox"
    />
  ),
  AddButton: ({ disabled, onClick }) => (
    <button disabled={disabled} onClick={onClick} data-testid="add-button">Add</button>
  ),
}));

describe('Actions Component', () => {
  test('renders edit and delete buttons and triggers click events', () => {
    const onEditClick = jest.fn();
    const onDeleteClick = jest.fn();

    const { container } = render(<Actions onEditClick={onEditClick} onDeleteClick={onDeleteClick} />);

    const editButton = container.querySelector('.edit');
    const deleteButton = container.querySelector('.delete');

    fireEvent.click(editButton);
    fireEvent.click(deleteButton);

    expect(onEditClick).toHaveBeenCalledTimes(1);
    expect(onDeleteClick).toHaveBeenCalledTimes(1);
  });
});

describe('EnableState Component', () => {
  test('renders checkbox with correct state and triggers change event', () => {
    const checkHandler = jest.fn();

    render(<EnableState isChecked={true} checkHandler={checkHandler} />);

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);
    expect(checkHandler).toHaveBeenCalledTimes(1);
  });
});

describe('StatusColumn Component', () => {
  test('renders "done" icon when there are no messages', () => {
    const { container } = render(<StatusColumn messages={[]} />);

    const doneIcon = container.querySelector('svg');
    expect(doneIcon).toBeInTheDocument();

    const checkmarkPath = doneIcon.querySelectorAll('path')[1];
    expect(checkmarkPath.getAttribute('d')).toBe('M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z');
  });
});

describe('TableBase Component', () => {
  test('renders table with headers and calls onClick when AddButton is clicked', () => {
    const onClick = jest.fn();
    const headers = ['Header 1', 'Header 2'];

    render(<TableBase header={headers} onClick={onClick} hideAddBtn={false} disabled={false} />);

    const header1 = screen.getByText(/Header 1/i);
    const header2 = screen.getByText(/Header 2/i);
    const addButton = screen.getByTestId('add-button');

    expect(header1).toBeInTheDocument();
    expect(header2).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('does not render "Add" button when hideAddBtn is true', () => {
    const onClick = jest.fn();
    const headers = ['Header 1', 'Header 2'];

    render(<TableBase header={headers} onClick={onClick} hideAddBtn={true} disabled={false} />);

    const addButton = screen.queryByTestId('add-button');
    expect(addButton).not.toBeInTheDocument();
  });
});
