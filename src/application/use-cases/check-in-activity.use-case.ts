import type { BenefitActivityType, MbcCard } from '@domain/entities/mbc-card';
import type { MbcCardRepository } from '@domain/repositories/mbc-card-repository';
import { applyCheckInState } from '@domain/services/activity-state-policy';
import {
  appendTransactionLog,
  createTransactionLog,
} from '@domain/services/transaction-log-policy';
import { CardRepositoryError } from '@domain/errors/card-repository-error';
import { DomainError } from '@domain/errors/domain-error';
import { createRandomId } from '@shared/utils/create-random-id';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';
import { toCardSummaryDto } from '@application/dto/card-summary-mapper';

export type CheckInActivityRequest = {
  activityId: string;
  activityType: BenefitActivityType;
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
  }: CheckInActivityRequest): Promise<RoleActionResultDto> {
    const occurredAt = new Date().toISOString();

    try {
      const updatedCard = await this.cardRepository.readWriteCard(card => {
        const checkedInCard = applyCheckInState(card, {
          activityId,
          activityType,
          checkedInAt: occurredAt,
        });
        return createCheckInLog(checkedInCard, occurredAt);
      });

      return {
        success: true,
        role: 'GATE',
        message: 'Card checked in successfully.',
        card: toCardSummaryDto(updatedCard),
      };
    } catch (error) {
      if (
        error instanceof CardRepositoryError ||
        error instanceof DomainError
      ) {
        const errorCode =
          error instanceof DomainError &&
          (error.code === 'CARD_ALREADY_CHECKED_IN' ||
            error.code === 'ACTIVE_SESSION_EXISTS')
            ? 'ALREADY_CHECKED_IN'
            : error instanceof CardRepositoryError &&
                error.code === 'CARD_TAMPERED'
              ? 'CARD_TAMPERED'
              : error instanceof CardRepositoryError &&
                  error.code === 'UNREGISTERED_CARD'
                ? 'UNREGISTERED_CARD'
                : 'GENERIC_FAILURE';
        return {
          success: false,
          role: 'GATE',
          message: error.message,
          errorCode,
        };
      }

      throw error;
    }
  }
}
