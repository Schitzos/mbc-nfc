import type { CheckNfcAvailabilityResultDto } from '@application/dto/check-nfc-availability-result-dto';
import type {
  NfcAvailabilityRepository,
  NfcAvailabilityStatus,
} from '@domain/repositories/nfc-availability-repository';

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
  },
  UNSUPPORTED: {
    title: 'NFC is not supported',
    message:
      'This device cannot run real card operations because NFC hardware is not available.',
    guidance: [
      'Use an NFC-capable Android device for real card operations.',
      'Real card workflows require supported NFC hardware.',
    ],
  },
  DISABLED: {
    title: 'NFC is turned off',
    message: 'This device supports NFC, but it is currently disabled.',
    guidance: [
      'Enable NFC in device settings.',
      'Return to the app and retry the scan.',
      'Real card workflows are blocked until NFC is enabled.',
    ],
  },
  UNAVAILABLE: {
    title: 'NFC is temporarily unavailable',
    message: 'The device could not prepare NFC right now.',
    guidance: [
      'Retry the scan after closing any other NFC session.',
      'Make sure NFC is enabled on the device.',
      'Real card workflows are blocked until NFC becomes available.',
    ],
  },
};

export type CheckNfcAvailabilityUseCase = {
  execute: () => Promise<CheckNfcAvailabilityResultDto>;
};

export function createCheckNfcAvailabilityUseCase(
  nfcAvailabilityRepository: NfcAvailabilityRepository,
): CheckNfcAvailabilityUseCase {
  return {
    async execute(): Promise<CheckNfcAvailabilityResultDto> {
      const status = await nfcAvailabilityRepository.getAvailabilityStatus();
      const guidance = GUIDANCE_BY_STATUS[status];

      return {
        supported: status === 'SUPPORTED',
        status,
        ...guidance,
      };
    },
  };
}
