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

const PeripheralTarget = {
  ACPU: 1,
  BCPU: 2,
  FABRIC: 4,
};

function isTarget(targets, target) {
  // eslint-disable-next-line no-bitwise
  return (targets & target) === target;
}

export function GlobalStateProvider({ children, fetch }) { // TODO temp fix for unit tests
  const [clockingState, setClockingState] = useState([]);
  const [fleState, setFleState] = useState([]);
  const [bramState, setBramState] = useState([]);
  const [dspState, setDspState] = useState([]);
  const [ioState, setIoState] = useState([]);
  const [socState, setSocState] = useState({});
  const [attributes, setAttributes] = useState([]);
  const [peripherals, setPeripherals] = useState([]);
  const [acpuNames, setAcpuNames] = useState([]);
  const [bcpuNames, setBcpuNames] = useState([]);
  const [connectivityNames, setConnectivityNames] = useState([]);

  let peripheralsMessages = {};
  const acpuNamesLocal = [];
  const bcpuNamesLocal = [];
  const connectivityNamesLocal = [];

  useEffect(() => {
    fetch(server.attributes(), (attr) => setAttributes(attr));
  }, [fetch]);

  function fetchPort(device, link, port, key) {
    server.GET(server.peripheralPath(device, `${link}/${port.href}`), (data) => {
      const prev = peripheralsMessages;
      const { messages } = data.consumption;
      if (prev[key] !== undefined && prev[key].length > 0) prev[key] = [...prev[key], messages];
      else prev[key] = [messages];
      peripheralsMessages = { ...prev };
      setSocState(peripheralsMessages);
    });
  }

  function updatePeripherals(device, href, key) {
    server.GET(server.peripheralPath(device, href), (componentData) => {
      if (componentData.consumption !== undefined) {
        if (componentData.consumption.messages !== undefined) {
          const prev = peripheralsMessages;
          const { messages } = componentData.consumption;
          if (key === 'uart') {
            const { index } = componentData;
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
          peripheralsMessages = { ...prev };
          setSocState(peripheralsMessages);
        }
      }
      if (componentData.ports !== undefined) {
        componentData.ports.forEach((port) => fetchPort(device, href, port, key));
      }
      if (componentData.targets !== undefined) {
        const { targets } = componentData;
        if (isTarget(targets, PeripheralTarget.ACPU)) {
          acpuNamesLocal.push({ id: acpuNamesLocal.length, text: componentData.name });
          setAcpuNames(acpuNamesLocal);
        }
        if (isTarget(targets, PeripheralTarget.BCPU)) {
          bcpuNamesLocal.push({ id: bcpuNamesLocal.length, text: componentData.name });
          setBcpuNames(bcpuNamesLocal);
        }
        if (isTarget(targets, PeripheralTarget.FABRIC)) {
          connectivityNamesLocal.push({
            id: connectivityNamesLocal.length,
            text: componentData.name,
          });
          setConnectivityNames(connectivityNamesLocal);
        }
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
        setPeripherals(data);
        data.forEach((item) => {
          updatePeripherals(device, item.href, item.type);
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
    peripherals,
    acpuNames,
    bcpuNames,
    connectivityNames,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [bramState, clockingState, dspState, fleState, ioState, socState]);

  return (
    <GlobalStateContext.Provider value={values}>
      {children}
    </GlobalStateContext.Provider>
  );
}
