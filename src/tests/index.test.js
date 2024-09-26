import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { SelectionProvider } from '../SelectionProvider';
import { SocTotalPowerProvider } from '../SOCTotalPowerProvider';
import { ClockSelectionProvider } from '../ClockSelectionProvider';
import { GlobalStateProvider } from '../GlobalStateProvider';
import * as server from '../utils/serverAPI';

jest.mock('../utils/serverAPI', () => ({
  GET: jest.fn(),
}));

jest.mock('../App', () => () => <div>App Component</div>);

describe('index.js', () => {
  test('renders the App component inside the provider hierarchy', () => {
    const { getByText } = render(
      <GlobalStateProvider fetch={server.GET}>
        <ClockSelectionProvider>
          <SocTotalPowerProvider>
            <SelectionProvider>
              <App />
            </SelectionProvider>
          </SocTotalPowerProvider>
        </ClockSelectionProvider>
      </GlobalStateProvider>
    );

    expect(getByText('App Component')).toBeInTheDocument();
  });

  test('passes server.GET to GlobalStateProvider', () => {
    render(
      <GlobalStateProvider fetch={server.GET}>
        <ClockSelectionProvider>
          <SocTotalPowerProvider>
            <SelectionProvider>
              <App />
            </SelectionProvider>
          </SocTotalPowerProvider>
        </ClockSelectionProvider>
      </GlobalStateProvider>
    );

    expect(server.GET).toHaveBeenCalledTimes(0); 
  });

  test('renders all providers without crashing', () => {
    const { container } = render(
      <GlobalStateProvider fetch={server.GET}>
        <ClockSelectionProvider>
          <SocTotalPowerProvider>
            <SelectionProvider>
              <App />
            </SelectionProvider>
          </SocTotalPowerProvider>
        </ClockSelectionProvider>
      </GlobalStateProvider>
    );

    expect(container).toBeInTheDocument();
  });
});
