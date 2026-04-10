/**
 * Strips email addresses from display names to prevent PII leakage.
 * If the name looks like an email, returns the part before @.
 * If null or empty, returns null.
 */
export function sanitizeDisplayName(name: string | null | undefined): string | null {
  if (!name || !name.trim()) return null;
  const trimmed = name.trim();
  if (trimmed.includes('@')) return trimmed.split('@')[0];
  return trimmed;
}
