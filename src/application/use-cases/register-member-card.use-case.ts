import type { MbcCard } from '@domain/entities/mbc-card';
import { createInitialCard } from '@domain/factories/mbc-card-factory';
import type { MbcCardRepository } from '@domain/repositories/mbc-card-repository';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';
import { toCardSummaryDto } from '@application/dto/card-summary-mapper';
import { CardRepositoryError } from '@domain/errors/card-repository-error';
import { createRandomId } from '@shared/utils/create-random-id';
import type { LocalLedgerRepository } from '@domain/repositories/local-ledger-repository';
import { maskMemberReference } from '@shared/utils/mask-member-reference';

export class RegisterMemberCardUseCase {
  constructor(
    private readonly cardRepository: MbcCardRepository,
    private readonly localLedgerRepository?: LocalLedgerRepository,
  ) {}

  async execute(): Promise<RoleActionResultDto> {
    try {
      return await this.performRegistration();
    } catch (error) {
      if (
        error instanceof CardRepositoryError &&
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
  }

  async executeWithReset(): Promise<RoleActionResultDto> {
    const card = createInitialCard();
    await this.cardRepository.writeCard(card);
    return this.buildSuccessResult(card);
  }

  private async performRegistration(): Promise<RoleActionResultDto> {
    const card = createInitialCard();
    await this.cardRepository.registerCard(card);
    return this.buildSuccessResult(card);
  }

  private async buildSuccessResult(
    card: MbcCard,
  ): Promise<RoleActionResultDto> {
    let message = 'Member card registered successfully.';

    if (this.localLedgerRepository) {
      try {
        await this.localLedgerRepository.append({
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
}
