import NfcManager from 'react-native-nfc-manager';
import { createDeviceNfcStatusRepository } from '@infrastructure/nfc/device-nfc-status.repository';

jest.mock('react-native-nfc-manager', () => ({
  start: jest.fn().mockResolvedValue(undefined),
  isSupported: jest.fn().mockResolvedValue(true),
  isEnabled: jest.fn().mockResolvedValue(true),
}));

describe('createDeviceNfcStatusRepository', () => {
  it('reports supported NFC status', async () => {
    const repository = createDeviceNfcStatusRepository();
    await expect(repository.getAvailabilityStatus()).resolves.toBe('SUPPORTED');
  });

  it('reports unsupported status', async () => {
    (NfcManager.isSupported as jest.Mock).mockResolvedValueOnce(false);
    const repository = createDeviceNfcStatusRepository();
    await expect(repository.getAvailabilityStatus()).resolves.toBe(
      'UNSUPPORTED',
    );
  });

  it('reports disabled status', async () => {
    (NfcManager.isSupported as jest.Mock).mockResolvedValueOnce(true);
    (NfcManager.isEnabled as jest.Mock).mockResolvedValueOnce(false);
    const repository = createDeviceNfcStatusRepository();
    await expect(repository.getAvailabilityStatus()).resolves.toBe('DISABLED');
  });

  it('reports unavailable status when enabled check fails', async () => {
    (NfcManager.isSupported as jest.Mock).mockResolvedValueOnce(true);
    (NfcManager.isEnabled as jest.Mock).mockRejectedValueOnce(
      new Error('not available'),
    );
    const repository = createDeviceNfcStatusRepository();
    await expect(repository.getAvailabilityStatus()).resolves.toBe(
      'UNAVAILABLE',
    );
  });

  it('isSupported delegates to NfcManager', async () => {
    const repository = createDeviceNfcStatusRepository();
    await expect(repository.isSupported()).resolves.toBe(true);
  });
});
