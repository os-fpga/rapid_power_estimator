import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { SelectionProvider } from '../SelectionProvider';
import { SocTotalPowerProvider } from '../SOCTotalPowerProvider';
import { ClockSelectionProvider } from '../ClockSelectionProvider';
import { GlobalStateProvider } from '../GlobalStateProvider';

beforeAll(() => {
    window.ipcAPI = {
      send: jest.fn(), 
      ipcRendererOn: jest.fn(),  
    };
  });

describe('App component', () => {
  test('renders the App component with default content', () => {
    render(
      <GlobalStateProvider>
        <ClockSelectionProvider>
          <SocTotalPowerProvider>
            <SelectionProvider>
              <App />
            </SelectionProvider>
          </SocTotalPowerProvider>
        </ClockSelectionProvider>
      </GlobalStateProvider>
    );

    expect(screen.getByPlaceholderText('Top level name')).toBeInTheDocument();
    expect(screen.getByText('Auto save')).toBeInTheDocument();
    expect(screen.getByText('Auto Mode')).toBeInTheDocument();
  });
});
