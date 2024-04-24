import React, { createContext, useContext, useState } from 'react';
import * as server from './utils/serverAPI';

const SocTotalPowerContext = createContext();

export const useSocTotalPower = () => {
  const context = useContext(SocTotalPowerContext);
  if (!context) {
    throw new Error('useSocTotalPower must be used within a SocTotalPowerProvider');
  }
  return context;
};

export function SocTotalPowerProvider({ children }) {
  const [dynamicPower, setDynamicPower] = useState(0);
  const [staticPower, setStaticPower] = useState(0);
  const [power, setPower] = useState({
    total_memory_power: 0,
    total_peripherals_power: 0,
    total_acpu_power: 0,
    total_dma_power: 0,
    total_noc_interconnect_power: 0,
    total_bcpu_power: 0,
    total_soc_io_available: 0,
    total_soc_io_used: 0,
  });
  const [thermalData, setThermalData] = React.useState({
    typical: {
      total_power: 0,
      thermal: 0,
    },
    worsecase: {
      total_power: 0,
      thermal: 0,
    },
  });

  const updateTotalPower = (device) => {
    if (device !== null) {
      server.GET(server.api.consumption(server.Elem.peripherals, device), (data) => {
        setPower(data);
        setDynamicPower(data.total_acpu_power
            + data.total_bcpu_power
            + data.total_peripherals_power
            + data.total_dma_power
            + data.total_noc_interconnect_power
            + data.total_memory_power);
      });
      server.GET(server.api.consumption('', device), (data) => {
        setThermalData(data);
      });
      // todo, pending for backend implementation
      setStaticPower(0);
    }
  };

  const calcPercents = (totalPower) => {
    if (thermalData.worsecase.total_power === 0) return 0;
    return (totalPower / thermalData.worsecase.total_power) * 100;
  };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <SocTotalPowerContext.Provider value={{
      power, dynamicPower, staticPower, thermalData, updateTotalPower, calcPercents,
    }}
    >
      {children}
    </SocTotalPowerContext.Provider>
  );
}
