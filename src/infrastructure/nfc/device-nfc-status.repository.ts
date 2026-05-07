import NfcManager from 'react-native-nfc-manager';
import type {
  NfcAvailabilityRepository,
  NfcAvailabilityStatus,
} from '@domain/repositories/nfc-availability-repository';

export class DeviceNfcStatusRepository implements NfcAvailabilityRepository {
  private hasStarted = false;

  async isSupported(): Promise<boolean> {
    await this.ensureStarted();
    return NfcManager.isSupported();
  }

  async getAvailabilityStatus(): Promise<NfcAvailabilityStatus> {
    await this.ensureStarted();

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
  }

  private async ensureStarted(): Promise<void> {
    if (!this.hasStarted) {
      await NfcManager.start();
      this.hasStarted = true;
    }
  }
}
