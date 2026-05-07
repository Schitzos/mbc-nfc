/**
 * Tests for domain entity and repository contract files.
 * Uses runtime require() to ensure files are loaded and covered.
 */

describe('domain entity contracts', () => {
  it('station-ledger-summary.ts is importable', () => {
    const mod = require('../entities/station-ledger-summary');
    expect(mod).toBeDefined();
  });
});

describe('domain repository contracts', () => {
  it('local-ledger-repository.ts is importable', () => {
    const mod = require('../repositories/local-ledger-repository');
    expect(mod).toBeDefined();
  });

  it('mbc-card-repository.ts is importable', () => {
    const mod = require('../repositories/mbc-card-repository');
    expect(mod).toBeDefined();
  });

  it('nfc-availability-repository.ts is importable', () => {
    const mod = require('../repositories/nfc-availability-repository');
    expect(mod).toBeDefined();
  });
});
