export class CardRepositoryError extends Error {
  constructor(
    public readonly code:
      | 'UNREGISTERED_CARD'
      | 'CARD_TAMPERED'
      | 'CARD_ALREADY_REGISTERED'
      | 'CARD_CAPACITY_INSUFFICIENT'
      | 'NFC_UNSUPPORTED'
      | 'NFC_DISABLED'
      | 'NFC_UNAVAILABLE'
      | 'SCAN_CANCELLED',
    message: string,
  ) {
    super(message);
    this.name = 'CardRepositoryError';
  }
}
