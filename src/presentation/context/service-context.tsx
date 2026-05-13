import React, { createContext, useContext } from 'react';
import type {
  AppServices,
  GateServices,
  ScoutServices,
  StationServices,
  TerminalServices,
} from '@app/services-contract';

export type {
  AppServices,
  GateServices,
  ScoutServices,
  StationServices,
  TerminalServices,
} from '@app/services-contract';

const ServiceContext = createContext<AppServices | null>(null);

export function ServiceProvider({
  services,
  children,
}: Readonly<{ services: AppServices; children: React.ReactNode }>) {
  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

function useServices(): AppServices {
  const ctx = useContext(ServiceContext);
  if (!ctx) {
    throw new Error('useServices must be used within ServiceProvider');
  }
  return ctx;
}

export function useStationServices(): StationServices {
  return useServices().station;
}

export function useGateServices(): GateServices {
  return useServices().gate;
}

export function useTerminalServices(): TerminalServices {
  return useServices().terminal;
}

export function useScoutServices(): ScoutServices {
  return useServices().scout;
}
