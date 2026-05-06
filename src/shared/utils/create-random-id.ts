export function createRandomId(prefix: string): string {
  const randomSegment = Math.random().toString(36).slice(2, 10).toUpperCase();
  const timeSegment = Date.now().toString(36).toUpperCase();
  return `${prefix}-${timeSegment}-${randomSegment}`;
}
