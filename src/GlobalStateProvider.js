import React, {
  createContext, useContext, useState, useMemo,
  useEffect,
} from 'react';
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
  const [socState, setSocState] = useState({});
  const [attributes, setAttributes] = useState([]);

  useEffect(() => {
    server.GET(server.attributes(), (attr) => setAttributes(attr));
  }, []);

  function fetchPort(device, link, port, key) {
    server.GET(server.peripheralPath(device, `${link}/${port.href}`), (data) => {
      const prev = socState;
      const { messages } = data.consumption;
      if (prev[key] !== undefined && prev[key].length > 0) prev[key] = [...prev[key], messages];
      else prev[key] = [messages];
      setSocState({ ...prev });
    });
  }

  function updatePeripherals(device, href, key) {
    server.GET(server.peripheralPath(device, href), (componentData) => {
      if (componentData.consumption !== undefined) {
        if (componentData.consumption.messages !== undefined) {
          const prev = socState;
          const { messages } = componentData.consumption;
          if (key === 'uart') {
            const index = `${key}${href.slice(-1)}`;
            if (prev[index] !== undefined && prev[index].length > 0) {
              prev[index] = [...prev[index], messages];
            } else {
              prev[index] = [messages];
            }
          } else if (prev[key] !== undefined && prev[key].length > 0) {
            prev[key] = [...prev[key], messages];
          } else {
            prev[key] = [messages];
          }
          setSocState({ ...prev });
        }
      }
      if (componentData.ports !== undefined) {
        componentData.ports.forEach((port) => fetchPort(device, href, port, key));
      }
    });
  }

  function updateGlobalState(device) {
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
      server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
        setSocState({});
        Object.entries(data).forEach((item) => {
          const [key, value] = item;
          value.forEach((i) => updatePeripherals(device, i.href, key));
        });
      });
    }
  }

  function GetOptions(id) {
    const found = attributes.find((elem) => id === elem.id);
    return (found === undefined) ? [] : found.options;
  }

  const values = useMemo(() => ({
    updateGlobalState,
    clockingState,
    fleState,
    bramState,
    dspState,
    ioState,
    socState,
    GetOptions,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [bramState, clockingState, dspState, fleState, ioState, socState]);

  return (
    <GlobalStateContext.Provider value={values}>
      {children}
    </GlobalStateContext.Provider>
  );
}
