import { open } from '@op-engineering/op-sqlite';
import { CheckNfcAvailabilityUseCase } from '../application/use-cases/check-nfc-availability-use-case';
import { CheckInActivityUseCase } from '../application/use-cases/check-in-activity.use-case';
import { GetStationLedgerSummaryUseCase } from '../application/use-cases/get-station-ledger-summary.use-case';
import { RegisterMemberCardUseCase } from '../application/use-cases/register-member-card.use-case';
import { TopUpMemberCardUseCase } from '../application/use-cases/top-up-member-card.use-case';
import { SqliteLedgerRepository } from '../infrastructure/local-ledger/sqlite-ledger.repository';
import { DeviceNfcStatusRepository } from '../infrastructure/nfc/device-nfc-status.repository';
import { MockMbcCardRepository } from '../infrastructure/nfc/mock-mbc-card.repository';

let mockCardRepository: MockMbcCardRepository | null = null;
let deviceNfcStatusRepository: DeviceNfcStatusRepository | null = null;
let sqliteLedgerRepository: SqliteLedgerRepository | null = null;

function createLedgerConnection() {
  return open({
    name: 'mbc-ledger.db',
    location: 'default',
  });
}

function getMockCardRepository() {
  if (!mockCardRepository) {
    mockCardRepository = new MockMbcCardRepository();
  }

  return mockCardRepository;
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
  getMockCardRepository,
  getDeviceNfcStatusRepository,
  getSqliteLedgerRepository,
  getStationServices() {
    const mockRepository = getMockCardRepository();
    const ledgerRepository = getSqliteLedgerRepository();

    return {
      checkNfcAvailabilityUseCase: new CheckNfcAvailabilityUseCase(
        getDeviceNfcStatusRepository(),
      ),
      registerMemberCardUseCase: new RegisterMemberCardUseCase(
        mockRepository,
        ledgerRepository,
      ),
      topUpMemberCardUseCase: new TopUpMemberCardUseCase(
        mockRepository,
        ledgerRepository,
      ),
      getStationLedgerSummaryUseCase: new GetStationLedgerSummaryUseCase(
        ledgerRepository,
      ),
      mockRepository,
    };
  },
  getGateServices() {
    const mockRepository = getMockCardRepository();

    return {
      checkNfcAvailabilityUseCase: new CheckNfcAvailabilityUseCase(
        getDeviceNfcStatusRepository(),
      ),
      checkInActivityUseCase: new CheckInActivityUseCase(mockRepository),
      mockRepository,
    };
  },
};
