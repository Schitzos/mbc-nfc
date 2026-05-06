import type { MbcCard } from '../../domain/entities/mbc-card';
import { maskMemberReference } from '../../shared/utils/mask-member-reference';
import type { CardSummaryDto } from './card-summary-dto';

export function toCardSummaryDto(card: MbcCard): CardSummaryDto {
  return {
    cardId: card.cardId,
    memberName: card.member.displayName,
    maskedMemberReference: maskMemberReference(card.member.memberId),
    balance: card.balance,
    currency: card.currency,
    visitStatus: card.visitStatus,
    activeSession: card.activeSession ? { ...card.activeSession } : undefined,
    transactionLogs: [...card.transactionLogs],
  };
}
