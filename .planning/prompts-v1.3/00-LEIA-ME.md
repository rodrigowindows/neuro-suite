# Marco v1.3: Demo multilíngue (inglês e português)

Motivo: o projeto e a banca são em inglês. A demo `/demo`, a landing, o login, o deck, o vídeo e o README precisam existir em **EN e PT**, com inglês como idioma padrão para quem não usa navegador em português.

Decisão de arquitetura (já tomada, não reabrir): módulo próprio e leve em `src/i18n/`, sem biblioteca nova (`package.json` é blindado). Fora de `/`, `/auth` e `/demo` o app continua em português e nada muda.

## Ondas (a única dependência dura é a 21)

| Onda | Prompts | Quando |
|---|---|---|
| 1 | `21-i18n-core.md` | Já. Cria o contrato `src/i18n/` e é pequena |
| 1 (junto) | `26`, `27`, `28`, `29` (deck, vídeo, README, publicação) | Já, em paralelo com a 21: só mexem em `docs/` e `README.md` |
| 2 | `22`, `23`, `24`, `25` (demo, alerta, landing, login) | Só depois do commit da 21; rodam entre si ao mesmo tempo |
| 3 | `30-revisao-traducao.md` | Depois de 21 a 29 |
| 4 | `31-auditoria-i18n.md` | Por último |

Resumo: abra 5 terminais agora (21, 26, 27, 28, 29). Quando a 21 commitar, abra mais 4 (22, 23, 24, 25). Depois 30 e 31.

Antes da onda 1 rode uma vez (deixa a árvore limpa para as checagens de `git status`):

```bash
git add .planning && git commit -m "docs(v1.3): planejamento do marco multilingue"
```

## Mapa de arquivos exclusivos (nenhum se repete)

| Prompt | Escreve somente em |
|---|---|
| 21 | `src/i18n/index.tsx`, `src/i18n/i18n.test.ts`, `src/i18n/locales/common.ts`, `src/components/LanguageToggle.tsx`, `src/components/LanguageToggle.test.tsx`, `src/App.tsx` |
| 22 | `src/pages/Demo.tsx`, `src/pages/Demo.test.tsx`, `src/i18n/locales/demo.ts` |
| 23 | `src/components/PredictiveAlert.tsx`, `src/components/PredictiveAlert.test.tsx`, `src/i18n/locales/predictive.ts` |
| 24 | `src/pages/Index.tsx`, `src/pages/Index.test.tsx`, `src/i18n/locales/landing.ts` |
| 25 | `src/pages/Auth.tsx`, `src/pages/Auth.test.tsx`, `src/i18n/locales/auth.ts` |
| 26 | `docs/apresentacao/gerar_apresentacao.py` e os `.pptx` e `.pdf` gerados |
| 27 | `docs/apresentacao/ROTEIRO-VIDEO-30S.md` (PT, só ajustes) e `docs/apresentacao/VIDEO-SCRIPT-30S.en.md` |
| 28 | `README.md` |
| 29 | `docs/publicacao/**` (menos `UAT-v1.2.md`) |
| 30 | somente `src/i18n/locales/*.ts` já existentes (traduções) |
| 31 | `docs/publicacao/UAT-v1.3.md`, `.planning/**` |

## Contrato do módulo i18n (válido para todos)

```ts
// src/i18n/index.tsx
export type Lang = 'en' | 'pt';
export const LANG_STORAGE_KEY = 'crewvitals_lang';
export function resolveInitialLang(opts?: { search?: string; stored?: string | null; navigatorLanguage?: string }): Lang; // ?lang= > localStorage > navegador pt* > 'en'
export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string; // pura; sem chave em EN cai para a chave
export function LangProvider(props: { children: React.ReactNode; initialLang?: Lang }): JSX.Element;
export function useI18n(): { lang: Lang; setLang: (l: Lang) => void; t: (key: string, vars?: Record<string, string | number>) => string };
// src/components/LanguageToggle.tsx -> export default function LanguageToggle(): JSX.Element  (botões EN | PT)
```

Regras do contrato:
- `useI18n()` fora de um `LangProvider` devolve `lang: 'pt'`, `setLang` sem efeito e `t` em português. Por isso componentes compartilhados (por exemplo `PredictiveAlert`) mudam de idioma só dentro da demo e o Dashboard segue em português.
- `LangProvider` envolve apenas as rotas `/`, `/auth` e `/demo` em `src/App.tsx`.
- Chaves por arquivo `src/i18n/locales/<ns>.ts` (descobertos por `import.meta.glob`), formato e glossário em `GLOSSARY.md`.
- Link para a banca: `https://neuro-suite.lovable.app/demo?lang=en` (e `?lang=pt`).

## Regras comuns a todos os prompts

- Não tocar: `src/integrations/supabase/**`, `supabase/migrations/**`, `package.json`, `package-lock.json`, `bun.lock`, `bun.lockb`, `vite.config.ts`, `.env*`. Sem dependência nova. Sem push.
- Não renomear chaves internas de aba, endpoints nem nomes de schema (`AGENTS.md`).
- Sem emojis; sem alegações novas; seguir `GLOSSARY.md`.
- Testes no padrão AAA. Gate final de cada fase: `npm test -- --run`, `npx tsc --noEmit`, `npm run build`, `npx eslint <arquivos da fase>`, e `git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts` vazio.
- Commit só dos arquivos exclusivos: `git add <arquivos>` e `git commit <arquivos> -m "..."`. Antes e depois, `git status --short` deve mostrar somente os seus arquivos.
- Fluxo GSD: `PLAN.md` curto antes e `SUMMARY.md` depois em `.planning/phases/<número>-<nome>/`, com a saída real dos comandos. O que não puder verificar é NÃO VERIFICADO.
- Se outro terminal causar falha fora do seu escopo, registre o arquivo e o teste, sem corrigir.
