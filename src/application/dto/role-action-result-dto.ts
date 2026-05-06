import type { MbcRole } from '../../domain/entities/mbc-card';
import type { CardSummaryDto } from './card-summary-dto';

export type RoleActionResultDto = {
  success: boolean;
  role: MbcRole;
  message: string;
  card?: CardSummaryDto;
  chargedHours?: number;
  chargedAmount?: number;
};
