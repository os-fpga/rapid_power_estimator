import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SelectionProvider } from './SelectionProvider';
import { SocTotalPowerProvider } from './SOCTotalPowerProvider';

const root = createRoot(document.getElementById('app'));
root.render(
  <React.StrictMode>
    <SocTotalPowerProvider>
      <SelectionProvider>
        <App />
      </SelectionProvider>
    </SocTotalPowerProvider>
  </React.StrictMode>,
);
