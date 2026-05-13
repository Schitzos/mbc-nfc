import type { BenefitActivityType } from '../types/card-status';

export type ActivitySession = {
  activityId: string;
  activityType: BenefitActivityType;
  checkedInAt: string;
};
