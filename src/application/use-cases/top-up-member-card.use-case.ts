import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';
import type { CardWriter } from '@domain/membership/repositories/membership-card.repository';
import { isCardRepositoryError } from '@domain/membership/errors/membership-card-repository-error';
import {
  isDomainError,
  createDomainError,
} from '@domain/membership/errors/domain-error';
import {
  createTransactionLog,
  appendTransactionLog,
} from '@domain/membership/policies/transaction-log-policy';
import { createRandomId } from '@shared/utils/create-random-id';
import { toCardSummaryDto } from '@application/dto/card-summary-mapper';
import type { LocalLedgerRepository } from '@domain/membership/repositories/ledger.repository';
import { maskMemberReference } from '@shared/utils/mask-member-reference';
import { MAX_CARD_BALANCE } from '@domain/membership/config/balance-limits';
import { type Clock, systemClock } from '@shared/ports/clock';

export interface TopUpMemberCardRequest {
  amount: number;
}

export type TopUpMemberCardUseCase = {
  execute: (request: TopUpMemberCardRequest) => Promise<RoleActionResultDto>;
};

export function createTopUpMemberCardUseCase(
  cardRepository: CardWriter,
  localLedgerRepository?: LocalLedgerRepository,
  clock: Clock = systemClock,
): TopUpMemberCardUseCase {
  return {
    async execute({
      amount,
    }: TopUpMemberCardRequest): Promise<RoleActionResultDto> {
      if (!Number.isFinite(amount) || amount <= 0) {
        return {
          success: false,
          role: 'STATION',
          message: 'Top-up amount must be a positive number.',
        };
      }

      try {
        const nextCard = await cardRepository.readWriteCard(card => {
          if (card.balance + amount > MAX_CARD_BALANCE) {
            throw createDomainError(
              'BALANCE_CAP_EXCEEDED',
              `Top-up rejected. Resulting balance would exceed the maximum allowed balance of Rp 5.000.000.`,
            );
          }
          return appendTransactionLog(
            { ...card, balance: card.balance + amount },
            createTransactionLog({
              id: createRandomId('LOG'),
              activity: 'TOP_UP',
              nominal: amount,
              occurredAt: clock().toISOString(),
            }),
          );
        });

        let message = 'Top-up completed successfully.';

        if (localLedgerRepository) {
          try {
            await localLedgerRepository.append({
              id: createRandomId('LEDGER'),
              role: 'STATION',
              action: 'TOP_UP',
              maskedMemberReference: maskMemberReference(
                nextCard.member.memberId,
              ),
              amount,
              occurredAt: clock().toISOString(),
            });
          } catch {
            message =
              'Top-up completed, but the local audit ledger could not be updated.';
          }
        }

        return {
          success: true,
          role: 'STATION',
          message,
          card: toCardSummaryDto(nextCard),
        };
      } catch (error) {
        if (isDomainError(error)) {
          return {
            success: false,
            role: 'STATION',
            message: error.message,
          };
        }

        if (isCardRepositoryError(error)) {
          return {
            success: false,
            role: 'STATION',
            message: error.message,
          };
        }

        throw error;
      }
    },
  };
}
