import type { ReactNode } from 'react';

export type Tone = 'info' | 'warning' | 'error' | 'success';

export interface SignalStatusBannerProps {
  tone: Tone;
  eyebrow: string;
  title: string;
  body: string;
  items?: string[];
  children?: ReactNode;
}
