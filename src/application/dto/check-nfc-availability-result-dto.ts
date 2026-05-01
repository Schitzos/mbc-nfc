export type NfcAvailabilityStatus =
  | 'SUPPORTED'
  | 'UNSUPPORTED'
  | 'DISABLED'
  | 'UNAVAILABLE';

export type CheckNfcAvailabilityResultDto = {
  supported: boolean;
  status: NfcAvailabilityStatus;
  title: string;
  message: string;
  guidance: string[];
  shouldUseMockMode: boolean;
};
