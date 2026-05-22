import type { MbcCard } from '@domain/membership/entities/membership-card';
import type { BenefitActivityType } from '@domain/membership/types/card-status';
import type { CardWriter } from '@domain/membership/repositories/membership-card.repository';
import { applyCheckInState } from '@domain/membership/policies/activity-state-policy';
import {
  appendTransactionLog,
  createTransactionLog,
} from '@domain/membership/policies/transaction-log-policy';
import { isCardRepositoryError } from '@domain/membership/errors/membership-card-repository-error';
import { isDomainError } from '@domain/membership/errors/domain-error';
import { createRandomId } from '@shared/utils/create-random-id';
import type {
  RoleActionErrorCode,
  RoleActionResultDto,
} from '@application/dto/role-action-result-dto';
import { toCardSummaryDto } from '@application/dto/card-summary-mapper';
import { type Clock, systemClock } from '@shared/ports/clock';

export type CheckInActivityRequest = {
  activityId: string;
  activityType: BenefitActivityType;
  checkedInAt?: string;
  isSimulation?: boolean;
};

function createCheckInLog(
  card: MbcCard,
  occurredAt: string,
  isSimulation?: boolean,
): MbcCard {
  return appendTransactionLog(
    card,
    createTransactionLog({
      id: createRandomId('LOG'),
      activity: 'CHECK_IN',
      nominal: 0,
      occurredAt,
      isSimulation,
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
  cardRepository: CardWriter,
  clock: Clock = systemClock,
): CheckInActivityUseCase {
  return {
    async execute({
      activityId,
      activityType,
      checkedInAt,
      isSimulation,
    }: CheckInActivityRequest): Promise<RoleActionResultDto> {
      const occurredAt = checkedInAt ?? clock().toISOString();

      if (checkedInAt) {
        const checkedInDate = new Date(checkedInAt);
        if (checkedInDate.getTime() > clock().getTime()) {
          return {
            success: false,
            role: 'GATE',
            message: 'Simulation time cannot be in the future.',
          };
        }
      }

      try {
        const updatedCard = await cardRepository.readWriteCard(card => {
          const checkedInCard = applyCheckInState(card, {
            activityId,
            activityType,
            checkedInAt: occurredAt,
            isSimulation,
          });
          return createCheckInLog(checkedInCard, occurredAt, isSimulation);
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
