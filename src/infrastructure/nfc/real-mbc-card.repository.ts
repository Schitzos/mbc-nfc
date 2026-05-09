import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import type { MbcCard } from '@domain/entities/mbc-card';
import type { MbcCardRepository } from '@domain/repositories/mbc-card-repository';
import { CardRepositoryError } from '@domain/errors/card-repository-error';
import { DomainError } from '@domain/errors/domain-error';
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
  if (error instanceof CardRepositoryError) {
    return error;
  }
  if (error instanceof DomainError) {
    return error;
  }
  if (error instanceof Error) {
    if (/cancel/i.test(error.message)) {
      return new CardRepositoryError(
        'SCAN_CANCELLED',
        'Scan was cancelled before card processing finished.',
      );
    }
    if (/timeout/i.test(error.message)) {
      return new CardRepositoryError(
        'SCAN_TIMEOUT',
        'No NFC tag detected within the timeout period.',
      );
    }
  }
  if (context === 'read') {
    return new CardRepositoryError(
      'READ_FAILED',
      'Failed to read card. Ensure the card is held steady.',
    );
  }
  return new CardRepositoryError(
    'WRITE_FAILED',
    'Failed to write to card. Ensure the card is held steady.',
  );
}

export class RealMbcCardRepository implements MbcCardRepository {
  private hasStarted = false;
  private writeCounter = 0;

  async isSupported(): Promise<boolean> {
    await this.ensureStarted();
    return NfcManager.isSupported();
  }

  async readCard(): Promise<MbcCard> {
    await this.ensureStarted();
    try {
      await this.requestNdefTechnology();
      await this.assertSupportedTag();
      return await this.readCardFromActiveSession();
    } catch (error) {
      throw toReadableError(error, 'read');
    } finally {
      await this.cancel();
    }
  }

  async writeCard(card: MbcCard): Promise<void> {
    await this.ensureStarted();
    try {
      await this.requestNdefTechnology();
      await this.assertSupportedTag();
      await this.writeToActiveSession(card);
    } catch (error) {
      throw toReadableError(error, 'write');
    } finally {
      await this.cancel();
    }
  }

  async readWriteCard(transform: (card: MbcCard) => MbcCard): Promise<MbcCard> {
    await this.ensureStarted();
    try {
      await this.requestNdefTechnology();
      await this.assertSupportedTag();
      const card = await this.readCardFromActiveSession();
      const updated = transform(card);
      await this.writeToActiveSession(updated);
      return updated;
    } catch (error) {
      throw toReadableError(error, 'write');
    } finally {
      await this.cancel();
    }
  }

  async registerCard(card: MbcCard): Promise<void> {
    await this.ensureStarted();
    try {
      await this.requestNdefTechnology();
      await this.assertSupportedTag();

      // Check if card already has valid MBC data
      const currentTag = (await NfcManager.getTag()) as NdefTag | null;

      if (currentTag?.ndefMessage?.length) {
        const rawPayload = currentTag.ndefMessage[0].payload;
        const payloadBytes = Buffer.from(rawPayload as number[]);
        if (isMbcEnvelope(payloadBytes)) {
          const decryptResult = decrypt(payloadBytes);
          if (decryptResult.ok) {
            throw new CardRepositoryError(
              'CARD_ALREADY_REGISTERED',
              'This card is already registered. Use a blank card or reset first.',
            );
          }
        }
      }

      await this.writeToActiveSession(card);
    } catch (error) {
      throw toReadableError(error, 'write');
    } finally {
      await this.cancel();
    }
  }

  async cancel(): Promise<void> {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch {
      // Best-effort cleanup
    }
  }

  private async ensureStarted(): Promise<void> {
    if (!this.hasStarted) {
      await NfcManager.start();
      this.hasStarted = true;
    }
  }

  private async requestNdefTechnology(): Promise<void> {
    await NfcManager.requestTechnology(NfcTech.Ndef);
  }

  private async assertSupportedTag(): Promise<void> {
    const tag = (await NfcManager.getTag()) as {
      maxSize?: number;
      techTypes?: string[];
    } | null;
    console.log('[MBC-NFC] Tag info:', JSON.stringify(tag));
    if (
      tag &&
      typeof tag.maxSize === 'number' &&
      tag.maxSize < NTAG215_NDEF_CAPACITY
    ) {
      throw new CardRepositoryError(
        'CARD_UNSUPPORTED',
        `This tag type is not supported. Use an NTAG215 or compatible card. (reported maxSize: ${tag.maxSize})`,
      );
    }
  }

  private async writeToActiveSession(card: MbcCard): Promise<void> {
    this.writeCounter++;
    const shieldResult = encrypt(card, this.writeCounter);
    if (!shieldResult.ok) {
      throw new CardRepositoryError(
        'CARD_TAMPERED',
        `Payload error: ${shieldResult.error}`,
      );
    }

    const envelope = shieldResult.value;
    if (envelope.length > NTAG215_RAW_MEMORY) {
      throw new CardRepositoryError(
        'CARD_CAPACITY_INSUFFICIENT',
        'Protected payload exceeds NTAG215 capacity.',
      );
    }

    const mimeType = 'application/vnd.mbc.v1';
    const encoded = Ndef.encodeMessage([
      Ndef.record(Ndef.TNF_MIME_MEDIA, mimeType, '', Array.from(envelope)),
    ]);

    if (!encoded) {
      throw new CardRepositoryError(
        'NFC_UNAVAILABLE',
        'NFC payload could not be encoded for writing.',
      );
    }

    await NfcManager.ndefHandler.writeNdefMessage(encoded);
  }

  private async readCardFromActiveSession(): Promise<MbcCard> {
    let ndefMessage: NdefRecord[] | undefined;
    try {
      const msg = await NfcManager.ndefHandler.getNdefMessage();
      // getNdefMessage returns a tag-like object { ndefMessage: [...] }
      const tagObj = msg as NdefTag | null;
      ndefMessage = tagObj?.ndefMessage;
    } catch {
      const currentTag = (await NfcManager.getTag()) as NdefTag | null;
      ndefMessage = currentTag?.ndefMessage;
    }

    if (!ndefMessage?.length) {
      throw new CardRepositoryError(
        'UNREGISTERED_CARD',
        'Card is blank or not registered yet.',
      );
    }

    const firstRecord = ndefMessage[0];
    const payloadBytes = Buffer.from(firstRecord.payload as number[]);

    if (!isMbcEnvelope(payloadBytes)) {
      throw new CardRepositoryError(
        'CARD_TAMPERED',
        'Card payload is not a valid MBC Silent Shield envelope.',
      );
    }

    const decryptResult = decrypt(payloadBytes);
    if (!decryptResult.ok) {
      throw new CardRepositoryError(
        'CARD_TAMPERED',
        'Card data is invalid or modified. Please go to Station.',
      );
    }

    this.writeCounter = decryptResult.value.writeCounter;
    return decryptResult.value.card;
  }
}
