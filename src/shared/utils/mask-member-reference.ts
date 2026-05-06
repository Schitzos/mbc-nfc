export function maskMemberReference(memberId: string): string {
  const suffix = memberId.slice(-4).padStart(4, '0');
  return `MBC-***-${suffix}`;
}
