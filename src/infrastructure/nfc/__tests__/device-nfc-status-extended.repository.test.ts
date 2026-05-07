import NfcManager from 'react-native-nfc-manager';
import { DeviceNfcStatusRepository } from '@infrastructure/nfc/device-nfc-status.repository';

jest.mock('react-native-nfc-manager', () => ({
  start: jest.fn().mockResolvedValue(undefined),
  isSupported: jest.fn().mockResolvedValue(true),
  isEnabled: jest.fn().mockResolvedValue(true),
}));

describe('DeviceNfcStatusRepository – extended coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls start only once across multiple isSupported calls', async () => {
    const repository = new DeviceNfcStatusRepository();

    await repository.isSupported();
    await repository.isSupported();

    expect(NfcManager.start).toHaveBeenCalledTimes(1);
  });

  it('isSupported returns the NfcManager.isSupported result', async () => {
    (NfcManager.isSupported as jest.Mock).mockResolvedValueOnce(false);
    const repository = new DeviceNfcStatusRepository();

    const result = await repository.isSupported();
    expect(result).toBe(false);
  });

  it('getAvailabilityStatus reuses the started state', async () => {
    const repository = new DeviceNfcStatusRepository();

    await repository.getAvailabilityStatus();
    await repository.getAvailabilityStatus();

    expect(NfcManager.start).toHaveBeenCalledTimes(1);
  });
});
