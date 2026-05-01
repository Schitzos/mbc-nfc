import type { RoleActionResultDto } from '../dto/role-action-result-dto';
import type { MbcCardRepository } from '../../domain/repositories/mbc-card-repository';
import { CardRepositoryError } from '../../domain/errors/card-repository-error';
import {
  createTransactionLog,
  appendTransactionLog,
} from '../../domain/services/transaction-log-policy';
import { createRandomId } from '../../shared/utils/create-random-id';
import { toCardSummaryDto } from '../dto/card-summary-mapper';

type TopUpMemberCardRequest = {
  amount: number;
};

export class TopUpMemberCardUseCase {
  constructor(private readonly cardRepository: MbcCardRepository) {}

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
      const card = await this.cardRepository.readCard();
      const nextCard = appendTransactionLog(
        {
          ...card,
          balance: card.balance + amount,
        },
        createTransactionLog({
          id: createRandomId('LOG'),
          activity: 'TOP_UP',
          nominal: amount,
          occurredAt: new Date().toISOString(),
        }),
      );

      await this.cardRepository.writeCard(nextCard);

      return {
        success: true,
        role: 'STATION',
        message: 'Top-up completed successfully.',
        card: toCardSummaryDto(nextCard),
      };
    } catch (error) {
      if (error instanceof CardRepositoryError) {
        return {
          success: false,
          role: 'STATION',
          message: error.message,
        };
      }

      throw error;
    }
  }
}
