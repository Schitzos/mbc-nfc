export class CardRepositoryError extends Error {
  constructor(
    public readonly code:
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
      | 'WRITE_FAILED',
    message: string,
  ) {
    super(message);
    this.name = 'CardRepositoryError';
  }
}
