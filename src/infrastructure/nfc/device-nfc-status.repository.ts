import NfcManager from 'react-native-nfc-manager';
import type {
  NfcAvailabilityRepository,
  NfcAvailabilityStatus,
} from '@domain/membership/repositories/nfc-availability.repository';

export type DeviceNfcStatusRepository = NfcAvailabilityRepository;

export function createDeviceNfcStatusRepository(): DeviceNfcStatusRepository {
  let hasStarted = false;

  async function ensureStarted(): Promise<void> {
    if (!hasStarted) {
      await NfcManager.start();
      hasStarted = true;
    }
  }

  return {
    async isSupported(): Promise<boolean> {
      await ensureStarted();
      return NfcManager.isSupported();
    },

    async getAvailabilityStatus(): Promise<NfcAvailabilityStatus> {
      await ensureStarted();

      const supported = await NfcManager.isSupported();

      if (!supported) {
        return 'UNSUPPORTED';
      }

      try {
        const enabled = await NfcManager.isEnabled();
        return enabled ? 'SUPPORTED' : 'DISABLED';
      } catch {
        return 'UNAVAILABLE';
      }
    },
  };
}
