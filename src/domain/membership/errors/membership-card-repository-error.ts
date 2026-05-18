export type CardRepositoryErrorCode =
  | 'UNREGISTERED_CARD'
  | 'CARD_TAMPERED'
  | 'CARD_ALREADY_REGISTERED'
  | 'CARD_CAPACITY_INSUFFICIENT'
  | 'CARD_UNSUPPORTED'
  | 'NFC_UNSUPPORTED'
  | 'NFC_DISABLED'
  | 'NFC_UNAVAILABLE'
  | 'SCAN_CANCELLED'
  | 'SCAN_TIMEOUT'
  | 'READ_FAILED'
  | 'WRITE_FAILED';

export type CardRepositoryError = Error & {
  readonly name: 'CardRepositoryError';
  readonly code: CardRepositoryErrorCode;
};

export function createCardRepositoryError(
  code: CardRepositoryErrorCode,
  message: string,
): CardRepositoryError {
  const error = new Error(message) as CardRepositoryError;
  error.name = 'CardRepositoryError';
  Object.defineProperty(error, 'code', {
    value: code,
    writable: false,
    enumerable: true,
  });
  return error;
}

export function isCardRepositoryError(
  error: unknown,
): error is CardRepositoryError {
  return (
    error instanceof Error &&
    error.name === 'CardRepositoryError' &&
    typeof (error as { code?: unknown }).code === 'string'
  );
}
