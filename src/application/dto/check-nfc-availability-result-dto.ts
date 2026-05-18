export type { NfcAvailabilityStatus } from '@domain/membership/repositories/nfc-availability.repository';
import type { NfcAvailabilityStatus } from '@domain/membership/repositories/nfc-availability.repository';

export type CheckNfcAvailabilityResultDto = {
  supported: boolean;
  status: NfcAvailabilityStatus;
  title: string;
  message: string;
  guidance: string[];
};
