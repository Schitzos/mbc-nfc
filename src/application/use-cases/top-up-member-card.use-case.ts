import type { RoleActionResultDto } from '../dto/role-action-result-dto';
import type { MbcCardRepository } from '../../domain/repositories/mbc-card-repository';
import { CardRepositoryError } from '../../domain/errors/card-repository-error';
import {
  createTransactionLog,
  appendTransactionLog,
} from '../../domain/services/transaction-log-policy';
import { createRandomId } from '../../shared/utils/create-random-id';
import { toCardSummaryDto } from '../dto/card-summary-mapper';
import type { LocalLedgerRepository } from '../../domain/repositories/local-ledger-repository';
import { maskMemberReference } from '../../shared/utils/mask-member-reference';

type TopUpMemberCardRequest = {
  amount: number;
};

export class TopUpMemberCardUseCase {
  constructor(
    private readonly cardRepository: MbcCardRepository,
    private readonly localLedgerRepository?: LocalLedgerRepository,
  ) {}

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

      let message = 'Top-up completed successfully.';

      if (this.localLedgerRepository) {
        try {
          await this.localLedgerRepository.append({
            id: createRandomId('LEDGER'),
            role: 'STATION',
            action: 'TOP_UP',
            maskedMemberReference: maskMemberReference(
              nextCard.member.memberId,
            ),
            amount,
            occurredAt: new Date().toISOString(),
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
