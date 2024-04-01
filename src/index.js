import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SelectionProvider } from './SelectionProvider';

const root = createRoot(document.getElementById('app'));
root.render(
  <React.StrictMode>
    <SelectionProvider>
      <App />
    </SelectionProvider>
  </React.StrictMode>,
);
