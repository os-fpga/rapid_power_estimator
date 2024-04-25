import React, { createContext, useContext, useState } from 'react';
import * as server from './utils/serverAPI';

const GlobalStateContext = createContext();

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a SocTotalPowerProvider');
  }
  return context;
};

export function GlobalStateProvider({ children }) {
  const [clockingState, setClockingState] = useState([]);
  const [fleState, setFleState] = useState([]);
  const [bramState, setBramState] = useState([]);
  const [dspState, setDspState] = useState([]);
  const [ioState, setIoState] = useState([]);

  const updateGlobalState = (device) => {
    if (device !== null) {
      server.GET(server.api.fetch(server.Elem.clocking, device), (data) => {
        setClockingState(data.map((item) => item.consumption.messages));
      });
      server.GET(server.api.fetch(server.Elem.fle, device), (data) => {
        setFleState(data.map((item) => item.consumption.messages));
      });
      server.GET(server.api.fetch(server.Elem.bram, device), (data) => {
        setBramState(data.map((item) => item.consumption.messages));
      });
      server.GET(server.api.fetch(server.Elem.dsp, device), (data) => {
        setDspState(data.map((item) => item.consumption.messages));
      });
      server.GET(server.api.fetch(server.Elem.io, device), (data) => {
        setIoState(data.map((item) => item.consumption.messages));
      });
    }
  };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <GlobalStateContext.Provider value={{
      updateGlobalState,
      clockingState,
      fleState,
      bramState,
      dspState,
      ioState,
    }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
}
