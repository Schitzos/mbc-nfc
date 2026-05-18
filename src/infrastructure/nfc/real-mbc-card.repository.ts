import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import { Buffer } from 'buffer';
import type { MbcCard } from '@domain/membership/entities/membership-card';
import type { MbcCardRepository } from '@domain/membership/repositories/membership-card.repository';
import {
  createCardRepositoryError,
  isCardRepositoryError,
} from '@domain/membership/errors/membership-card-repository-error';
import { isDomainError } from '@domain/membership/errors/domain-error';
import type { CardRepositoryError } from '@domain/membership/errors/membership-card-repository-error';
import type { DomainError } from '@domain/membership/errors/domain-error';
import { encrypt, decrypt, isMbcEnvelope } from './silent-shield';

const NTAG215_RAW_MEMORY = 504;
const NTAG215_NDEF_CAPACITY = 480;

interface NdefRecord {
  tnf: number;
  type: number[] | Uint8Array;
  payload: number[] | Uint8Array;
}

interface NdefTag {
  ndefMessage?: NdefRecord[];
}

type ErrorContext = 'read' | 'write';

function toReadableError(
  error: unknown,
  context: ErrorContext,
): CardRepositoryError | DomainError {
  if (isCardRepositoryError(error)) {
    return error;
  }
  if (isDomainError(error)) {
    return error;
  }
  if (error instanceof Error) {
    if (/cancel/i.test(error.message)) {
      return createCardRepositoryError(
        'SCAN_CANCELLED',
        'Scan was cancelled before card processing finished.',
      );
    }
    if (/timeout/i.test(error.message)) {
      return createCardRepositoryError(
        'SCAN_TIMEOUT',
        'No NFC tag detected within the timeout period.',
      );
    }
  }
  if (context === 'read') {
    return createCardRepositoryError(
      'READ_FAILED',
      'Failed to read card. Ensure the card is held steady.',
    );
  }
  return createCardRepositoryError(
    'WRITE_FAILED',
    'Failed to write to card. Ensure the card is held steady.',
  );
}

export type RealMbcCardRepository = MbcCardRepository;

export function createRealMbcCardRepository(): RealMbcCardRepository {
  let hasStarted = false;

  async function ensureStarted(): Promise<void> {
    if (!hasStarted) {
      await NfcManager.start();
      hasStarted = true;
    }
  }

  async function requestNdefTechnology(): Promise<void> {
    await NfcManager.requestTechnology(NfcTech.Ndef);
  }

  async function cancel(): Promise<void> {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch {
      // Best-effort cleanup
    }
  }

  async function assertSupportedTag(): Promise<void> {
    const tag = (await NfcManager.getTag()) as {
      maxSize?: number;
      techTypes?: string[];
    } | null;
    if (
      tag &&
      typeof tag.maxSize === 'number' &&
      tag.maxSize < NTAG215_NDEF_CAPACITY
    ) {
      throw createCardRepositoryError(
        'CARD_UNSUPPORTED',
        `This tag type is not supported. Use an NTAG215 or compatible card. (reported maxSize: ${tag.maxSize})`,
      );
    }
  }

  async function writeToActiveSession(
    card: MbcCard,
    writeCounter: number,
  ): Promise<void> {
    const shieldResult = encrypt(card, writeCounter);
    if (!shieldResult.ok) {
      throw createCardRepositoryError(
        'CARD_TAMPERED',
        `Payload error: ${shieldResult.error}`,
      );
    }

    const envelope = shieldResult.value;
    if (envelope.length > NTAG215_RAW_MEMORY) {
      throw createCardRepositoryError(
        'CARD_CAPACITY_INSUFFICIENT',
        'Protected payload exceeds NTAG215 capacity.',
      );
    }

    const mimeType = 'application/vnd.mbc.v1';
    const encoded = Ndef.encodeMessage([
      Ndef.record(Ndef.TNF_MIME_MEDIA, mimeType, '', Array.from(envelope)),
    ]);

    if (!encoded) {
      throw createCardRepositoryError(
        'NFC_UNAVAILABLE',
        'NFC payload could not be encoded for writing.',
      );
    }

    await NfcManager.ndefHandler.writeNdefMessage(encoded);
  }

  async function readCardFromActiveSession(): Promise<{
    card: MbcCard;
    writeCounter: number;
  }> {
    let ndefMessage: NdefRecord[] | undefined;
    try {
      const msg = await NfcManager.ndefHandler.getNdefMessage();
      const tagObj = msg as NdefTag | null;
      ndefMessage = tagObj?.ndefMessage;
    } catch {
      const currentTag = (await NfcManager.getTag()) as NdefTag | null;
      ndefMessage = currentTag?.ndefMessage;
    }

    if (!ndefMessage?.length) {
      throw createCardRepositoryError(
        'UNREGISTERED_CARD',
        'Card is blank or not registered yet.',
      );
    }

    const firstRecord = ndefMessage[0];
    const payloadBytes = Buffer.from(firstRecord.payload as number[]);

    if (!isMbcEnvelope(payloadBytes)) {
      throw createCardRepositoryError(
        'CARD_TAMPERED',
        'Card payload is not a valid MBC Silent Shield envelope.',
      );
    }

    const decryptResult = decrypt(payloadBytes);
    if (!decryptResult.ok) {
      throw createCardRepositoryError(
        'CARD_TAMPERED',
        'Card data is invalid or modified. Please go to Station.',
      );
    }

    return {
      card: decryptResult.value.card,
      writeCounter: decryptResult.value.writeCounter,
    };
  }

  async function resolveCurrentWriteCounterFromActiveSession(): Promise<number> {
    try {
      const readResult = await readCardFromActiveSession();
      return readResult.writeCounter;
    } catch (error) {
      if (isCardRepositoryError(error)) {
        return 0;
      }
      throw error;
    }
  }

  return {
    async isSupported(): Promise<boolean> {
      await ensureStarted();
      return NfcManager.isSupported();
    },

    async readCard(): Promise<MbcCard> {
      await ensureStarted();
      try {
        await requestNdefTechnology();
        await assertSupportedTag();
        const readResult = await readCardFromActiveSession();
        return readResult.card;
      } catch (error) {
        throw toReadableError(error, 'read');
      } finally {
        await cancel();
      }
    },

    async writeCard(card: MbcCard): Promise<void> {
      await ensureStarted();
      try {
        await requestNdefTechnology();
        await assertSupportedTag();
        const nextWriteCounter =
          (await resolveCurrentWriteCounterFromActiveSession()) + 1;
        await writeToActiveSession(card, nextWriteCounter);
      } catch (error) {
        throw toReadableError(error, 'write');
      } finally {
        await cancel();
      }
    },

    async readWriteCard(
      transform: (card: MbcCard) => MbcCard,
    ): Promise<MbcCard> {
      await ensureStarted();
      try {
        await requestNdefTechnology();
        await assertSupportedTag();
        const readResult = await readCardFromActiveSession();
        const updated = transform(readResult.card);
        await writeToActiveSession(updated, readResult.writeCounter + 1);
        return updated;
      } catch (error) {
        throw toReadableError(error, 'write');
      } finally {
        await cancel();
      }
    },

    async registerCard(card: MbcCard): Promise<void> {
      await ensureStarted();
      try {
        await requestNdefTechnology();
        await assertSupportedTag();

        const currentTag = (await NfcManager.getTag()) as NdefTag | null;

        if (currentTag?.ndefMessage?.length) {
          const rawPayload = currentTag.ndefMessage[0].payload;
          const payloadBytes = Buffer.from(rawPayload as number[]);
          if (isMbcEnvelope(payloadBytes)) {
            const decryptResult = decrypt(payloadBytes);
            if (decryptResult.ok) {
              throw createCardRepositoryError(
                'CARD_ALREADY_REGISTERED',
                'This card is already registered. Use a blank card or reset first.',
              );
            }
          }
        }

        await writeToActiveSession(card, 1);
      } catch (error) {
        throw toReadableError(error, 'write');
      } finally {
        await cancel();
      }
    },

    cancel,
  };
}
