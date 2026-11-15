# Fase 21 — Núcleo de Internacionalização EN/PT (CrewVitals)

## Status: Concluída com sucesso

### API Final Exportada (`src/i18n/index.tsx`)
```ts
export type Lang = 'en' | 'pt';
export const LANG_STORAGE_KEY = 'crewvitals_lang';
export function resolveInitialLang(opts?: { search?: string; stored?: string | null; navigatorLanguage?: string }): Lang;
export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string;
export function LangProvider(props: { children: React.ReactNode; initialLang?: Lang }): JSX.Element;
export function useI18n(): { lang: Lang; setLang: (l: Lang) => void; t: (key: string, vars?: Record<string, string | number>) => string };
```

### Componente de Seleção (`src/components/LanguageToggle.tsx`)
```ts
export default function LanguageToggle(props?: { className?: string }): JSX.Element;
export { LanguageToggle };
```

### Locales Iniciais (`src/i18n/locales/common.ts`)
- Chaves: `common.language`, `common.lang.en`, `common.lang.pt`.
- Paridade estrita 1:1 entre `en` e `pt`.

### Isolamento de Rotas (`src/App.tsx`)
- `<LangProvider>` envolve apenas os elementos de: `/`, `/auth` e `/demo`.
- As rotas `/dashboard`, `/profile`, `/admin`, `/reset-password` e `*` não passam pelo provider e continuam em português via fallback inerte de `useI18n()`.

### Resultados das Validações

#### 1. ESLint
```bash
npx eslint src/i18n src/components/LanguageToggle.tsx src/components/LanguageToggle.test.tsx src/App.tsx
```
Saída: 0 erros, 0 avisos (código de saída 0).

#### 2. Vitest
```bash
npm test -- --run
```
Saída real:
```text
Test Files  52 passed (52)
     Tests  583 passed (583)
  Duration  24.69s
```
- 562 testes anteriores mantidos.
- 16 testes adicionados em `src/i18n/i18n.test.ts`.
- 5 testes adicionados em `src/components/LanguageToggle.test.tsx`.
- Total: 583 testes passando.

#### 3. TypeScript
```bash
npx tsc --noEmit
```
Saída: 0 erros (código de saída 0).

#### 4. Build de Produção
```bash
npm run build
```
Saída:
```text
✓ 3113 modules transformed.
✓ built in 14.34s
```

#### 5. Verificação de Arquivos Blindados
```bash
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```
Saída: Vazio (0 alterações).
