import { roleOptions } from '../role-options';

describe('roleOptions config', () => {
  it('defines exactly four roles', () => {
    expect(roleOptions).toHaveLength(4);
  });

  it('includes station, gate, terminal, and scout', () => {
    const keys = roleOptions.map(r => r.key);
    expect(keys).toEqual(['station', 'gate', 'terminal', 'scout']);
  });

  it('each role has a label, purpose, and note', () => {
    for (const role of roleOptions) {
      expect(role.label).toBeTruthy();
      expect(role.purpose).toBeTruthy();
      expect(role.note).toBeTruthy();
    }
  });

  it('scout is described as read-only', () => {
    const scout = roleOptions.find(r => r.key === 'scout');
    expect(scout?.note).toContain('Read-only');
  });
});
