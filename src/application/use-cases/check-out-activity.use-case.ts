import type { ActivityTariffRule } from '../../domain/entities/mbc-card';
import type { MbcCardRepository } from '../../domain/repositories/mbc-card-repository';
import { CardRepositoryError } from '../../domain/errors/card-repository-error';
import { DomainError } from '../../domain/errors/domain-error';
import { applyCheckOutState } from '../../domain/services/activity-state-policy';
import { calculateActivityTariff } from '../../domain/services/activity-tariff-calculator';
import {
  appendTransactionLog,
  createTransactionLog,
} from '../../domain/services/transaction-log-policy';
import { createRandomId } from '../../shared/utils/create-random-id';
import type { RoleActionResultDto } from '../dto/role-action-result-dto';
import { toCardSummaryDto } from '../dto/card-summary-mapper';

export type CheckOutActivityRequest = {
  tariffRule: ActivityTariffRule;
  checkedOutAt?: string;
};

export class CheckOutActivityUseCase {
  constructor(private readonly cardRepository: MbcCardRepository) {}

  async execute({
    tariffRule,
    checkedOutAt,
  }: CheckOutActivityRequest): Promise<RoleActionResultDto> {
    const occurredAt = checkedOutAt ?? new Date().toISOString();

    try {
      const card = await this.cardRepository.readCard();

      if (!card.activeSession) {
        return {
          success: false,
          role: 'TERMINAL',
          message:
            'Card does not have an active activity session to check out.',
        };
      }

      const tariffResult = calculateActivityTariff({
        checkedInAt: card.activeSession.checkedInAt,
        checkedOutAt: occurredAt,
        rule: tariffRule,
      });

      const checkedOutCard = applyCheckOutState(card, {
        chargedAmount: tariffResult.chargedAmount,
      });

      const updatedCard = appendTransactionLog(
        checkedOutCard,
        createTransactionLog({
          id: createRandomId('LOG'),
          activity: 'CHECK_OUT',
          nominal: tariffResult.chargedAmount,
          occurredAt,
        }),
      );

      await this.cardRepository.writeCard(updatedCard);

      return {
        success: true,
        role: 'TERMINAL',
        message: 'Card checked out successfully.',
        chargedHours: tariffResult.chargedHours,
        chargedAmount: tariffResult.chargedAmount,
        card: toCardSummaryDto(updatedCard),
      };
    } catch (error) {
      if (error instanceof CardRepositoryError) {
        return {
          success: false,
          role: 'TERMINAL',
          message: error.message,
        };
      }

      if (error instanceof DomainError) {
        return {
          success: false,
          role: 'TERMINAL',
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
