/**
 * Tests for presentation component type contract files.
 * Uses runtime require() to ensure files are loaded and covered.
 */

describe('presentation component type contracts', () => {
  it('BackgroundDecor/types.ts is importable', () => {
    expect(require('../../components/BackgroundDecor/types')).toBeDefined();
  });

  it('NfcActionSheet/types.ts is importable', () => {
    expect(require('../../components/NfcActionSheet/types')).toBeDefined();
  });

  it('SignalBottomSheet/types.ts is importable', () => {
    expect(require('../../components/SignalBottomSheet/types')).toBeDefined();
  });

  it('SignalButton/types.ts is importable', () => {
    expect(require('../../components/SignalButton/types')).toBeDefined();
  });

  it('SignalJelajahCard/types.ts is importable', () => {
    expect(require('../../components/SignalJelajahCard/types')).toBeDefined();
  });

  it('SignalOptionCard/types.ts is importable', () => {
    expect(require('../../components/SignalOptionCard/types')).toBeDefined();
  });

  it('SignalSkeleton/types.ts is importable', () => {
    expect(require('../../components/SignalSkeleton/types')).toBeDefined();
  });

  it('SignalStatusBanner/types.ts is importable', () => {
    expect(require('../../components/SignalStatusBanner/types')).toBeDefined();
  });

  it('SignalTextField/types.ts is importable', () => {
    expect(require('../../components/SignalTextField/types')).toBeDefined();
  });
});
