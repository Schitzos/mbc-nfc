export class CardRepositoryError extends Error {
  constructor(
    public readonly code:
      | 'UNREGISTERED_CARD'
      | 'TAMPERED_CARD'
      | 'CARD_ALREADY_REGISTERED'
      | 'NFC_UNSUPPORTED'
      | 'NFC_DISABLED'
      | 'NFC_UNAVAILABLE'
      | 'MOCK_SCENARIO_MISSING',
    message: string,
  ) {
    super(message);
    this.name = 'CardRepositoryError';
  }
}
