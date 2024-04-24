import React, { createContext, useContext, useState } from 'react';

const ClockSelectionContext = createContext();

export const useClockSelection = () => {
  const context = useContext(ClockSelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a ClockSelectionProvider');
  }
  return context;
};

export function ClockSelectionProvider({ children }) {
  const [clocks, setClocks] = useState([]);

  const defaultClock = () => clocks.find(() => true) ?? '';

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <ClockSelectionContext.Provider value={{ clocks, setClocks, defaultClock }}>
      {children}
    </ClockSelectionContext.Provider>
  );
}
