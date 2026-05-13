import type { MbcActivity } from '../types/card-status';

export type TransactionLog = {
  id: string;
  activity: MbcActivity;
  nominal: number;
  occurredAt: string;
};
