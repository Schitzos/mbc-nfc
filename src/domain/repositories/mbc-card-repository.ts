import type { MbcCard } from '@domain/entities/mbc-card';

export interface MbcCardRepository {
  isSupported(): Promise<boolean>;
  readCard(): Promise<MbcCard>;
  writeCard(card: MbcCard): Promise<void>;
  readWriteCard(transform: (card: MbcCard) => MbcCard): Promise<MbcCard>;
  registerCard(card: MbcCard): Promise<void>;
  cancel(): Promise<void>;
}
