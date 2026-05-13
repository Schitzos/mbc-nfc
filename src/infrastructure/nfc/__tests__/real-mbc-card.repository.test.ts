const mockStart = jest.fn();
const mockIsSupported = jest.fn();
const mockRequestTechnology = jest.fn();
const mockGetTag = jest.fn();
const mockWriteNdefMessage = jest.fn();
const mockGetNdefMessage = jest.fn();
const mockCancelTechnologyRequest = jest.fn();
const mockEncodeMessage = jest.fn();
const mockRecord = jest.fn();

jest.mock('react-native-nfc-manager', () => ({
  __esModule: true,
  default: {
    start: mockStart,
    isSupported: mockIsSupported,
    requestTechnology: mockRequestTechnology,
    getTag: mockGetTag,
    cancelTechnologyRequest: mockCancelTechnologyRequest,
    ndefHandler: {
      writeNdefMessage: mockWriteNdefMessage,
      getNdefMessage: mockGetNdefMessage,
    },
  },
  NfcTech: { Ndef: 'Ndef' },
  Ndef: {
    TNF_MIME_MEDIA: 0x02,
    encodeMessage: mockEncodeMessage,
    record: mockRecord,
  },
}));

jest.mock('react-native-quick-crypto', () => {
  const nodeCrypto = require('node:crypto');
  return {
    __esModule: true,
    default: {
      randomBytes: (size: number) => nodeCrypto.randomBytes(size),
      createCipheriv: (alg: string, key: Buffer, iv: Buffer) =>
        nodeCrypto.createCipheriv(alg, key, iv),
      createDecipheriv: (alg: string, key: Buffer, iv: Buffer) =>
        nodeCrypto.createDecipheriv(alg, key, iv),
    },
  };
});

import { encrypt } from '@infrastructure/nfc/silent-shield';
import type { MbcCard } from '@domain/entities/mbc-card';
import { createDomainError } from '@domain/errors/domain-error';

const { createRealMbcCardRepository } = require('../real-mbc-card.repository');

const cardFixture: MbcCard = {
  version: 1,
  cardId: 'C000001',
  member: { memberId: 'M000001' },
  balance: 50000,
  currency: 'IDR',
  visitStatus: 'NOT_CHECKED_IN',
  transactionLogs: [],
};

function makeEncryptedTag(card: MbcCard, counter: number) {
  const result = encrypt(card, counter);
  if (!result.ok) {
    throw new Error('encrypt failed: ' + result.error);
  }
  return {
    ndefMessage: [{ payload: Array.from(result.value) }],
  };
}

describe('createRealMbcCardRepository', () => {
  let repository: ReturnType<typeof createRealMbcCardRepository>;

  beforeEach(() => {
    repository = createRealMbcCardRepository();
    jest.clearAllMocks();
    mockIsSupported.mockResolvedValue(true);
    mockStart.mockResolvedValue(undefined);
    mockRequestTechnology.mockResolvedValue(undefined);
    mockCancelTechnologyRequest.mockResolvedValue(undefined);
    mockWriteNdefMessage.mockResolvedValue(undefined);
    mockRecord.mockImplementation(
      (_tnf: number, _type: any, _id: any, payload: any) => payload,
    );
    mockEncodeMessage.mockImplementation((records: any[]) => records[0]);
    mockGetTag.mockResolvedValue(makeEncryptedTag(cardFixture, 1));
    mockGetNdefMessage.mockRejectedValue(new Error('not available'));
  });

  it('checks NFC support', async () => {
    const supported = await repository.isSupported();
    expect(supported).toBe(true);
    expect(mockStart).toHaveBeenCalledTimes(1);
  });

  it('reads and decrypts a card from Silent Shield envelope', async () => {
    const card = await repository.readCard();
    expect(card.cardId).toBe('C000001');
    expect(card.balance).toBe(50000);
    expect(card.visitStatus).toBe('NOT_CHECKED_IN');
    expect(mockCancelTechnologyRequest).toHaveBeenCalled();
  });

  it('writes encrypted card', async () => {
    await repository.writeCard(cardFixture);
    expect(mockWriteNdefMessage).toHaveBeenCalled();
    expect(mockCancelTechnologyRequest).toHaveBeenCalled();
  });

  it('rejects blank/unregistered card', async () => {
    mockGetTag.mockResolvedValueOnce({});
    mockGetTag.mockResolvedValueOnce({ ndefMessage: [] });
    await expect(repository.readCard()).rejects.toMatchObject({
      code: 'UNREGISTERED_CARD',
    });
  });

  it('rejects non-MBC envelope (tampered)', async () => {
    mockGetTag.mockResolvedValueOnce({});
    mockGetTag.mockResolvedValueOnce({
      ndefMessage: [{ payload: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }],
    });
    await expect(repository.readCard()).rejects.toMatchObject({
      code: 'CARD_TAMPERED',
    });
  });

  it('rejects corrupted Silent Shield envelope', async () => {
    const result = encrypt(cardFixture, 1);
    if (!result.ok) {
      return;
    }
    const corrupted = Array.from(result.value);
    // eslint-disable-next-line no-bitwise
    corrupted[corrupted.length - 1] ^= 0xff;
    mockGetTag.mockResolvedValueOnce({});
    mockGetTag.mockResolvedValueOnce({
      ndefMessage: [{ payload: corrupted }],
    });
    await expect(repository.readCard()).rejects.toMatchObject({
      code: 'CARD_TAMPERED',
    });
  });

  it('maps cancelled scan into scan cancelled error', async () => {
    mockRequestTechnology.mockRejectedValueOnce(new Error('user cancelled'));
    await expect(repository.readCard()).rejects.toMatchObject({
      code: 'SCAN_CANCELLED',
    });
  });

  it('detects already registered card on registerCard', async () => {
    // First write succeeds
    await repository.writeCard(cardFixture);

    // registerCard should detect existing valid data
    mockGetTag.mockResolvedValue(makeEncryptedTag(cardFixture, 2));
    await expect(repository.registerCard(cardFixture)).rejects.toMatchObject({
      code: 'CARD_ALREADY_REGISTERED',
    });
  });

  it('readCard uses getTag fallback when getNdefMessage rejects', async () => {
    mockGetNdefMessage.mockRejectedValueOnce(new Error('unsupported'));
    const card = await repository.readCard();
    expect(card.cardId).toBe('C000001');
  });

  it('readCard uses getNdefMessage when it resolves successfully', async () => {
    mockGetNdefMessage.mockResolvedValueOnce(makeEncryptedTag(cardFixture, 1));
    const card = await repository.readCard();
    expect(card.cardId).toBe('C000001');
  });

  it('writeCard catch maps errors to readable', async () => {
    mockWriteNdefMessage.mockRejectedValueOnce(new Error('io error'));
    await expect(repository.writeCard(cardFixture)).rejects.toMatchObject({
      code: 'WRITE_FAILED',
    });
  });

  it('writeCard starts counter from zero when card is unregistered', async () => {
    mockGetNdefMessage.mockRejectedValueOnce(new Error('unsupported'));
    mockGetTag.mockResolvedValueOnce({ ndefMessage: [] });
    mockGetTag.mockResolvedValueOnce({ maxSize: 504 });

    await expect(repository.writeCard(cardFixture)).resolves.toBeUndefined();
    expect(mockWriteNdefMessage).toHaveBeenCalled();
  });

  it('writeCard returns WRITE_FAILED when counter resolution throws non-card error', async () => {
    mockGetNdefMessage.mockRejectedValueOnce(new Error('unsupported'));
    mockGetTag
      .mockResolvedValueOnce({ maxSize: 504 })
      .mockRejectedValueOnce(new Error('tag read crashed'));

    await expect(repository.writeCard(cardFixture)).rejects.toMatchObject({
      code: 'WRITE_FAILED',
    });
  });

  it('readWriteCard reads, transforms, and writes in a single session', async () => {
    const result = await repository.readWriteCard((card: MbcCard) => ({
      ...card,
      balance: card.balance + 10000,
    }));
    expect(result.balance).toBe(60000);
    expect(mockWriteNdefMessage).toHaveBeenCalled();
    expect(mockCancelTechnologyRequest).toHaveBeenCalled();
  });

  it('readWriteCard propagates DomainError from transform', async () => {
    await expect(
      repository.readWriteCard(() => {
        throw createDomainError('INSUFFICIENT_BALANCE', 'Not enough');
      }),
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_BALANCE' });
  });

  it('readWriteCard maps generic errors to WRITE_FAILED', async () => {
    mockRequestTechnology.mockRejectedValueOnce(new Error('unknown'));
    await expect(
      repository.readWriteCard((card: MbcCard) => card),
    ).rejects.toMatchObject({ code: 'WRITE_FAILED' });
  });
});

describe('createRealMbcCardRepository – additional error paths', () => {
  let repository: ReturnType<typeof createRealMbcCardRepository>;

  beforeEach(() => {
    repository = createRealMbcCardRepository();
    jest.clearAllMocks();
    mockIsSupported.mockResolvedValue(true);
    mockStart.mockResolvedValue(undefined);
    mockRequestTechnology.mockResolvedValue(undefined);
    mockCancelTechnologyRequest.mockResolvedValue(undefined);
    mockWriteNdefMessage.mockResolvedValue(undefined);
    mockRecord.mockImplementation(
      (_tnf: number, _type: any, _id: any, payload: any) => payload,
    );
    mockEncodeMessage.mockImplementation((records: any[]) => records[0]);
    mockGetTag.mockResolvedValue(makeEncryptedTag(cardFixture, 1));
    mockGetNdefMessage.mockRejectedValue(new Error('not available'));
  });

  it('rejects write when encode returns null', async () => {
    mockEncodeMessage.mockReturnValueOnce(null);
    await expect(repository.writeCard(cardFixture)).rejects.toMatchObject({
      code: 'NFC_UNAVAILABLE',
    });
  });

  it('rejects write when payload exceeds NTAG215 capacity', async () => {
    // Mock encrypt to return an oversized buffer
    const silentShield = require('../silent-shield');
    const originalEncrypt = silentShield.encrypt;
    silentShield.encrypt = () => ({ ok: true, value: Buffer.alloc(600) });
    await expect(repository.writeCard(cardFixture)).rejects.toMatchObject({
      code: 'CARD_CAPACITY_INSUFFICIENT',
    });
    silentShield.encrypt = originalEncrypt;
  });

  it('registerCard error path maps to readable error', async () => {
    // First getTag for assertSupportedTag, second for registerCard's own check
    mockGetTag.mockResolvedValueOnce({});
    mockGetTag.mockResolvedValueOnce({ ndefMessage: [] });
    mockWriteNdefMessage.mockRejectedValueOnce(new Error('write failed'));
    await expect(repository.registerCard(cardFixture)).rejects.toMatchObject({
      code: 'WRITE_FAILED',
    });
  });

  it('rejects write when encrypt fails', async () => {
    const silentShield = require('../silent-shield');
    const originalEncrypt = silentShield.encrypt;
    silentShield.encrypt = () => ({ ok: false, error: 'TEST_ERROR' });
    await expect(repository.writeCard(cardFixture)).rejects.toMatchObject({
      code: 'CARD_TAMPERED',
    });
    silentShield.encrypt = originalEncrypt;
  });

  it('readCard falls back to getTag when getNdefMessage throws', async () => {
    mockGetNdefMessage.mockRejectedValueOnce(new Error('not supported'));
    const card = await repository.readCard();
    expect(card.cardId).toBe('C000001');
  });

  it('registerCard proceeds when MBC envelope exists but decrypt fails', async () => {
    // Create a valid MBC envelope but corrupt the ciphertext so decrypt returns ok:false
    const silentShield = require('../silent-shield');
    const result = silentShield.encrypt(cardFixture, 1);
    if (!result.ok) {
      return;
    }
    const corrupted = Buffer.from(result.value);
    // Corrupt multiple bytes in the auth tag area to ensure decrypt fails
    for (let i = corrupted.length - 16; i < corrupted.length; i++) {
      // eslint-disable-next-line no-bitwise
      corrupted[i] ^= 0xff;
    }
    // First getTag for assertSupportedTag, second for registerCard's own check
    mockGetTag.mockResolvedValueOnce({});
    mockGetTag.mockResolvedValueOnce({
      ndefMessage: [{ payload: Array.from(corrupted) }],
    });
    // Should NOT throw CARD_ALREADY_REGISTERED since decrypt failed
    await expect(repository.registerCard(cardFixture)).resolves.toBeUndefined();
  });

  it('registerCard proceeds when card has non-MBC NDEF data', async () => {
    // First getTag for assertSupportedTag, second for registerCard's own check
    mockGetTag.mockResolvedValueOnce({});
    mockGetTag.mockResolvedValueOnce({
      ndefMessage: [{ payload: [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07] }],
    });
    await expect(repository.registerCard(cardFixture)).resolves.toBeUndefined();
  });
});

describe('createRealMbcCardRepository – new error codes', () => {
  let repository: ReturnType<typeof createRealMbcCardRepository>;

  beforeEach(() => {
    repository = createRealMbcCardRepository();
    jest.clearAllMocks();
    mockStart.mockResolvedValue(undefined);
    mockRequestTechnology.mockResolvedValue(undefined);
    mockCancelTechnologyRequest.mockResolvedValue(undefined);
    mockWriteNdefMessage.mockResolvedValue(undefined);
    mockRecord.mockImplementation(
      (_tnf: number, _type: any, _id: any, payload: any) => payload,
    );
    mockEncodeMessage.mockImplementation((records: any[]) => records[0]);
    mockGetTag.mockResolvedValue(makeEncryptedTag(cardFixture, 1));
    mockGetNdefMessage.mockRejectedValue(new Error('not available'));
  });

  it('throws SCAN_TIMEOUT when requestTechnology times out', async () => {
    mockRequestTechnology.mockRejectedValueOnce(new Error('timeout'));
    await expect(repository.readCard()).rejects.toMatchObject({
      code: 'SCAN_TIMEOUT',
    });
  });

  it('throws SCAN_TIMEOUT on write when technology request times out', async () => {
    mockRequestTechnology.mockRejectedValueOnce(new Error('NFC timeout'));
    await expect(repository.writeCard(cardFixture)).rejects.toMatchObject({
      code: 'SCAN_TIMEOUT',
    });
  });

  it('throws READ_FAILED when readCard encounters generic error after session start', async () => {
    mockGetTag.mockResolvedValueOnce({});
    mockGetTag.mockRejectedValueOnce(new Error('io failure'));
    mockGetNdefMessage.mockRejectedValueOnce(new Error('io failure'));
    await expect(repository.readCard()).rejects.toMatchObject({
      code: 'READ_FAILED',
    });
  });

  it('throws WRITE_FAILED when writeNdefMessage fails with non-cancel error', async () => {
    mockWriteNdefMessage.mockRejectedValueOnce(new Error('tag lost'));
    await expect(repository.writeCard(cardFixture)).rejects.toMatchObject({
      code: 'WRITE_FAILED',
    });
  });

  it('throws CARD_UNSUPPORTED when tag maxSize is below NTAG215 capacity', async () => {
    mockGetTag.mockResolvedValueOnce({ maxSize: 100 });
    await expect(repository.readCard()).rejects.toMatchObject({
      code: 'CARD_UNSUPPORTED',
    });
  });

  it('throws CARD_UNSUPPORTED on writeCard when tag is too small', async () => {
    mockGetTag.mockResolvedValueOnce({ maxSize: 48 });
    await expect(repository.writeCard(cardFixture)).rejects.toMatchObject({
      code: 'CARD_UNSUPPORTED',
    });
  });

  it('does not throw CARD_UNSUPPORTED when maxSize is sufficient', async () => {
    mockGetTag.mockResolvedValueOnce({ maxSize: 504 });
    mockGetTag.mockResolvedValueOnce(makeEncryptedTag(cardFixture, 1));
    mockGetNdefMessage.mockRejectedValueOnce(new Error('not available'));
    const card = await repository.readCard();
    expect(card.cardId).toBe('C000001');
  });

  it('does not throw CARD_UNSUPPORTED when maxSize is absent', async () => {
    // Default mock returns tag without maxSize — should pass through
    const card = await repository.readCard();
    expect(card.cardId).toBe('C000001');
  });

  it('throws WRITE_FAILED when a non-Error value is thrown in write context', async () => {
    mockWriteNdefMessage.mockRejectedValueOnce('string error');
    await expect(repository.writeCard(cardFixture)).rejects.toMatchObject({
      code: 'WRITE_FAILED',
    });
  });
});
