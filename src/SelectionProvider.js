import React, {
  createContext, useContext, useState, useMemo,
} from 'react';

const SelectionContext = createContext();

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};

export function SelectionProvider({ children }) {
  const [selectedItem, setSelectedItem] = useState('Clocking');

  const toggleItemSelection = (item) => {
    setSelectedItem(item);
  };

  const clearSelection = () => {
    setSelectedItem('');
  };

  const values = useMemo(() => ({
    selectedItem, toggleItemSelection, clearSelection,
  }), [selectedItem]);

  return (
    <SelectionContext.Provider value={values}>
      {children}
    </SelectionContext.Provider>
  );
}
