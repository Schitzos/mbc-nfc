import { Buffer } from 'buffer';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import type { MbcCard } from '../../domain/entities/mbc-card';
import type { MbcCardRepository } from '../../domain/repositories/mbc-card-repository';
import { CardRepositoryError } from '../../domain/errors/card-repository-error';
import { DomainError } from '../../domain/errors/domain-error';
import { encrypt, decrypt, isMbcEnvelope } from './silent-shield';

const NTAG215_USER_MEMORY = 504;

interface NdefRecord {
  tnf: number;
  type: number[] | Uint8Array;
  payload: number[] | Uint8Array;
}

interface NdefTag {
  ndefMessage?: NdefRecord[];
}

function toReadableError(error: unknown): CardRepositoryError | DomainError {
  if (error instanceof CardRepositoryError) {
    return error;
  }
  if (error instanceof DomainError) {
    return error;
  }
  if (error instanceof Error && /cancel/i.test(error.message)) {
    return new CardRepositoryError(
      'SCAN_CANCELLED',
      'Scan was cancelled before card processing finished.',
    );
  }
  return new CardRepositoryError(
    'NFC_UNAVAILABLE',
    'NFC session failed. Please retry with the card held steady.',
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
      return await this.readCardFromActiveSession();
    } catch (error) {
      throw toReadableError(error);
    } finally {
      await this.cancel();
    }
  }

  async writeCard(card: MbcCard): Promise<void> {
    await this.ensureStarted();
    try {
      await this.requestNdefTechnology();
      await this.writeToActiveSession(card);
    } catch (error) {
      throw toReadableError(error);
    } finally {
      await this.cancel();
    }
  }

  async readWriteCard(transform: (card: MbcCard) => MbcCard): Promise<MbcCard> {
    await this.ensureStarted();
    try {
      await this.requestNdefTechnology();
      const card = await this.readCardFromActiveSession();
      const updated = transform(card);
      await this.writeToActiveSession(updated);
      return updated;
    } catch (error) {
      throw toReadableError(error);
    } finally {
      await this.cancel();
    }
  }

  async registerCard(card: MbcCard): Promise<void> {
    await this.ensureStarted();
    try {
      await this.requestNdefTechnology();

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
      throw toReadableError(error);
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

  private async writeToActiveSession(card: MbcCard): Promise<void> {
    this.writeCounter++;
    const shieldResult = encrypt(card, this.writeCounter);
    if (!shieldResult.ok) {
      throw new CardRepositoryError(
        'TAMPERED_CARD',
        `Payload error: ${shieldResult.error}`,
      );
    }

    const envelope = shieldResult.value;
    if (envelope.length > NTAG215_USER_MEMORY) {
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
        'TAMPERED_CARD',
        'Card payload is not a valid MBC Silent Shield envelope.',
      );
    }

    const decryptResult = decrypt(payloadBytes);
    if (!decryptResult.ok) {
      throw new CardRepositoryError(
        'TAMPERED_CARD',
        'Card data is invalid or modified. Please go to Station.',
      );
    }

    this.writeCounter = decryptResult.value.writeCounter;
    return decryptResult.value.card;
  }
}
