import type {
  ActivitySession,
  BenefitActivityType,
  MbcCard,
} from '@domain/entities/mbc-card';
import { createDomainError } from '@domain/errors/domain-error';

interface CheckInInput {
  activityId: string;
  activityType: BenefitActivityType;
  checkedInAt: string;
}

interface CheckOutInput {
  chargedAmount: number;
}

function parseIsoDate(value: string): void {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw createDomainError(
      'INVALID_TIMESTAMP',
      'Activity timestamps must be valid ISO date strings.',
    );
  }
}

function cloneCard(card: MbcCard): MbcCard {
  return {
    ...card,
    member: { ...card.member },
    activeSession: card.activeSession ? { ...card.activeSession } : undefined,
    transactionLogs: [...card.transactionLogs],
  };
}

function createActivitySession(input: CheckInInput): ActivitySession {
  parseIsoDate(input.checkedInAt);

  return {
    activityId: input.activityId,
    activityType: input.activityType,
    checkedInAt: input.checkedInAt,
  };
}

export function applyCheckInState(card: MbcCard, input: CheckInInput): MbcCard {
  if (card.visitStatus !== 'NOT_CHECKED_IN') {
    throw createDomainError(
      'CARD_ALREADY_CHECKED_IN',
      'Card is already checked in and cannot start another activity.',
    );
  }

  if (card.activeSession) {
    throw createDomainError(
      'ACTIVE_SESSION_EXISTS',
      'Card already has an active activity session and cannot start another one.',
    );
  }

  const nextCard = cloneCard(card);
  nextCard.visitStatus = 'CHECKED_IN';
  nextCard.activeSession = createActivitySession(input);
  return nextCard;
}

export function applyCheckOutState(
  card: MbcCard,
  input: CheckOutInput,
): MbcCard {
  if (card.visitStatus !== 'CHECKED_IN') {
    throw createDomainError(
      'CARD_NOT_CHECKED_IN',
      'Card is not currently checked in and cannot be checked out.',
    );
  }

  if (!card.activeSession) {
    throw createDomainError(
      'ACTIVE_SESSION_MISSING',
      'Card must have an active activity session before checkout.',
    );
  }

  if (card.balance < input.chargedAmount) {
    throw createDomainError(
      'INSUFFICIENT_BALANCE',
      'Card balance is insufficient for the requested checkout.',
    );
  }

  const nextCard = cloneCard(card);
  nextCard.balance = nextCard.balance - input.chargedAmount;
  nextCard.visitStatus = 'NOT_CHECKED_IN';
  nextCard.activeSession = undefined;
  return nextCard;
}
