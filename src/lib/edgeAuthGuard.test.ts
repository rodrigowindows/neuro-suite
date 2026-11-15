import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GUARDED_FUNCTIONS = [
  'ai-insights',
  'cognitive-fatigue',
  'daily-checkin',
  'narrative-report',
  'sentiment-analysis',
  'smart-breaks',
  'nr1-chatbot',
] as const;

const IMPORT_LINE = 'import { requireAuthenticatedUser } from "../_shared/requireAuth.ts";';
const GUARD_CALL = 'await requireAuthenticatedUser(req, corsHeaders)';
const GUARD_RETURN = 'if (authError) return authError;';

function readFunctionSource(name: string): string {
  return readFileSync(resolve(process.cwd(), 'supabase', 'functions', name, 'index.ts'), 'utf8');
}

describe('guarda de autenticação nas edge functions (leitura do texto do arquivo)', () => {
  it.each(GUARDED_FUNCTIONS)('%s importa e chama requireAuthenticatedUser', (name) => {
    // Arrange
    const source = readFunctionSource(name);

    // Act
    const hasImport = source.includes(IMPORT_LINE);
    const hasCall = source.includes(GUARD_CALL);
    const hasReturn = source.includes(GUARD_RETURN);

    // Assert
    expect(hasImport).toBe(true);
    expect(hasCall).toBe(true);
    expect(hasReturn).toBe(true);
  });

  it.each(GUARDED_FUNCTIONS)('%s chama a guarda depois de OPTIONS e antes de ler o corpo', (name) => {
    // Arrange
    const source = readFunctionSource(name);
    const optionsIndex = source.indexOf("req.method === 'OPTIONS'");
    const guardIndex = source.indexOf(GUARD_CALL);
    const bodyReadMatch = source.search(/req\.(text|json)\(\)/);

    // Act
    const guardAfterOptions = guardIndex > optionsIndex;
    const guardBeforeBody = bodyReadMatch === -1 || guardIndex < bodyReadMatch;

    // Assert
    expect(optionsIndex).toBeGreaterThan(-1);
    expect(guardAfterOptions).toBe(true);
    expect(guardBeforeBody).toBe(true);
  });

  it('nr1-chatbot não mantém a validação inline antiga', () => {
    // Arrange
    const source = readFunctionSource('nr1-chatbot');

    // Act
    const hasInlineGetClaims = source.includes('getClaims(');

    // Assert
    expect(hasInlineGetClaims).toBe(false);
  });

  it('proactive-alerts não é alterado por esta guarda', () => {
    // Arrange
    const source = readFunctionSource('proactive-alerts');

    // Act
    const usesGuard = source.includes('requireAuthenticatedUser');

    // Assert
    expect(usesGuard).toBe(false);
  });
});
