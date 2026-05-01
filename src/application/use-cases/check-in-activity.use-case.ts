import type {
  BenefitActivityType,
  MbcCard,
} from '../../domain/entities/mbc-card';
import type { MbcCardRepository } from '../../domain/repositories/mbc-card-repository';
import { applyCheckInState } from '../../domain/services/activity-state-policy';
import {
  appendTransactionLog,
  createTransactionLog,
} from '../../domain/services/transaction-log-policy';
import { CardRepositoryError } from '../../domain/errors/card-repository-error';
import { DomainError } from '../../domain/errors/domain-error';
import { createRandomId } from '../../shared/utils/create-random-id';
import type { RoleActionResultDto } from '../dto/role-action-result-dto';
import { toCardSummaryDto } from '../dto/card-summary-mapper';

export type CheckInActivityRequest = {
  activityId: string;
  activityType: BenefitActivityType;
  simulatedCheckedInAt?: string;
};

function createCheckInLog(card: MbcCard, occurredAt: string): MbcCard {
  return appendTransactionLog(
    card,
    createTransactionLog({
      id: createRandomId('LOG'),
      activity: 'CHECK_IN',
      nominal: 0,
      occurredAt,
    }),
  );
}

export class CheckInActivityUseCase {
  constructor(private readonly cardRepository: MbcCardRepository) {}

  async execute({
    activityId,
    activityType,
    simulatedCheckedInAt,
  }: CheckInActivityRequest): Promise<RoleActionResultDto> {
    const occurredAt = simulatedCheckedInAt ?? new Date().toISOString();

    try {
      const card = await this.cardRepository.readCard();
      const checkedInCard = applyCheckInState(card, {
        activityId,
        activityType,
        checkedInAt: occurredAt,
      });
      const updatedCard = createCheckInLog(checkedInCard, occurredAt);

      await this.cardRepository.writeCard(updatedCard);

      return {
        success: true,
        role: 'GATE',
        message: simulatedCheckedInAt
          ? 'Card checked in successfully with a simulation timestamp.'
          : 'Card checked in successfully.',
        card: toCardSummaryDto(updatedCard),
      };
    } catch (error) {
      if (
        error instanceof CardRepositoryError ||
        error instanceof DomainError
      ) {
        return {
          success: false,
          role: 'GATE',
          message: error.message,
        };
      }

      throw error;
    }
  }
}
