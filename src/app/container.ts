import { open } from '@op-engineering/op-sqlite';
import { CheckNfcAvailabilityUseCase } from '@application/use-cases/check-nfc-availability-use-case';
import { CheckInActivityUseCase } from '@application/use-cases/check-in-activity.use-case';
import { CheckOutActivityUseCase } from '@application/use-cases/check-out-activity.use-case';
import { GetStationLedgerSummaryUseCase } from '@application/use-cases/get-station-ledger-summary.use-case';
import { InspectMemberCardUseCase } from '@application/use-cases/inspect-member-card.use-case';
import { RegisterMemberCardUseCase } from '@application/use-cases/register-member-card.use-case';
import { TopUpMemberCardUseCase } from '@application/use-cases/top-up-member-card.use-case';
import { SqliteLedgerRepository } from '@infrastructure/local-ledger/sqlite-ledger.repository';
import { DeviceNfcStatusRepository } from '@infrastructure/nfc/device-nfc-status.repository';
import { RealMbcCardRepository } from '@infrastructure/nfc/real-mbc-card.repository';
import type { AppServices } from '@presentation/context/service-context';

let cachedServices: AppServices | null = null;

export function createAppServices(): AppServices {
  if (cachedServices) {
    return cachedServices;
  }

  const db = open({ name: 'mbc-ledger.db', location: 'default' });
  const cardRepository = new RealMbcCardRepository();
  const nfcStatusRepository = new DeviceNfcStatusRepository();
  const ledgerRepository = new SqliteLedgerRepository(db);

  const cancelNfc = () => cardRepository.cancel();

  cachedServices = {
    station: {
      checkNfcAvailabilityUseCase: new CheckNfcAvailabilityUseCase(
        nfcStatusRepository,
      ),
      registerMemberCardUseCase: new RegisterMemberCardUseCase(
        cardRepository,
        ledgerRepository,
      ),
      topUpMemberCardUseCase: new TopUpMemberCardUseCase(
        cardRepository,
        ledgerRepository,
      ),
      getStationLedgerSummaryUseCase: new GetStationLedgerSummaryUseCase(
        ledgerRepository,
      ),
      cancelNfc,
    },
    gate: {
      checkNfcAvailabilityUseCase: new CheckNfcAvailabilityUseCase(
        nfcStatusRepository,
      ),
      checkInActivityUseCase: new CheckInActivityUseCase(cardRepository),
      cancelNfc,
    },
    terminal: {
      checkNfcAvailabilityUseCase: new CheckNfcAvailabilityUseCase(
        nfcStatusRepository,
      ),
      checkOutActivityUseCase: new CheckOutActivityUseCase(
        cardRepository,
        ledgerRepository,
      ),
      cancelNfc,
    },
    scout: {
      checkNfcAvailabilityUseCase: new CheckNfcAvailabilityUseCase(
        nfcStatusRepository,
      ),
      inspectMemberCardUseCase: new InspectMemberCardUseCase(cardRepository),
      cancelNfc,
    },
  };

  return cachedServices;
}
