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
  const defaultValue = {
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
  };
  const [totalConsumption, setTotalConsumption] = useState(defaultValue);

  const updateTotalPower = (device) => {
    if (device !== '') {
      server.GET(server.api.consumption('', device), (data) => {
        setTotalConsumption(data);
      });
    } else {
      setTotalConsumption(defaultValue);
    }
  };

  const values = useMemo(() => ({
    totalConsumption, updateTotalPower,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [totalConsumption]);

  return (
    <SocTotalPowerContext.Provider value={values}>
      {children}
    </SocTotalPowerContext.Provider>
  );
}
