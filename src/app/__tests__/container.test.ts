import { createAppServices } from '@app/container';

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

describe('createAppServices', () => {
  it('builds station, gate, terminal, and scout services', () => {
    const services = createAppServices();

    expect(services.station.registerMemberCardUseCase).toBeTruthy();
    expect(services.station.topUpMemberCardUseCase).toBeTruthy();
    expect(services.station.getStationLedgerSummaryUseCase).toBeTruthy();
    expect(services.station.checkNfcAvailabilityUseCase).toBeTruthy();
    expect(services.gate.checkInActivityUseCase).toBeTruthy();
    expect(services.gate.checkNfcAvailabilityUseCase).toBeTruthy();
    expect(services.terminal.checkOutActivityUseCase).toBeTruthy();
    expect(services.terminal.checkNfcAvailabilityUseCase).toBeTruthy();
    expect(services.scout.inspectMemberCardUseCase).toBeTruthy();
    expect(services.scout.checkNfcAvailabilityUseCase).toBeTruthy();
    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  it('returns cached singleton instances on subsequent calls', () => {
    const first = createAppServices();
    const second = createAppServices();

    expect(first.station.registerMemberCardUseCase).toBe(
      second.station.registerMemberCardUseCase,
    );
    expect(mockOpen).toHaveBeenCalledTimes(1);
  });
});
