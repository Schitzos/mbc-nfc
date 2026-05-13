import type { BenefitActivityType, MbcCard } from '@domain/entities/mbc-card';
import type { MbcCardRepository } from '@domain/repositories/mbc-card-repository';
import { applyCheckInState } from '@domain/services/activity-state-policy';
import {
  appendTransactionLog,
  createTransactionLog,
} from '@domain/services/transaction-log-policy';
import { isCardRepositoryError } from '@domain/errors/card-repository-error';
import { isDomainError } from '@domain/errors/domain-error';
import { createRandomId } from '@shared/utils/create-random-id';
import type {
  RoleActionErrorCode,
  RoleActionResultDto,
} from '@application/dto/role-action-result-dto';
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

export type CheckInActivityUseCase = {
  execute: (request: CheckInActivityRequest) => Promise<RoleActionResultDto>;
};

function mapCheckInErrorCode(error: unknown): RoleActionErrorCode {
  if (
    isDomainError(error) &&
    (error.code === 'CARD_ALREADY_CHECKED_IN' ||
      error.code === 'ACTIVE_SESSION_EXISTS')
  ) {
    return 'ALREADY_CHECKED_IN';
  }
  if (isCardRepositoryError(error) && error.code === 'CARD_TAMPERED') {
    return 'CARD_TAMPERED';
  }
  if (isCardRepositoryError(error) && error.code === 'UNREGISTERED_CARD') {
    return 'UNREGISTERED_CARD';
  }
  return 'GENERIC_FAILURE';
}

export function createCheckInActivityUseCase(
  cardRepository: MbcCardRepository,
): CheckInActivityUseCase {
  return {
    async execute({
      activityId,
      activityType,
    }: CheckInActivityRequest): Promise<RoleActionResultDto> {
      const occurredAt = new Date().toISOString();

      try {
        const updatedCard = await cardRepository.readWriteCard(card => {
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
        if (isCardRepositoryError(error) || isDomainError(error)) {
          return {
            success: false,
            role: 'GATE',
            message: error.message,
            errorCode: mapCheckInErrorCode(error),
          };
        }

        throw error;
      }
    },
  };
}
