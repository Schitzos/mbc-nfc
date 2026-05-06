import { open } from '@op-engineering/op-sqlite';
import { CheckNfcAvailabilityUseCase } from '../application/use-cases/check-nfc-availability-use-case';
import { CheckInActivityUseCase } from '../application/use-cases/check-in-activity.use-case';
import { CheckOutActivityUseCase } from '../application/use-cases/check-out-activity.use-case';
import { GetStationLedgerSummaryUseCase } from '../application/use-cases/get-station-ledger-summary.use-case';
import { InspectMemberCardUseCase } from '../application/use-cases/inspect-member-card.use-case';
import { RegisterMemberCardUseCase } from '../application/use-cases/register-member-card.use-case';
import { TopUpMemberCardUseCase } from '../application/use-cases/top-up-member-card.use-case';
import { SqliteLedgerRepository } from '../infrastructure/local-ledger/sqlite-ledger.repository';
import { DeviceNfcStatusRepository } from '../infrastructure/nfc/device-nfc-status.repository';
import { RealMbcCardRepository } from '../infrastructure/nfc/real-mbc-card.repository';

let realMbcCardRepository: RealMbcCardRepository | null = null;
let deviceNfcStatusRepository: DeviceNfcStatusRepository | null = null;
let sqliteLedgerRepository: SqliteLedgerRepository | null = null;

function createLedgerConnection() {
  return open({
    name: 'mbc-ledger.db',
    location: 'default',
  });
}

function getRealMbcCardRepository() {
  if (!realMbcCardRepository) {
    realMbcCardRepository = new RealMbcCardRepository();
  }

  return realMbcCardRepository;
}

function getDeviceNfcStatusRepository() {
  if (!deviceNfcStatusRepository) {
    deviceNfcStatusRepository = new DeviceNfcStatusRepository();
  }

  return deviceNfcStatusRepository;
}

function getSqliteLedgerRepository() {
  if (!sqliteLedgerRepository) {
    sqliteLedgerRepository = new SqliteLedgerRepository(
      createLedgerConnection(),
    );
  }

  return sqliteLedgerRepository;
}

export const appContainer = {
  getRealMbcCardRepository,
  getDeviceNfcStatusRepository,
  getSqliteLedgerRepository,
  getStationServices() {
    const cardRepository = getRealMbcCardRepository();
    const ledgerRepository = getSqliteLedgerRepository();

    return {
      checkNfcAvailabilityUseCase: new CheckNfcAvailabilityUseCase(
        getDeviceNfcStatusRepository(),
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
    };
  },
  getGateServices() {
    const cardRepository = getRealMbcCardRepository();

    return {
      checkNfcAvailabilityUseCase: new CheckNfcAvailabilityUseCase(
        getDeviceNfcStatusRepository(),
      ),
      checkInActivityUseCase: new CheckInActivityUseCase(cardRepository),
    };
  },
  getScoutServices() {
    const cardRepository = getRealMbcCardRepository();

    return {
      checkNfcAvailabilityUseCase: new CheckNfcAvailabilityUseCase(
        getDeviceNfcStatusRepository(),
      ),
      inspectMemberCardUseCase: new InspectMemberCardUseCase(cardRepository),
    };
  },
  getTerminalServices() {
    const cardRepository = getRealMbcCardRepository();
    const ledgerRepository = getSqliteLedgerRepository();

    return {
      checkNfcAvailabilityUseCase: new CheckNfcAvailabilityUseCase(
        getDeviceNfcStatusRepository(),
      ),
      checkOutActivityUseCase: new CheckOutActivityUseCase(
        cardRepository,
        ledgerRepository,
      ),
    };
  },
};
