import { createDomainError } from '@domain/membership/errors/domain-error';
import { createCardRepositoryError } from '@domain/membership/errors/membership-card-repository-error';

describe('DomainError', () => {
  it('creates an error with code and message', () => {
    const error = createDomainError(
      'INVALID_TIMESTAMP',
      'Timestamp is not valid.',
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('DomainError');
    expect(error.code).toBe('INVALID_TIMESTAMP');
    expect(error.message).toBe('Timestamp is not valid.');
  });

  it('supports all defined error codes', () => {
    const codes = [
      'INVALID_TIMESTAMP',
      'INVALID_DURATION',
      'CARD_ALREADY_CHECKED_IN',
      'CARD_NOT_CHECKED_IN',
      'ACTIVE_SESSION_EXISTS',
      'ACTIVE_SESSION_MISSING',
      'INSUFFICIENT_BALANCE',
    ] as const;

    for (const code of codes) {
      const error = createDomainError(code, `Error: ${code}`);
      expect(error.code).toBe(code);
    }
  });
});

describe('CardRepositoryError', () => {
  it('creates an error with code and message', () => {
    const error = createCardRepositoryError(
      'UNREGISTERED_CARD',
      'Card is not registered.',
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('CardRepositoryError');
    expect(error.code).toBe('UNREGISTERED_CARD');
    expect(error.message).toBe('Card is not registered.');
  });

  it('supports all defined error codes', () => {
    const codes = [
      'UNREGISTERED_CARD',
      'CARD_TAMPERED',
      'CARD_ALREADY_REGISTERED',
      'NFC_UNSUPPORTED',
      'NFC_DISABLED',
      'NFC_UNAVAILABLE',
      'SCAN_CANCELLED',
    ] as const;

    for (const code of codes) {
      const error = createCardRepositoryError(code, `Error: ${code}`);
      expect(error.code).toBe(code);
    }
  });
});
