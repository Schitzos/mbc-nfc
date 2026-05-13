import { open } from '@op-engineering/op-sqlite';
import { createCheckNfcAvailabilityUseCase } from '@application/use-cases/check-nfc-availability-use-case';
import { createCheckInActivityUseCase } from '@application/use-cases/check-in-activity.use-case';
import { createCheckOutActivityUseCase } from '@application/use-cases/check-out-activity.use-case';
import { createGetStationLedgerSummaryUseCase } from '@application/use-cases/get-station-ledger-summary.use-case';
import { createInspectMemberCardUseCase } from '@application/use-cases/inspect-member-card.use-case';
import { createRegisterMemberCardUseCase } from '@application/use-cases/register-member-card.use-case';
import { createTopUpMemberCardUseCase } from '@application/use-cases/top-up-member-card.use-case';
import { createSqliteLedgerRepository } from '@infrastructure/local-ledger/sqlite-ledger.repository';
import { createDeviceNfcStatusRepository } from '@infrastructure/nfc/device-nfc-status.repository';
import { createRealMbcCardRepository } from '@infrastructure/nfc/real-mbc-card.repository';
import type { AppServices } from '@app/services-contract';

let cachedServices: AppServices | null = null;

export function createAppServices(): AppServices {
  if (cachedServices) {
    return cachedServices;
  }

  const db = open({ name: 'mbc-ledger.db', location: 'default' });
  const cardRepository = createRealMbcCardRepository();
  const nfcStatusRepository = createDeviceNfcStatusRepository();
  const ledgerRepository = createSqliteLedgerRepository(db);

  const cancelNfc = () => cardRepository.cancel();

  cachedServices = {
    station: {
      checkNfcAvailabilityUseCase:
        createCheckNfcAvailabilityUseCase(nfcStatusRepository),
      registerMemberCardUseCase: createRegisterMemberCardUseCase(
        cardRepository,
        ledgerRepository,
      ),
      topUpMemberCardUseCase: createTopUpMemberCardUseCase(
        cardRepository,
        ledgerRepository,
      ),
      getStationLedgerSummaryUseCase:
        createGetStationLedgerSummaryUseCase(ledgerRepository),
      cancelNfc,
    },
    gate: {
      checkNfcAvailabilityUseCase:
        createCheckNfcAvailabilityUseCase(nfcStatusRepository),
      checkInActivityUseCase: createCheckInActivityUseCase(cardRepository),
      cancelNfc,
    },
    terminal: {
      checkNfcAvailabilityUseCase:
        createCheckNfcAvailabilityUseCase(nfcStatusRepository),
      checkOutActivityUseCase: createCheckOutActivityUseCase(
        cardRepository,
        ledgerRepository,
      ),
      cancelNfc,
    },
    scout: {
      checkNfcAvailabilityUseCase:
        createCheckNfcAvailabilityUseCase(nfcStatusRepository),
      inspectMemberCardUseCase: createInspectMemberCardUseCase(cardRepository),
      cancelNfc,
    },
  };

  return cachedServices;
}
