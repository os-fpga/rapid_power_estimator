import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SelectionProvider } from './SelectionProvider';
import { SocTotalPowerProvider } from './SOCTotalPowerProvider';
import { ClockSelectionProvider } from './ClockSelectionProvider';

const root = createRoot(document.getElementById('app'));
root.render(
  <React.StrictMode>
    <ClockSelectionProvider>
      <SocTotalPowerProvider>
        <SelectionProvider>
          <App />
        </SelectionProvider>
      </SocTotalPowerProvider>
    </ClockSelectionProvider>
  </React.StrictMode>,
);
