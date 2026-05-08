import type { MbcCardRepository } from '@domain/repositories/mbc-card-repository';
import { CardRepositoryError } from '@domain/errors/card-repository-error';
import { DomainError } from '@domain/errors/domain-error';
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

export type CheckOutActivityRequest = {
  checkedOutAt?: string;
};

export class CheckOutActivityUseCase {
  constructor(
    private readonly cardRepository: MbcCardRepository,
    private readonly localLedgerRepository?: LocalLedgerRepository,
  ) {}

  async execute({
    checkedOutAt,
  }: CheckOutActivityRequest = {}): Promise<RoleActionResultDto> {
    const occurredAt = checkedOutAt ?? new Date().toISOString();

    try {
      let tariffResult = { chargedAmount: 0, chargedHours: 0, durationMs: 0 };
      let sessionActivityType: string = 'PARKING';

      const updatedCard = await this.cardRepository.readWriteCard(card => {
        if (!card.activeSession) {
          throw new DomainError(
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

      if (this.localLedgerRepository) {
        try {
          await this.localLedgerRepository.append({
            id: createRandomId('LEDGER'),
            role: 'TERMINAL',
            action: 'CHECK_OUT',
            maskedMemberReference: maskMemberReference(
              updatedCard.member.memberId,
            ),
            activityType: sessionActivityType as 'PARKING',
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
      if (error instanceof CardRepositoryError) {
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

      if (error instanceof DomainError) {
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
  }
}
