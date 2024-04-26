import React, {
  createContext, useContext, useState, useMemo,
  useCallback,
} from 'react';

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

  const defaultClock = useCallback(() => clocks.find(() => true) ?? '', [clocks]);

  const values = useMemo(() => ({ clocks, setClocks, defaultClock }), [clocks, defaultClock]);
  return (
    <ClockSelectionContext.Provider value={values}>
      {children}
    </ClockSelectionContext.Provider>
  );
}
