/**
 * Tests for application DTO contract files.
 * Uses runtime require() to ensure files are loaded and covered.
 */

describe('application DTO contracts', () => {
  it('card-summary-dto.ts is importable', () => {
    const mod = require('../../dto/card-summary-dto');
    expect(mod).toBeDefined();
  });

  it('check-nfc-availability-result-dto.ts is importable', () => {
    const mod = require('../../dto/check-nfc-availability-result-dto');
    expect(mod).toBeDefined();
  });

  it('role-action-result-dto.ts is importable', () => {
    const mod = require('../../dto/role-action-result-dto');
    expect(mod).toBeDefined();
  });

  it('station-ledger-summary-dto.ts is importable', () => {
    const mod = require('../../dto/station-ledger-summary-dto');
    expect(mod).toBeDefined();
  });
});
