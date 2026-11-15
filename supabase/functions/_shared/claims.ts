export function isAuthenticatedClaims(claims: unknown): boolean {
  if (typeof claims !== 'object' || claims === null) return false;

  const { role, sub } = claims as { role?: unknown; sub?: unknown };
  return role === 'authenticated' && typeof sub === 'string' && sub.trim().length > 0;
}
