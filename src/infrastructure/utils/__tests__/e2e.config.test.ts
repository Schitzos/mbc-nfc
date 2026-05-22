import { E2E_MODE } from '../e2e.config';

describe('e2e.config', () => {
  it('E2E_MODE defaults to false', () => {
    expect(E2E_MODE).toBe(false);
  });
});
