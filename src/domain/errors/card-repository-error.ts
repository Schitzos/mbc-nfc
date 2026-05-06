export class CardRepositoryError extends Error {
  constructor(
    public readonly code:
      | 'UNREGISTERED_CARD'
      | 'TAMPERED_CARD'
      | 'CARD_ALREADY_REGISTERED'
      | 'CARD_CAPACITY_INSUFFICIENT'
      | 'NFC_UNSUPPORTED'
      | 'NFC_DISABLED'
      | 'NFC_UNAVAILABLE'
      | 'SCAN_CANCELLED'
      | 'WRITE_VERIFY_FAILED'
      | 'MOCK_SCENARIO_MISSING',
    message: string,
  ) {
    super(message);
    this.name = 'CardRepositoryError';
  }
}
