import NfcManager from 'react-native-nfc-manager';
import { DeviceNfcStatusRepository } from '../device-nfc-status.repository';
import { CardRepositoryError } from '../../../domain/errors/card-repository-error';

jest.mock('react-native-nfc-manager', () => ({
  start: jest.fn().mockResolvedValue(undefined),
  isSupported: jest.fn().mockResolvedValue(true),
  isEnabled: jest.fn().mockResolvedValue(true),
}));

describe('DeviceNfcStatusRepository', () => {
  it('reports supported NFC status', async () => {
    const repository = new DeviceNfcStatusRepository();
    await expect(repository.getAvailabilityStatus()).resolves.toBe('SUPPORTED');
  });

  it('reports unsupported status', async () => {
    (NfcManager.isSupported as jest.Mock).mockResolvedValueOnce(false);
    const repository = new DeviceNfcStatusRepository();
    await expect(repository.getAvailabilityStatus()).resolves.toBe(
      'UNSUPPORTED',
    );
  });

  it('reports disabled status', async () => {
    (NfcManager.isSupported as jest.Mock).mockResolvedValueOnce(true);
    (NfcManager.isEnabled as jest.Mock).mockResolvedValueOnce(false);
    const repository = new DeviceNfcStatusRepository();
    await expect(repository.getAvailabilityStatus()).resolves.toBe('DISABLED');
  });

  it('reports unavailable status when enabled check fails', async () => {
    (NfcManager.isSupported as jest.Mock).mockResolvedValueOnce(true);
    (NfcManager.isEnabled as jest.Mock).mockRejectedValueOnce(
      new Error('not available'),
    );
    const repository = new DeviceNfcStatusRepository();
    await expect(repository.getAvailabilityStatus()).resolves.toBe(
      'UNAVAILABLE',
    );
  });

  it('throws for read/write operations and supports cancel', async () => {
    const repository = new DeviceNfcStatusRepository();

    await expect(repository.readCard()).rejects.toBeInstanceOf(
      CardRepositoryError,
    );
    await expect(repository.writeCard()).rejects.toBeInstanceOf(
      CardRepositoryError,
    );
    await expect(repository.cancel()).resolves.toBeUndefined();
  });
});
