import { appContainer } from '../container';
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

jest.mock('react-native-quick-crypto', () => ({
  __esModule: true,
  default: {
    randomBytes: (size: number) => Buffer.alloc(size),
    createCipheriv: jest.fn(),
    createDecipheriv: jest.fn(),
  },
}));

describe('appContainer', () => {
  it('reuses singleton repositories', () => {
    const realA = appContainer.getRealMbcCardRepository();
    const realB = appContainer.getRealMbcCardRepository();
    const nfcA = appContainer.getDeviceNfcStatusRepository();
    const nfcB = appContainer.getDeviceNfcStatusRepository();
    const ledgerA = appContainer.getSqliteLedgerRepository();
    const ledgerB = appContainer.getSqliteLedgerRepository();

    expect(realA).toBe(realB);
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
