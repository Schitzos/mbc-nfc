import type { MbcCardRepository } from '../../domain/repositories/mbc-card-repository';
import { CardRepositoryError } from '../../domain/errors/card-repository-error';
import type { RoleActionResultDto } from '../dto/role-action-result-dto';
import { toCardSummaryDto } from '../dto/card-summary-mapper';

export class InspectMemberCardUseCase {
  constructor(private readonly cardRepository: MbcCardRepository) {}

  async execute(): Promise<RoleActionResultDto> {
    try {
      const card = await this.cardRepository.readCard();

      return {
        success: true,
        role: 'SCOUT',
        message: 'Card inspected successfully.',
        card: toCardSummaryDto(card),
      };
    } catch (error) {
      if (error instanceof CardRepositoryError) {
        return {
          success: false,
          role: 'SCOUT',
          message: error.message,
        };
      }

      throw error;
    }
  }
}
