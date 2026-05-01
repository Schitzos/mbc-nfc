export class DomainError extends Error {
  constructor(
    public readonly code:
      | 'INVALID_TIMESTAMP'
      | 'INVALID_DURATION'
      | 'INVALID_TARIFF_RULE'
      | 'CARD_ALREADY_CHECKED_IN'
      | 'CARD_NOT_CHECKED_IN'
      | 'ACTIVE_SESSION_EXISTS'
      | 'ACTIVE_SESSION_MISSING'
      | 'INSUFFICIENT_BALANCE',
    message: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
