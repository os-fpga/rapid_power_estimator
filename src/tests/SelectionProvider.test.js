import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { SelectionProvider, useSelection } from '../SelectionProvider';
import '@testing-library/jest-dom';

const TestComponent = () => {
  const { selectedItem, toggleItemSelection, clearSelection } = useSelection();

  return (
    <div>
      <div data-testid="selected-item">{selectedItem}</div>
      <button onClick={() => toggleItemSelection('Memory')}>Select Memory</button>
      <button onClick={() => toggleItemSelection('CPU')}>Select CPU</button>
      <button onClick={() => toggleItemSelection('Peripherals')}>Select Peripherals</button>
      <button onClick={() => clearSelection()}>Clear Selection</button>
    </div>
  );
};

describe('SelectionProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders provider with default context value', () => {
    render(
      <SelectionProvider>
        <TestComponent />
      </SelectionProvider>
    );

    expect(screen.getByTestId('selected-item')).toHaveTextContent('Clocking');
  });

  test('toggles item selection correctly', async () => {
    render(
      <SelectionProvider>
        <TestComponent />
      </SelectionProvider>
    );

    const selectMemoryButton = screen.getByText(/select memory/i);

    await act(async () => {
      selectMemoryButton.click();
    });

    expect(screen.getByTestId('selected-item')).toHaveTextContent('Memory');
  });

  test('clears selection correctly', async () => {
    render(
      <SelectionProvider>
        <TestComponent />
      </SelectionProvider>
    );

    const selectMemoryButton = screen.getByText(/select memory/i);
    const clearButton = screen.getByText(/clear selection/i);

    await act(async () => {
      selectMemoryButton.click();
    });

    expect(screen.getByTestId('selected-item')).toHaveTextContent('Memory');

    await act(async () => {
      clearButton.click();
    });

    expect(screen.getByTestId('selected-item')).toHaveTextContent('');
  });

  test('toggles item selection to a new item (CPU) correctly', async () => {
    render(
      <SelectionProvider>
        <TestComponent />
      </SelectionProvider>
    );

    const selectCPUButton = screen.getByText(/select cpu/i);

    await act(async () => {
      selectCPUButton.click();
    });

    expect(screen.getByTestId('selected-item')).toHaveTextContent('CPU');
  });

  test('toggleItemSelection is called with correct argument', async () => {
    render(
      <SelectionProvider>
        <TestComponent />
      </SelectionProvider>
    );

    const selectMemoryButton = screen.getByText(/select memory/i);

    await act(async () => {
      selectMemoryButton.click();
    });

    expect(screen.getByTestId('selected-item')).toHaveTextContent('Memory');
  });

  test('clears selection after multiple selections', async () => {
    render(
      <SelectionProvider>
        <TestComponent />
      </SelectionProvider>
    );

    const selectMemoryButton = screen.getByText(/select memory/i);
    const selectCPUButton = screen.getByText(/select cpu/i);
    const clearButton = screen.getByText(/clear selection/i);

    await act(async () => {
      selectMemoryButton.click();
    });

    expect(screen.getByTestId('selected-item')).toHaveTextContent('Memory');

    await act(async () => {
      selectCPUButton.click();
    });

    expect(screen.getByTestId('selected-item')).toHaveTextContent('CPU');

    await act(async () => {
      clearButton.click();
    });

    expect(screen.getByTestId('selected-item')).toHaveTextContent('');
  });

  test('handles consecutive item changes correctly', async () => {
    render(
      <SelectionProvider>
        <TestComponent />
      </SelectionProvider>
    );

    const selectMemoryButton = screen.getByText(/select memory/i);
    const selectCPUButton = screen.getByText(/select cpu/i);

    await act(async () => {
      selectMemoryButton.click();
    });

    expect(screen.getByTestId('selected-item')).toHaveTextContent('Memory');

    await act(async () => {
      selectCPUButton.click();
    });

    expect(screen.getByTestId('selected-item')).toHaveTextContent('CPU');
  });

  // Additional Test: toggleItemSelection handles arbitrary item ('Peripherals')
  test('toggles item selection to an arbitrary item (Peripherals) correctly', async () => {
    render(
      <SelectionProvider>
        <TestComponent />
      </SelectionProvider>
    );

    const selectPeripheralsButton = screen.getByText(/select peripherals/i);

    await act(async () => {
      selectPeripheralsButton.click();
    });

    expect(screen.getByTestId('selected-item')).toHaveTextContent('Peripherals');
  });
});
