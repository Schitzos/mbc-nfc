import type { MbcCardRepository } from '@domain/membership/repositories/membership-card.repository';
import { isCardRepositoryError } from '@domain/membership/errors/card-repository-error';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';
import { toCardSummaryDto } from '@application/dto/card-summary-mapper';

export type InspectMemberCardUseCase = {
  execute: () => Promise<RoleActionResultDto>;
};

export function createInspectMemberCardUseCase(
  cardRepository: MbcCardRepository,
): InspectMemberCardUseCase {
  return {
    async execute(): Promise<RoleActionResultDto> {
      try {
        const card = await cardRepository.readCard();

        return {
          success: true,
          role: 'SCOUT',
          message: 'Card inspected successfully.',
          card: toCardSummaryDto(card),
        };
      } catch (error) {
        if (isCardRepositoryError(error)) {
          return {
            success: false,
            role: 'SCOUT',
            message: error.message,
          };
        }

        throw error;
      }
    },
  };
}
