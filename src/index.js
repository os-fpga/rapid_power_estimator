import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SelectionProvider } from './SelectionProvider';
import { SocTotalPowerProvider } from './SOCTotalPowerProvider';
import { ClockSelectionProvider } from './ClockSelectionProvider';
import { GlobalStateProvider } from './GlobalStateProvider';
import * as server from './utils/serverAPI';

const root = createRoot(document.getElementById('app'));
root.render(
  <React.StrictMode>
    <GlobalStateProvider fetch={server.GET}>
      <ClockSelectionProvider>
        <SocTotalPowerProvider>
          <SelectionProvider>
            <App />
          </SelectionProvider>
        </SocTotalPowerProvider>
      </ClockSelectionProvider>
    </GlobalStateProvider>
  </React.StrictMode>,
);
