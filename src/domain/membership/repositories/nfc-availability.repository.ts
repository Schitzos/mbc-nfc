export type NfcAvailabilityStatus =
  | 'SUPPORTED'
  | 'UNSUPPORTED'
  | 'DISABLED'
  | 'UNAVAILABLE';

export interface NfcAvailabilityRepository {
  isSupported(): Promise<boolean>;
  getAvailabilityStatus(): Promise<NfcAvailabilityStatus>;
}
