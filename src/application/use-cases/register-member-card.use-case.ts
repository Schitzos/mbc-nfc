import type { MbcCard } from '@domain/entities/mbc-card';
import { createInitialCard } from '@domain/factories/mbc-card-factory';
import type { MbcCardRepository } from '@domain/repositories/mbc-card-repository';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';
import { toCardSummaryDto } from '@application/dto/card-summary-mapper';
import { isCardRepositoryError } from '@domain/errors/card-repository-error';
import { createRandomId } from '@shared/utils/create-random-id';
import type { LocalLedgerRepository } from '@domain/repositories/local-ledger-repository';
import { maskMemberReference } from '@shared/utils/mask-member-reference';

export type RegisterMemberCardUseCase = {
  execute: () => Promise<RoleActionResultDto>;
  executeWithReset: () => Promise<RoleActionResultDto>;
};

export function createRegisterMemberCardUseCase(
  cardRepository: MbcCardRepository,
  localLedgerRepository?: LocalLedgerRepository,
): RegisterMemberCardUseCase {
  async function buildSuccessResult(
    card: MbcCard,
  ): Promise<RoleActionResultDto> {
    let message = 'Member card registered successfully.';

    if (localLedgerRepository) {
      try {
        await localLedgerRepository.append({
          id: createRandomId('LEDGER'),
          role: 'STATION',
          action: 'REGISTER',
          maskedMemberReference: maskMemberReference(card.member.memberId),
          occurredAt: new Date().toISOString(),
        });
      } catch {
        message =
          'Member card registered, but the local audit ledger could not be updated.';
      }
    }

    return {
      success: true,
      role: 'STATION',
      message,
      card: toCardSummaryDto(card),
    };
  }

  async function performRegistration(): Promise<RoleActionResultDto> {
    const card = createInitialCard();
    await cardRepository.registerCard(card);
    return buildSuccessResult(card);
  }

  return {
    async execute(): Promise<RoleActionResultDto> {
      try {
        return await performRegistration();
      } catch (error) {
        if (
          isCardRepositoryError(error) &&
          error.code === 'CARD_ALREADY_REGISTERED'
        ) {
          return {
            success: false,
            role: 'STATION',
            message: error.message,
          };
        }
        throw error;
      }
    },

    async executeWithReset(): Promise<RoleActionResultDto> {
      const card = createInitialCard();
      await cardRepository.writeCard(card);
      return buildSuccessResult(card);
    },
  };
}
