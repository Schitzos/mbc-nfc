import { DomainError } from '@domain/errors/domain-error';

export type TariffStrategy = {
  ratePerUnit: number;
  unitMs: number;
  roundUp: boolean;
};

export type ActivityTariffCalculation = {
  chargedHours: number;
  chargedAmount: number;
  durationMs: number;
};

interface CalculateActivityTariffInput {
  checkedInAt: string;
  checkedOutAt: string;
}

function parseIsoDate(value: string): Date {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new DomainError(
      'INVALID_TIMESTAMP',
      'Activity timestamps must be valid ISO date strings.',
    );
  }

  return parsedDate;
}

const DEFAULT_STRATEGY: TariffStrategy = {
  ratePerUnit: 2000,
  unitMs: 60 * 60 * 1000,
  roundUp: true,
};

export function calculateActivityTariff(
  { checkedInAt, checkedOutAt }: CalculateActivityTariffInput,
  strategy: TariffStrategy = DEFAULT_STRATEGY,
): ActivityTariffCalculation {
  const startedAt = parseIsoDate(checkedInAt);
  const finishedAt = parseIsoDate(checkedOutAt);
  const durationMs = finishedAt.getTime() - startedAt.getTime();

  if (durationMs <= 0) {
    throw new DomainError(
      'INVALID_DURATION',
      'Activity checkout time must be later than the check-in time.',
    );
  }

  const durationUnits = durationMs / strategy.unitMs;
  const chargedHours = strategy.roundUp
    ? Math.ceil(durationUnits)
    : Math.floor(durationUnits);

  return {
    chargedHours,
    chargedAmount: chargedHours * strategy.ratePerUnit,
    durationMs,
  };
}
