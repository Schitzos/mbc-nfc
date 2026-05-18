/**
 * Tests for domain entity and repository contract files.
 * Uses runtime require() to ensure files are loaded and covered.
 */

describe('domain entity contracts', () => {
  it('ledger-entry.ts is importable', () => {
    const mod = require('../entities/ledger-entry');
    expect(mod).toBeDefined();
  });
});

describe('domain repository contracts', () => {
  it('ledger.repository.ts is importable', () => {
    const mod = require('../repositories/ledger.repository');
    expect(mod).toBeDefined();
  });

  it('membership-card.repository.ts is importable', () => {
    const mod = require('../repositories/membership-card.repository');
    expect(mod).toBeDefined();
  });

  it('nfc-availability.repository.ts is importable', () => {
    const mod = require('../repositories/nfc-availability.repository');
    expect(mod).toBeDefined();
  });
});
