import { createRandomId } from '@shared/utils/create-random-id';

describe('createRandomId', () => {
  it('generates an ID with the given prefix', () => {
    const id = createRandomId('CARD');
    expect(id).toMatch(/^CARD-/);
  });

  it('generates unique IDs on successive calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => createRandomId('X')));
    expect(ids.size).toBe(100);
  });

  it('includes uppercase alphanumeric segments', () => {
    const id = createRandomId('LOG');
    // Format: PREFIX-TIMESEGMENT-RANDOMSEGMENT
    const parts = id.split('-');
    expect(parts.length).toBeGreaterThanOrEqual(3);
    expect(parts[0]).toBe('LOG');
  });
});
