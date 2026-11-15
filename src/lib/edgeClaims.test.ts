import { describe, expect, it } from 'vitest';
import { isAuthenticatedClaims } from '../../supabase/functions/_shared/claims';

describe('isAuthenticatedClaims', () => {
  it('aceita claims de usuário autenticado com sub', () => {
    // Arrange
    const claims = { role: 'authenticated', sub: 'user-123' };

    // Act
    const result = isAuthenticatedClaims(claims);

    // Assert
    expect(result).toBe(true);
  });

  it('rejeita role anon', () => {
    // Arrange
    const claims = { role: 'anon', sub: 'user-123' };

    // Act
    const result = isAuthenticatedClaims(claims);

    // Assert
    expect(result).toBe(false);
  });

  it('rejeita claims sem sub', () => {
    // Arrange
    const claims = { role: 'authenticated' };

    // Act
    const result = isAuthenticatedClaims(claims);

    // Assert
    expect(result).toBe(false);
  });

  it('rejeita undefined', () => {
    // Arrange
    const claims = undefined;

    // Act
    const result = isAuthenticatedClaims(claims);

    // Assert
    expect(result).toBe(false);
  });
});
