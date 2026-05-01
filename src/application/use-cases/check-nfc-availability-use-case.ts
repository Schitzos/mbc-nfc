import type {
  CheckNfcAvailabilityResultDto,
  NfcAvailabilityStatus,
} from '../dto/check-nfc-availability-result-dto';
import type { MbcCardRepository } from '../../domain/repositories/mbc-card-repository';

type AvailabilityAwareCardRepository = MbcCardRepository & {
  getAvailabilityStatus?: () => Promise<NfcAvailabilityStatus>;
};

type GuidanceContent = Omit<
  CheckNfcAvailabilityResultDto,
  'supported' | 'status'
>;

const GUIDANCE_BY_STATUS: Record<NfcAvailabilityStatus, GuidanceContent> = {
  SUPPORTED: {
    title: 'NFC is ready',
    message: 'Real card operations can run on this device.',
    guidance: [
      'Hold the phone close to the NFC card when scanning starts.',
      'Keep NFC enabled during read or write actions.',
      'Retry the scan if the card is moved too early.',
    ],
    shouldUseMockMode: false,
  },
  UNSUPPORTED: {
    title: 'NFC is not supported',
    message:
      'This device cannot run real card operations because NFC hardware is not available.',
    guidance: [
      'Use an NFC-capable Android device for real card operations.',
      'Use mock or demo mode until a supported device is available.',
    ],
    shouldUseMockMode: true,
  },
  DISABLED: {
    title: 'NFC is turned off',
    message: 'This device supports NFC, but it is currently disabled.',
    guidance: [
      'Enable NFC in device settings.',
      'Return to the app and retry the scan.',
      'Use mock or demo mode if NFC cannot be enabled right now.',
    ],
    shouldUseMockMode: true,
  },
  UNAVAILABLE: {
    title: 'NFC is temporarily unavailable',
    message: 'The device could not prepare NFC right now.',
    guidance: [
      'Retry the scan after closing any other NFC session.',
      'Make sure NFC is enabled on the device.',
      'Use mock or demo mode if real card operations are blocked.',
    ],
    shouldUseMockMode: true,
  },
};

export class CheckNfcAvailabilityUseCase {
  constructor(
    private readonly cardRepository: AvailabilityAwareCardRepository,
  ) {}

  async execute(): Promise<CheckNfcAvailabilityResultDto> {
    const status = await this.resolveStatus();
    const guidance = GUIDANCE_BY_STATUS[status];

    return {
      supported: status === 'SUPPORTED',
      status,
      ...guidance,
    };
  }

  private async resolveStatus(): Promise<NfcAvailabilityStatus> {
    if (this.cardRepository.getAvailabilityStatus) {
      return this.cardRepository.getAvailabilityStatus();
    }

    const isSupported = await this.cardRepository.isSupported();
    return isSupported ? 'SUPPORTED' : 'UNSUPPORTED';
  }
}
