export type RoleOption = {
  key: 'station' | 'gate' | 'terminal' | 'scout';
  label: string;
  purpose: string;
  note: string;
};

export const roleOptions: RoleOption[] = [
  {
    key: 'station',
    label: 'Station',
    purpose: 'Register cards, top up balances, and review the local ledger.',
    note: 'Admin write flow',
  },
  {
    key: 'gate',
    label: 'Gate',
    purpose:
      'Check members into the selected activity with optional simulation.',
    note: 'Entry write flow',
  },
  {
    key: 'terminal',
    label: 'Terminal',
    purpose:
      'Check members out, calculate fees, and guide insufficient balance recovery.',
    note: 'Exit write flow',
  },
  {
    key: 'scout',
    label: 'Scout',
    purpose:
      'Inspect balance, visit status, and recent logs without mutating the card.',
    note: 'Read-only flow',
  },
];
