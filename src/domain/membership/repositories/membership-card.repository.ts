import type { MbcCard } from '../entities/membership-card';

export interface CardReader {
  readCard(): Promise<MbcCard>;
  cancel(): Promise<void>;
}

export interface CardWriter {
  writeCard(card: MbcCard): Promise<void>;
  readWriteCard(transform: (card: MbcCard) => MbcCard): Promise<MbcCard>;
  registerCard(card: MbcCard): Promise<void>;
  cancel(): Promise<void>;
}

export interface NfcCapabilityChecker {
  isSupported(): Promise<boolean>;
}

export interface MbcCardRepository
  extends CardReader, CardWriter, NfcCapabilityChecker {}
