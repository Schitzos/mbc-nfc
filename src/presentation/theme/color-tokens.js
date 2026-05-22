/**
 * Shared color tokens consumed by both:
 * - tailwind.config.js (NativeWind utility classes)
 * - src/presentation/theme/colors.ts (StyleSheet / JS runtime)
 *
 * This file is the SINGLE SOURCE OF TRUTH for color values used in Tailwind.
 * Usage: className="text-foreground bg-brand border-success"
 */
module.exports = {
  // Brand
  brand: '#FF0025',

  // Text & Surface
  foreground: '#111827',
  muted: '#6B7280',
  background: '#F7F9FC',

  // Status
  success: '#059669',
  'success-light': '#DCFCE7',
  'success-border': '#16A34A',
  error: '#DC2626',
  'error-light': '#FEE2E2',
  warning: '#D97706',
  'warning-light': '#FEF3C7',

  // Role accents
  scout: '#00B4D8',
  simulation: '#F59E0B',

  // UI
  accent: '#0050AE',
  'pink-light': '#FFE4E8',
  'pink-gradient': '#FFB3C1',
  navy: '#001A41',
  'navy-dark': '#0F172A',
};
