import { toCardSummaryDto } from '@application/dto/card-summary-mapper';
import type { MbcCard } from '@domain/membership/entities/membership-card';

describe('toCardSummaryDto', () => {
  const baseCard: MbcCard = {
    version: 1,
    cardId: 'CARD-001',
    member: { memberId: 'MEM-LONG-ID-1234' },
    balance: 50000,
    currency: 'IDR',
    visitStatus: 'NOT_CHECKED_IN',
    transactionLogs: [
      {
        id: 'LOG-001',
        activity: 'TOP_UP',
        nominal: 50000,
        occurredAt: '2026-05-01T08:00:00.000Z',
      },
    ],
  };

  it('maps card to summary DTO with masked member reference', () => {
    const dto = toCardSummaryDto(baseCard);

    expect(dto.cardId).toBe('CARD-001');
    expect(dto.maskedMemberReference).toBe('MBC-***-1234');
    expect(dto.balance).toBe(50000);
    expect(dto.currency).toBe('IDR');
    expect(dto.visitStatus).toBe('NOT_CHECKED_IN');
    expect(dto.transactionLogs).toHaveLength(1);
  });

  it('does not expose full member ID in the DTO', () => {
    const dto = toCardSummaryDto(baseCard);

    expect(dto.maskedMemberReference).not.toContain('MEM-LONG-ID');
    expect(dto.maskedMemberReference).toContain('***');
  });

  it('includes displayName when present', () => {
    const cardWithName: MbcCard = {
      ...baseCard,
      member: { memberId: 'MEM-001', displayName: 'John' },
    };

    const dto = toCardSummaryDto(cardWithName);
    expect(dto.memberName).toBe('John');
  });

  it('returns undefined memberName when not set', () => {
    const dto = toCardSummaryDto(baseCard);
    expect(dto.memberName).toBeUndefined();
  });

  it('includes activeSession when card is checked in', () => {
    const checkedInCard: MbcCard = {
      ...baseCard,
      visitStatus: 'CHECKED_IN',
      activeSession: {
        activityId: 'parking-main-gate',
        activityType: 'PARKING',
        checkedInAt: '2026-05-01T08:00:00.000Z',
      },
    };

    const dto = toCardSummaryDto(checkedInCard);
    expect(dto.activeSession).toEqual({
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
      checkedInAt: '2026-05-01T08:00:00.000Z',
    });
  });

  it('returns undefined activeSession when not checked in', () => {
    const dto = toCardSummaryDto(baseCard);
    expect(dto.activeSession).toBeUndefined();
  });

  it('returns a copy of transactionLogs (not a reference)', () => {
    const dto = toCardSummaryDto(baseCard);
    dto.transactionLogs.push({
      id: 'LOG-NEW',
      activity: 'REGISTER',
      nominal: 0,
      occurredAt: '2026-05-02T08:00:00.000Z',
    });

    expect(baseCard.transactionLogs).toHaveLength(1);
  });
});
