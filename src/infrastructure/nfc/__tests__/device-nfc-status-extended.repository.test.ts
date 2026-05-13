import NfcManager from 'react-native-nfc-manager';
import { createDeviceNfcStatusRepository } from '@infrastructure/nfc/device-nfc-status.repository';

jest.mock('react-native-nfc-manager', () => ({
  start: jest.fn().mockResolvedValue(undefined),
  isSupported: jest.fn().mockResolvedValue(true),
  isEnabled: jest.fn().mockResolvedValue(true),
}));

describe('createDeviceNfcStatusRepository – extended coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls start only once across multiple isSupported calls', async () => {
    const repository = createDeviceNfcStatusRepository();

    await repository.isSupported();
    await repository.isSupported();

    expect(NfcManager.start).toHaveBeenCalledTimes(1);
  });

  it('isSupported returns the NfcManager.isSupported result', async () => {
    (NfcManager.isSupported as jest.Mock).mockResolvedValueOnce(false);
    const repository = createDeviceNfcStatusRepository();

    const result = await repository.isSupported();
    expect(result).toBe(false);
  });

  it('getAvailabilityStatus reuses the started state', async () => {
    const repository = createDeviceNfcStatusRepository();

    await repository.getAvailabilityStatus();
    await repository.getAvailabilityStatus();

    expect(NfcManager.start).toHaveBeenCalledTimes(1);
  });
});
