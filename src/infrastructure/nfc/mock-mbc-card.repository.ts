import type {
  MbcCard,
  BenefitActivityType,
} from '../../domain/entities/mbc-card';
import type { MbcCardRepository } from '../../domain/repositories/mbc-card-repository';
import { CardRepositoryError } from '../../domain/errors/card-repository-error';

export type MockCardScenario =
  | 'normal'
  | 'low-balance'
  | 'checked-in'
  | 'checked-in-generic'
  | 'checked-in-low-balance'
  | 'unregistered'
  | 'tampered';

type MockCardState =
  | {
      kind: 'registered';
      card: MbcCard;
    }
  | {
      kind: 'unregistered';
    }
  | {
      kind: 'tampered';
    };

function createRegisteredCard(params: {
  cardId: string;
  memberId: string;
  balance: number;
  visitStatus?: MbcCard['visitStatus'];
  activityType?: BenefitActivityType;
  activityId?: string;
  checkedInAt?: string;
}): MbcCard {
  const twoHoursAgoIso = new Date(
    Date.now() - 2 * 60 * 60 * 1000,
  ).toISOString();
  return {
    version: 1,
    cardId: params.cardId,
    member: {
      memberId: params.memberId,
    },
    balance: params.balance,
    currency: 'IDR',
    visitStatus: params.visitStatus ?? 'NOT_CHECKED_IN',
    activeSession:
      params.visitStatus === 'CHECKED_IN'
        ? {
            activityId: params.activityId ?? 'parking-main-gate',
            activityType: params.activityType ?? 'PARKING',
            checkedInAt: params.checkedInAt ?? twoHoursAgoIso,
          }
        : undefined,
    transactionLogs: [],
  };
}

function cloneCard(card: MbcCard): MbcCard {
  return {
    ...card,
    member: { ...card.member },
    activeSession: card.activeSession ? { ...card.activeSession } : undefined,
    transactionLogs: [...card.transactionLogs],
  };
}

function createScenarioState(scenario: MockCardScenario): MockCardState {
  switch (scenario) {
    case 'normal':
      return {
        kind: 'registered',
        card: createRegisteredCard({
          cardId: 'CARD-NORMAL-001',
          memberId: 'MEM-NORMAL-001',
          balance: 50000,
        }),
      };
    case 'low-balance':
      return {
        kind: 'registered',
        card: createRegisteredCard({
          cardId: 'CARD-LOW-001',
          memberId: 'MEM-LOW-001',
          balance: 1000,
        }),
      };
    case 'checked-in':
      return {
        kind: 'registered',
        card: createRegisteredCard({
          cardId: 'CARD-CHECKED-IN-001',
          memberId: 'MEM-CHECKED-IN-001',
          balance: 12000,
          visitStatus: 'CHECKED_IN',
        }),
      };
    case 'checked-in-generic':
      return {
        kind: 'registered',
        card: createRegisteredCard({
          cardId: 'CARD-CHECKED-IN-GENERIC-001',
          memberId: 'MEM-CHECKED-IN-GENERIC-001',
          balance: 12000,
          visitStatus: 'CHECKED_IN',
          activityType: 'GENERIC',
          activityId: 'co-working',
        }),
      };
    case 'checked-in-low-balance':
      return {
        kind: 'registered',
        card: createRegisteredCard({
          cardId: 'CARD-CHECKED-IN-LOW-001',
          memberId: 'MEM-CHECKED-IN-LOW-001',
          balance: 1000,
          visitStatus: 'CHECKED_IN',
        }),
      };
    case 'unregistered':
      return { kind: 'unregistered' };
    case 'tampered':
      return { kind: 'tampered' };
    default:
      return {
        kind: 'registered',
        card: createRegisteredCard({
          cardId: 'CARD-NORMAL-001',
          memberId: 'MEM-NORMAL-001',
          balance: 50000,
        }),
      };
  }
}

export class MockMbcCardRepository implements MbcCardRepository {
  private scenario: MockCardScenario = 'normal';

  private state: MockCardState = createScenarioState('normal');

  async isSupported(): Promise<boolean> {
    return true;
  }

  async readCard(): Promise<MbcCard> {
    if (this.state.kind === 'unregistered') {
      throw new CardRepositoryError(
        'UNREGISTERED_CARD',
        'Card is not registered yet. Register it first at Station.',
      );
    }

    if (this.state.kind === 'tampered') {
      throw new CardRepositoryError(
        'TAMPERED_CARD',
        'Card payload is invalid or tampered and cannot be processed.',
      );
    }

    return cloneCard(this.state.card);
  }

  async writeCard(card: MbcCard): Promise<void> {
    this.state = {
      kind: 'registered',
      card: cloneCard(card),
    };
  }

  async cancel(): Promise<void> {
    return Promise.resolve();
  }

  setScenario(scenario: MockCardScenario): void {
    this.scenario = scenario;
    this.state = createScenarioState(scenario);
  }

  getScenario(): MockCardScenario {
    return this.scenario;
  }
}
