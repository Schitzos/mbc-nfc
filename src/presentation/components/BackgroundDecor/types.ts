export type Variant =
  | 'roleSwitcher'
  | 'station'
  | 'gate'
  | 'terminal'
  | 'scout';

export interface BackgroundDecorProps {
  variant?: Variant;
}
