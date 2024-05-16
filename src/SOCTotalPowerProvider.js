import React, {
  createContext, useContext, useState, useMemo,
} from 'react';
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
  const [totalConsumption, setTotalConsumption] = useState({
    total_power_temperature: [],
    processing_complex: {
      dynamic: {
        components: [],
        power: 0,
        percentage: 0,
      },
      static: {
        power: 0,
        percentage: 0,
      },
      total_power: 0,
      total_percentage: 0,
    },
    fpga_complex: {
      dynamic: {
        components: [],
        power: 0,
        percentage: 0,
      },
      static: {
        power: 0,
        percentage: 0,
      },
      total_power: 0,
      total_percentage: 0,
    },
  });

  const updateTotalPower = (device) => {
    if (device !== null) {
      server.GET(server.api.consumption('', device), (data) => {
        setTotalConsumption(data);
      });
    }
  };

  const values = useMemo(() => ({
    totalConsumption, updateTotalPower,
  }), [totalConsumption]);

  return (
    <SocTotalPowerContext.Provider value={values}>
      {children}
    </SocTotalPowerContext.Provider>
  );
}
