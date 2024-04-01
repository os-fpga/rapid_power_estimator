import React, { createContext, useContext, useState } from 'react';

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

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <SelectionContext.Provider value={{ selectedItem, toggleItemSelection, clearSelection }}>
      {children}
    </SelectionContext.Provider>
  );
}
