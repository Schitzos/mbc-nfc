import type { MbcCard } from '@domain/membership/entities/membership-card';
import type { MbcCardRepository } from '@domain/membership/repositories/membership-card.repository';
import { createCardRepositoryError } from '@domain/membership/errors/membership-card-repository-error';

let storedCard: MbcCard | null = null;

export function resetMockCardState(): void {
  storedCard = null;
}

export function createMockMbcCardRepository(): MbcCardRepository {
  return {
    async isSupported(): Promise<boolean> {
      return true;
    },

    async readCard(): Promise<MbcCard> {
      if (!storedCard) {
        throw createCardRepositoryError(
          'UNREGISTERED_CARD',
          'Card is blank or not registered yet.',
        );
      }
      return storedCard;
    },

    async writeCard(card: MbcCard): Promise<void> {
      storedCard = card;
    },

    async readWriteCard(
      transform: (card: MbcCard) => MbcCard,
    ): Promise<MbcCard> {
      if (!storedCard) {
        throw createCardRepositoryError(
          'UNREGISTERED_CARD',
          'Card is blank or not registered yet.',
        );
      }
      storedCard = transform(storedCard);
      return storedCard;
    },

    async registerCard(card: MbcCard): Promise<void> {
      if (storedCard) {
        throw createCardRepositoryError(
          'CARD_ALREADY_REGISTERED',
          'This card is already registered. Use a blank card or reset first.',
        );
      }
      storedCard = card;
    },

    async cancel(): Promise<void> {},
  };
}
