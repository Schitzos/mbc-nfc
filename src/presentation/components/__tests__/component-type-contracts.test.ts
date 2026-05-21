/**
 * Tests for presentation component type contract files.
 * Uses runtime require() to ensure files are loaded and covered.
 */

describe('presentation component type contracts', () => {
  it('NfcActionSheet/types.ts is importable', () => {
    expect(require('../../components/NfcActionSheet/types')).toBeDefined();
  });

  it('SignalBottomSheet/types.ts is importable', () => {
    expect(require('../../components/SignalBottomSheet/types')).toBeDefined();
  });

  it('SignalButton/types.ts is importable', () => {
    expect(require('../../components/SignalButton/types')).toBeDefined();
  });
});
