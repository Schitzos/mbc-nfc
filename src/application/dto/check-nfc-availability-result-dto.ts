export type { NfcAvailabilityStatus } from '../../domain/repositories/nfc-availability-repository';

export type CheckNfcAvailabilityResultDto = {
  supported: boolean;
  status: import('../../domain/repositories/nfc-availability-repository').NfcAvailabilityStatus;
  title: string;
  message: string;
  guidance: string[];
};
