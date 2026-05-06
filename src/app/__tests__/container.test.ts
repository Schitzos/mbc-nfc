import { appContainer } from '../container';
import type { MbcCard } from '../../domain/entities/mbc-card';

const mockOpen = jest.fn().mockReturnValue({
  execute: jest.fn(),
});

jest.mock('@op-engineering/op-sqlite', () => ({
  open: (...args: unknown[]) => mockOpen(...args),
}));

jest.mock('react-native-nfc-manager', () => ({
  __esModule: true,
  default: {
    isSupported: jest.fn(async () => true),
    isEnabled: jest.fn(async () => true),
    start: jest.fn(async () => undefined),
    registerTagEvent: jest.fn(async () => undefined),
    unregisterTagEvent: jest.fn(async () => undefined),
    getTag: jest.fn(async () => null),
  },
}));

const mockCard: MbcCard = {
  version: 1,
  cardId: 'CARD-001',
  member: { memberId: 'MEM-001' },
  balance: 1000,
  currency: 'IDR',
  visitStatus: 'NOT_CHECKED_IN',
  transactionLogs: [],
};

jest.mock('../../infrastructure/nfc/mock-mbc-card.repository', () => {
  class MockRepository {
    private scenario = 'normal';
    async isSupported() {
      return true;
    }
    async readCard() {
      return { ...mockCard };
    }
    async writeCard() {
      return undefined;
    }
    async cancel() {
      return undefined;
    }
    setScenario(next: string) {
      this.scenario = next;
    }
    getScenario() {
      return this.scenario;
    }
  }

  return { MockMbcCardRepository: MockRepository };
});

describe('appContainer', () => {
  it('reuses singleton repositories', () => {
    const mockA = appContainer.getMockCardRepository();
    const mockB = appContainer.getMockCardRepository();
    const nfcA = appContainer.getDeviceNfcStatusRepository();
    const nfcB = appContainer.getDeviceNfcStatusRepository();
    const ledgerA = appContainer.getSqliteLedgerRepository();
    const ledgerB = appContainer.getSqliteLedgerRepository();

    expect(mockA).toBe(mockB);
    expect(nfcA).toBe(nfcB);
    expect(ledgerA).toBe(ledgerB);
  });

  it('builds station, gate, terminal, and scout services', () => {
    const station = appContainer.getStationServices();
    const gate = appContainer.getGateServices();
    const terminal = appContainer.getTerminalServices();
    const scout = appContainer.getScoutServices();

    expect(station.registerMemberCardUseCase).toBeTruthy();
    expect(station.topUpMemberCardUseCase).toBeTruthy();
    expect(station.getStationLedgerSummaryUseCase).toBeTruthy();
    expect(gate.checkInActivityUseCase).toBeTruthy();
    expect(terminal.checkOutActivityUseCase).toBeTruthy();
    expect(scout.inspectMemberCardUseCase).toBeTruthy();
    expect(mockOpen).toHaveBeenCalledTimes(1);
  });
});
