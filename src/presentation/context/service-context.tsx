import React, { createContext, useContext } from 'react';
import type { CheckNfcAvailabilityUseCase } from '../../application/use-cases/check-nfc-availability-use-case';
import type { RegisterMemberCardUseCase } from '../../application/use-cases/register-member-card.use-case';
import type { TopUpMemberCardUseCase } from '../../application/use-cases/top-up-member-card.use-case';
import type { GetStationLedgerSummaryUseCase } from '../../application/use-cases/get-station-ledger-summary.use-case';
import type { CheckInActivityUseCase } from '../../application/use-cases/check-in-activity.use-case';
import type { CheckOutActivityUseCase } from '../../application/use-cases/check-out-activity.use-case';
import type { InspectMemberCardUseCase } from '../../application/use-cases/inspect-member-card.use-case';

export type StationServices = {
  checkNfcAvailabilityUseCase: CheckNfcAvailabilityUseCase;
  registerMemberCardUseCase: RegisterMemberCardUseCase;
  topUpMemberCardUseCase: TopUpMemberCardUseCase;
  getStationLedgerSummaryUseCase: GetStationLedgerSummaryUseCase;
};

export type GateServices = {
  checkNfcAvailabilityUseCase: CheckNfcAvailabilityUseCase;
  checkInActivityUseCase: CheckInActivityUseCase;
};

export type TerminalServices = {
  checkNfcAvailabilityUseCase: CheckNfcAvailabilityUseCase;
  checkOutActivityUseCase: CheckOutActivityUseCase;
};

export type ScoutServices = {
  checkNfcAvailabilityUseCase: CheckNfcAvailabilityUseCase;
  inspectMemberCardUseCase: InspectMemberCardUseCase;
};

export type AppServices = {
  station: StationServices;
  gate: GateServices;
  terminal: TerminalServices;
  scout: ScoutServices;
};

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
