import type { CheckNfcAvailabilityUseCase } from '@application/use-cases/check-nfc-availability-use-case';
import type { RegisterMemberCardUseCase } from '@application/use-cases/register-member-card.use-case';
import type { TopUpMemberCardUseCase } from '@application/use-cases/top-up-member-card.use-case';
import type { GetStationLedgerSummaryUseCase } from '@application/use-cases/get-station-ledger-summary.use-case';
import type { CheckInActivityUseCase } from '@application/use-cases/check-in-activity.use-case';
import type { CheckOutActivityUseCase } from '@application/use-cases/check-out-activity.use-case';
import type { InspectMemberCardUseCase } from '@application/use-cases/inspect-member-card.use-case';

export type StationServices = {
  checkNfcAvailabilityUseCase: CheckNfcAvailabilityUseCase;
  registerMemberCardUseCase: RegisterMemberCardUseCase;
  topUpMemberCardUseCase: TopUpMemberCardUseCase;
  getStationLedgerSummaryUseCase: GetStationLedgerSummaryUseCase;
  cancelNfc: () => Promise<void>;
};

export type GateServices = {
  checkNfcAvailabilityUseCase: CheckNfcAvailabilityUseCase;
  checkInActivityUseCase: CheckInActivityUseCase;
  cancelNfc: () => Promise<void>;
};

export type TerminalServices = {
  checkNfcAvailabilityUseCase: CheckNfcAvailabilityUseCase;
  checkOutActivityUseCase: CheckOutActivityUseCase;
  cancelNfc: () => Promise<void>;
};

export type ScoutServices = {
  checkNfcAvailabilityUseCase: CheckNfcAvailabilityUseCase;
  inspectMemberCardUseCase: InspectMemberCardUseCase;
  cancelNfc: () => Promise<void>;
};

export type AppServices = {
  station: StationServices;
  gate: GateServices;
  terminal: TerminalServices;
  scout: ScoutServices;
};
