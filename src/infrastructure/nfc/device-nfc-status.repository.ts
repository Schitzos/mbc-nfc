import NfcManager from 'react-native-nfc-manager';
import type { MbcCard } from '../../domain/entities/mbc-card';
import type { MbcCardRepository } from '../../domain/repositories/mbc-card-repository';
import type { NfcAvailabilityStatus } from '../../application/dto/check-nfc-availability-result-dto';
import { CardRepositoryError } from '../../domain/errors/card-repository-error';

export class DeviceNfcStatusRepository implements MbcCardRepository {
  private hasStarted = false;

  async isSupported(): Promise<boolean> {
    await this.ensureStarted();
    return NfcManager.isSupported();
  }

  async readCard(): Promise<MbcCard> {
    throw new CardRepositoryError(
      'NFC_UNAVAILABLE',
      'Device NFC status repository does not support card reads.',
    );
  }

  async writeCard(): Promise<void> {
    throw new CardRepositoryError(
      'NFC_UNAVAILABLE',
      'Device NFC status repository does not support card writes.',
    );
  }

  async cancel(): Promise<void> {
    return Promise.resolve();
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
