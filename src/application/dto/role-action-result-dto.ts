import type { MbcRole } from '@domain/membership/types/card-status';
import type { CardSummaryDto } from './card-summary-dto';

export type RoleActionErrorCode =
  | 'INSUFFICIENT_BALANCE'
  | 'ALREADY_CHECKED_IN'
  | 'CARD_TAMPERED'
  | 'CARD_UNSUPPORTED'
  | 'UNREGISTERED_CARD'
  | 'SCAN_TIMEOUT'
  | 'READ_FAILED'
  | 'WRITE_FAILED'
  | 'GENERIC_FAILURE';

export type RoleActionResultDto = {
  success: boolean;
  role: MbcRole;
  message: string;
  errorCode?: RoleActionErrorCode;
  card?: CardSummaryDto;
  chargedHours?: number;
  chargedAmount?: number;
  durationMs?: number;
  requiresReset?: boolean;
};
