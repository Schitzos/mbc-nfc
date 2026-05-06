import type { NfcAvailabilityStatus } from '../../domain/repositories/nfc-availability-repository';

export type { NfcAvailabilityStatus };

export type CheckNfcAvailabilityResultDto = {
  supported: boolean;
  status: NfcAvailabilityStatus;
  title: string;
  message: string;
  guidance: string[];
};
