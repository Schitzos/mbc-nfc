import { maskMemberReference } from '@shared/utils/mask-member-reference';

describe('maskMemberReference', () => {
  it('masks a standard member ID showing only last 4 characters', () => {
    expect(maskMemberReference('MEM-ABCD-1234')).toBe('MBC-***-1234');
  });

  it('pads short member IDs to 4 characters', () => {
    expect(maskMemberReference('AB')).toBe('MBC-***-00AB');
  });

  it('handles empty string', () => {
    expect(maskMemberReference('')).toBe('MBC-***-0000');
  });

  it('handles exactly 4 character member ID', () => {
    expect(maskMemberReference('WXYZ')).toBe('MBC-***-WXYZ');
  });

  it('redacts sensitive member identity (does not expose full ID)', () => {
    const masked = maskMemberReference('MEM-SENSITIVE-FULL-ID-12345');
    expect(masked).not.toContain('SENSITIVE');
    expect(masked).not.toContain('FULL-ID');
    expect(masked).toContain('***');
  });
});
