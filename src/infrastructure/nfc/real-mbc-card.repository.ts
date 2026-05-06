import { Buffer } from 'buffer';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import type { MbcCard } from '../../domain/entities/mbc-card';
import type { MbcCardRepository } from '../../domain/repositories/mbc-card-repository';
import { CardRepositoryError } from '../../domain/errors/card-repository-error';
import { encrypt, decrypt, isMbcEnvelope } from './silent-shield';

const NTAG215_USER_MEMORY = 504;

type NdefRecord = {
  tnf: number;
  type: number[] | Uint8Array;
  payload: number[] | Uint8Array;
};

type NdefTag = {
  ndefMessage?: NdefRecord[];
};

function toReadableError(error: unknown): CardRepositoryError {
  if (error instanceof CardRepositoryError) {
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
      console.log('[NFC:repo] requestTechnology for read...');
      await this.requestNdefTechnology();
      console.log('[NFC:repo] technology acquired, reading...');
      return await this.readCardFromActiveSession();
    } catch (error) {
      console.log('[NFC:repo] readCard error:', error);
      throw toReadableError(error);
    } finally {
      await this.cancel();
    }
  }

  async writeCard(card: MbcCard): Promise<void> {
    await this.ensureStarted();
    try {
      console.log('[NFC:repo] requestTechnology for write...');
      await this.requestNdefTechnology();
      console.log('[NFC:repo] technology acquired, encrypting...');
      await this.writeToActiveSession(card);
    } catch (error) {
      console.log('[NFC:repo] writeCard error:', error);
      throw toReadableError(error);
    } finally {
      await this.cancel();
    }
  }

  async registerCard(card: MbcCard): Promise<void> {
    await this.ensureStarted();
    try {
      console.log('[NFC:repo] requestTechnology for register...');
      await this.requestNdefTechnology();
      console.log('[NFC:repo] technology acquired, checking existing data...');

      // Check if card already has valid MBC data
      const currentTag = (await NfcManager.getTag()) as NdefTag | null;
      console.log(
        '[NFC:repo] getTag result:',
        currentTag ? 'has tag' : 'null',
        'ndefMessage:',
        currentTag?.ndefMessage?.length ?? 0,
      );

      if (currentTag?.ndefMessage?.length) {
        const rawPayload = currentTag.ndefMessage[0].payload;
        console.log(
          '[NFC:repo] payload type:',
          typeof rawPayload,
          'length:',
          rawPayload?.length ?? 0,
        );
        const payloadBytes = Buffer.from(rawPayload ?? []);
        console.log('[NFC:repo] buffer created, length:', payloadBytes.length);
        if (isMbcEnvelope(payloadBytes)) {
          const decryptResult = decrypt(payloadBytes);
          if (decryptResult.ok) {
            throw new CardRepositoryError(
              'ALREADY_REGISTERED_CARD',
              'This card is already registered. Use a blank card or reset first.',
            );
          }
        }
      }

      console.log('[NFC:repo] card is blank/unregistered, writing...');
      await this.writeToActiveSession(card);
    } catch (error) {
      console.log('[NFC:repo] registerCard error:', error);
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
      Ndef.record(
        Ndef.TNF_MIME_MEDIA,
        Array.from(Buffer.from(mimeType, 'ascii')),
        [],
        Array.from(envelope),
      ),
    ]);

    if (!encoded) {
      throw new CardRepositoryError(
        'NFC_UNAVAILABLE',
        'NFC payload could not be encoded for writing.',
      );
    }

    await NfcManager.ndefHandler.writeNdefMessage(encoded);
    console.log('[NFC:repo] write complete!');
  }

  private async readCardFromActiveSession(): Promise<MbcCard> {
    const currentTag = (await NfcManager.getTag()) as NdefTag | null;
    if (!currentTag?.ndefMessage?.length) {
      throw new CardRepositoryError(
        'UNREGISTERED_CARD',
        'Card is blank or not registered yet.',
      );
    }

    const firstRecord = currentTag.ndefMessage[0];
    const payloadBytes = Buffer.from(firstRecord.payload ?? []);

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
