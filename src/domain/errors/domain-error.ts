export type DomainErrorCode =
  | 'INVALID_TIMESTAMP'
  | 'INVALID_DURATION'
  | 'CARD_ALREADY_CHECKED_IN'
  | 'CARD_NOT_CHECKED_IN'
  | 'ACTIVE_SESSION_EXISTS'
  | 'ACTIVE_SESSION_MISSING'
  | 'INSUFFICIENT_BALANCE';

export type DomainError = Error & {
  readonly name: 'DomainError';
  readonly code: DomainErrorCode;
};

export function createDomainError(
  code: DomainErrorCode,
  message: string,
): DomainError {
  const error = new Error(message) as DomainError;
  error.name = 'DomainError';
  Object.defineProperty(error, 'code', {
    value: code,
    writable: false,
    enumerable: true,
  });
  return error;
}

export function isDomainError(error: unknown): error is DomainError {
  return (
    error instanceof Error &&
    error.name === 'DomainError' &&
    typeof (error as { code?: unknown }).code === 'string'
  );
}
