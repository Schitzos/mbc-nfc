import type { MbcCard } from '../entities/mbc-card';

export interface MbcCardRepository {
  isSupported(): Promise<boolean>;
  readCard(): Promise<MbcCard>;
  writeCard(card: MbcCard): Promise<void>;
  cancel(): Promise<void>;
}
