import type { MbcCardRepository } from '@domain/repositories/mbc-card-repository';
import { isCardRepositoryError } from '@domain/errors/card-repository-error';
import { createDomainError, isDomainError } from '@domain/errors/domain-error';
import { applyCheckOutState } from '@domain/services/activity-state-policy';
import { calculateActivityTariff } from '@domain/services/activity-tariff-calculator';
import {
  appendTransactionLog,
  createTransactionLog,
} from '@domain/services/transaction-log-policy';
import { createRandomId } from '@shared/utils/create-random-id';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';
import { toCardSummaryDto } from '@application/dto/card-summary-mapper';
import type { LocalLedgerRepository } from '@domain/repositories/local-ledger-repository';
import { maskMemberReference } from '@shared/utils/mask-member-reference';
import type { BenefitActivityType } from '@domain/entities/mbc-card';

export type CheckOutActivityRequest = {
  checkedOutAt?: string;
};

export type CheckOutActivityUseCase = {
  execute: (request?: CheckOutActivityRequest) => Promise<RoleActionResultDto>;
};

export function createCheckOutActivityUseCase(
  cardRepository: MbcCardRepository,
  localLedgerRepository?: LocalLedgerRepository,
): CheckOutActivityUseCase {
  return {
    async execute({
      checkedOutAt,
    }: CheckOutActivityRequest = {}): Promise<RoleActionResultDto> {
      const occurredAt = checkedOutAt ?? new Date().toISOString();

      try {
        let tariffResult = { chargedAmount: 0, chargedHours: 0, durationMs: 0 };
        let sessionActivityType: BenefitActivityType = 'PARKING';

        const updatedCard = await cardRepository.readWriteCard(card => {
          if (!card.activeSession) {
            throw createDomainError(
              'ACTIVE_SESSION_MISSING',
              'Card does not have an active activity session to check out.',
            );
          }

          sessionActivityType = card.activeSession.activityType;
          tariffResult = calculateActivityTariff({
            checkedInAt: card.activeSession.checkedInAt,
            checkedOutAt: occurredAt,
          });

          const checkedOutCard = applyCheckOutState(card, {
            chargedAmount: tariffResult.chargedAmount,
          });

          return appendTransactionLog(
            checkedOutCard,
            createTransactionLog({
              id: createRandomId('LOG'),
              activity: 'CHECK_OUT',
              nominal: tariffResult.chargedAmount,
              occurredAt,
            }),
          );
        });

        let message = 'Card checked out successfully.';

        if (localLedgerRepository) {
          try {
            await localLedgerRepository.append({
              id: createRandomId('LEDGER'),
              role: 'TERMINAL',
              action: 'CHECK_OUT',
              maskedMemberReference: maskMemberReference(
                updatedCard.member.memberId,
              ),
              activityType: sessionActivityType,
              amount: tariffResult.chargedAmount,
              occurredAt,
            });
          } catch {
            message =
              'Card checked out successfully, but the local audit ledger could not be updated.';
          }
        }

        return {
          success: true,
          role: 'TERMINAL',
          message,
          chargedHours: tariffResult.chargedHours,
          chargedAmount: tariffResult.chargedAmount,
          durationMs: tariffResult.durationMs,
          card: toCardSummaryDto(updatedCard),
        };
      } catch (error) {
        if (isCardRepositoryError(error)) {
          return {
            success: false,
            role: 'TERMINAL',
            message: error.message,
            errorCode:
              error.code === 'CARD_TAMPERED'
                ? 'CARD_TAMPERED'
                : error.code === 'UNREGISTERED_CARD'
                  ? 'UNREGISTERED_CARD'
                  : 'GENERIC_FAILURE',
          };
        }

        if (isDomainError(error)) {
          return {
            success: false,
            role: 'TERMINAL',
            errorCode:
              error.code === 'INSUFFICIENT_BALANCE'
                ? 'INSUFFICIENT_BALANCE'
                : 'GENERIC_FAILURE',
            message:
              error.code === 'INSUFFICIENT_BALANCE'
                ? 'Insufficient balance. Direct the member to top up at Station before checkout.'
                : error.message,
          };
        }

        throw error;
      }
    },
  };
}
