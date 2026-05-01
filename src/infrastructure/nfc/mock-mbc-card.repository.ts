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
            checkedInAt: params.checkedInAt ?? '2026-05-01T08:00:00.000Z',
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

const scenarioSeedMap: Record<MockCardScenario, MockCardState> = {
  normal: {
    kind: 'registered',
    card: createRegisteredCard({
      cardId: 'CARD-NORMAL-001',
      memberId: 'MEM-NORMAL-001',
      balance: 50000,
    }),
  },
  'low-balance': {
    kind: 'registered',
    card: createRegisteredCard({
      cardId: 'CARD-LOW-001',
      memberId: 'MEM-LOW-001',
      balance: 1000,
    }),
  },
  'checked-in': {
    kind: 'registered',
    card: createRegisteredCard({
      cardId: 'CARD-CHECKED-IN-001',
      memberId: 'MEM-CHECKED-IN-001',
      balance: 12000,
      visitStatus: 'CHECKED_IN',
    }),
  },
  'checked-in-generic': {
    kind: 'registered',
    card: createRegisteredCard({
      cardId: 'CARD-CHECKED-IN-GENERIC-001',
      memberId: 'MEM-CHECKED-IN-GENERIC-001',
      balance: 12000,
      visitStatus: 'CHECKED_IN',
      activityType: 'GENERIC',
      activityId: 'co-working',
    }),
  },
  'checked-in-low-balance': {
    kind: 'registered',
    card: createRegisteredCard({
      cardId: 'CARD-CHECKED-IN-LOW-001',
      memberId: 'MEM-CHECKED-IN-LOW-001',
      balance: 1000,
      visitStatus: 'CHECKED_IN',
    }),
  },
  unregistered: {
    kind: 'unregistered',
  },
  tampered: {
    kind: 'tampered',
  },
};

export class MockMbcCardRepository implements MbcCardRepository {
  private scenario: MockCardScenario = 'normal';

  private state: MockCardState = scenarioSeedMap.normal;

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
    const seed = scenarioSeedMap[scenario];
    this.state =
      seed.kind === 'registered'
        ? { kind: 'registered', card: cloneCard(seed.card) }
        : seed;
  }

  getScenario(): MockCardScenario {
    return this.scenario;
  }
}
