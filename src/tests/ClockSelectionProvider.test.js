import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClockSelectionProvider, useClockSelection } from '../ClockSelectionProvider';

const TestComponent = () => {
  const { clocks, setClocks, defaultClock } = useClockSelection();

  return (
    <div>
      <div data-testid="default-clock">{defaultClock()}</div>
      <button
        onClick={() => setClocks(['Clock 1', 'Clock 2'])}
        data-testid="set-clocks"
      >
        Set Clocks
      </button>
      <button
        onClick={() => setClocks([])}
        data-testid="clear-clocks"
      >
        Clear Clocks
      </button>
      <div data-testid="clocks">{clocks.join(', ')}</div>
    </div>
  );
};

describe('ClockSelectionProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders provider and provides default context values', () => {
    render(
      <ClockSelectionProvider>
        <TestComponent />
      </ClockSelectionProvider>
    );

    expect(screen.getByTestId('default-clock')).toHaveTextContent('');
    expect(screen.getByTestId('clocks')).toHaveTextContent('');
  });

  test('sets clocks and updates default clock correctly', async () => {
    render(
      <ClockSelectionProvider>
        <TestComponent />
      </ClockSelectionProvider>
    );

    const setClocksButton = screen.getByTestId('set-clocks');

    await act(async () => {
      setClocksButton.click();
    });

    expect(screen.getByTestId('clocks')).toHaveTextContent('Clock 1, Clock 2');
    expect(screen.getByTestId('default-clock')).toHaveTextContent('Clock 1');
  });

  test('defaultClock returns an empty string if no clocks are set', () => {
    render(
      <ClockSelectionProvider>
        <TestComponent />
      </ClockSelectionProvider>
    );

    expect(screen.getByTestId('default-clock')).toHaveTextContent('');
  });

  test('clears clocks and sets default clock to empty', async () => {
    render(
      <ClockSelectionProvider>
        <TestComponent />
      </ClockSelectionProvider>
    );

    const setClocksButton = screen.getByTestId('set-clocks');
    const clearClocksButton = screen.getByTestId('clear-clocks');

    await act(async () => {
      setClocksButton.click();
    });

    await act(async () => {
      clearClocksButton.click();
    });

    expect(screen.getByTestId('clocks')).toHaveTextContent('');
    expect(screen.getByTestId('default-clock')).toHaveTextContent('');
  });

  test('sets a single clock and updates default clock', async () => {
    render(
      <ClockSelectionProvider>
        <TestComponent />
      </ClockSelectionProvider>
    );

    const setClocksButton = screen.getByTestId('set-clocks');

    await act(async () => {
      setClocksButton.click();
    });

    expect(screen.getByTestId('default-clock')).toHaveTextContent('Clock 1');
  });

  test('defaultClock remains empty after clearing clocks', async () => {
    render(
      <ClockSelectionProvider>
        <TestComponent />
      </ClockSelectionProvider>
    );

    const setClocksButton = screen.getByTestId('set-clocks');
    const clearClocksButton = screen.getByTestId('clear-clocks');

    await act(async () => {
      setClocksButton.click();
    });

    await act(async () => {
      clearClocksButton.click();
    });

    expect(screen.getByTestId('default-clock')).toHaveTextContent('');
  });

  test('multiple clock sets updates clocks correctly', async () => {
    render(
      <ClockSelectionProvider>
        <TestComponent />
      </ClockSelectionProvider>
    );

    const setClocksButton = screen.getByTestId('set-clocks');

    await act(async () => {
      setClocksButton.click();
    });
    await act(async () => {
      setClocksButton.click();
    });

    expect(screen.getByTestId('clocks')).toHaveTextContent('Clock 1, Clock 2');
  });

  test('defaultClock returns the first clock in the array', async () => {
    render(
      <ClockSelectionProvider>
        <TestComponent />
      </ClockSelectionProvider>
    );

    const setClocksButton = screen.getByTestId('set-clocks');

    await act(async () => {
      setClocksButton.click();
    });

    expect(screen.getByTestId('default-clock')).toHaveTextContent('Clock 1');
  });
});
