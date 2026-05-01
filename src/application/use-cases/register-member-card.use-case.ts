import type { MbcCard } from '../../domain/entities/mbc-card';
import {
  createTransactionLog,
  appendTransactionLog,
} from '../../domain/services/transaction-log-policy';
import type { MbcCardRepository } from '../../domain/repositories/mbc-card-repository';
import type { RoleActionResultDto } from '../dto/role-action-result-dto';
import { toCardSummaryDto } from '../dto/card-summary-mapper';
import { CardRepositoryError } from '../../domain/errors/card-repository-error';
import { createRandomId } from '../../shared/utils/create-random-id';

function createInitialCard(): MbcCard {
  const occurredAt = new Date().toISOString();
  const card = {
    version: 1,
    cardId: createRandomId('CARD'),
    member: {
      memberId: createRandomId('MEM'),
    },
    balance: 0,
    currency: 'IDR' as const,
    visitStatus: 'NOT_CHECKED_IN' as const,
    transactionLogs: [],
  };

  return appendTransactionLog(
    card,
    createTransactionLog({
      id: createRandomId('LOG'),
      activity: 'REGISTER',
      nominal: 0,
      occurredAt,
    }),
  );
}

export class RegisterMemberCardUseCase {
  constructor(private readonly cardRepository: MbcCardRepository) {}

  async execute(): Promise<RoleActionResultDto> {
    const registerState = await this.validateInitialCardState();

    if (!registerState.canRegister) {
      return {
        success: false,
        role: 'STATION',
        message: registerState.message,
      };
    }

    const card = createInitialCard();
    await this.cardRepository.writeCard(card);

    return {
      success: true,
      role: 'STATION',
      message: 'Member card registered successfully.',
      card: toCardSummaryDto(card),
    };
  }

  private async validateInitialCardState(): Promise<{
    canRegister: boolean;
    message: string;
  }> {
    try {
      const existingCard = await this.cardRepository.readCard();

      if (existingCard.member.memberId) {
        return {
          canRegister: false,
          message: 'Card is already registered and cannot be registered again.',
        };
      }
    } catch (error) {
      if (
        error instanceof CardRepositoryError &&
        error.code === 'UNREGISTERED_CARD'
      ) {
        return {
          canRegister: true,
          message: 'Blank or reusable card is ready for registration.',
        };
      }

      if (error instanceof CardRepositoryError) {
        return {
          canRegister: false,
          message: error.message,
        };
      }

      throw error;
    }

    return {
      canRegister: true,
      message: 'Card is ready for registration.',
    };
  }
}
