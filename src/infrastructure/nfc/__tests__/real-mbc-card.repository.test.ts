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
  const nodeCrypto = require('crypto');
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

import { encrypt } from '../silent-shield';
import type { MbcCard } from '../../../domain/entities/mbc-card';

const { RealMbcCardRepository } = require('../real-mbc-card.repository');

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

describe('RealMbcCardRepository', () => {
  let repository: InstanceType<typeof RealMbcCardRepository>;

  beforeEach(() => {
    repository = new RealMbcCardRepository();
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
    mockGetTag.mockResolvedValueOnce({ ndefMessage: [] });
    await expect(repository.readCard()).rejects.toMatchObject({
      code: 'UNREGISTERED_CARD',
    });
  });

  it('rejects non-MBC envelope (tampered)', async () => {
    mockGetTag.mockResolvedValueOnce({
      ndefMessage: [{ payload: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }],
    });
    await expect(repository.readCard()).rejects.toMatchObject({
      code: 'TAMPERED_CARD',
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
    mockGetTag.mockResolvedValueOnce({
      ndefMessage: [{ payload: corrupted }],
    });
    await expect(repository.readCard()).rejects.toMatchObject({
      code: 'TAMPERED_CARD',
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
      code: 'NFC_UNAVAILABLE',
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
    const { DomainError } = require('../../../domain/errors/domain-error');
    await expect(
      repository.readWriteCard(() => {
        throw new DomainError('INSUFFICIENT_BALANCE', 'Not enough');
      }),
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_BALANCE' });
  });

  it('readWriteCard maps generic errors to NFC_UNAVAILABLE', async () => {
    mockRequestTechnology.mockRejectedValueOnce(new Error('unknown'));
    await expect(
      repository.readWriteCard((card: MbcCard) => card),
    ).rejects.toMatchObject({ code: 'NFC_UNAVAILABLE' });
  });
});

describe('RealMbcCardRepository – additional error paths', () => {
  let repository: InstanceType<typeof RealMbcCardRepository>;

  beforeEach(() => {
    repository = new RealMbcCardRepository();
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
    mockRequestTechnology.mockRejectedValueOnce(new Error('timeout'));
    await expect(repository.registerCard(cardFixture)).rejects.toMatchObject({
      code: 'NFC_UNAVAILABLE',
    });
  });

  it('rejects write when encrypt fails', async () => {
    const silentShield = require('../silent-shield');
    const originalEncrypt = silentShield.encrypt;
    silentShield.encrypt = () => ({ ok: false, error: 'TEST_ERROR' });
    await expect(repository.writeCard(cardFixture)).rejects.toMatchObject({
      code: 'TAMPERED_CARD',
    });
    silentShield.encrypt = originalEncrypt;
  });

  it('readCard falls back to getTag when getNdefMessage throws', async () => {
    mockGetNdefMessage.mockRejectedValueOnce(new Error('not supported'));
    const card = await repository.readCard();
    expect(card.cardId).toBe('C000001');
  });
});
