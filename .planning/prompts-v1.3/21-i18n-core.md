/gsd-quick Fase 21 do marco v1.3 (CrewVitals): núcleo de internacionalização EN/PT. Rode PRIMEIRO e sozinha; as fases 22 a 29 dependem do seu commit.

## Contexto

A demo e as portas de entrada precisam de inglês e português. Não há biblioteca de i18n no projeto e `package.json` é blindado (Lovable). Crie um módulo mínimo. Leia antes: `AGENTS.md`, `.planning/prompts-v1.3/00-LEIA-ME.md` (contrato do módulo), `.planning/prompts-v1.3/GLOSSARY.md`, `src/App.tsx`.

## Arquivos exclusivos

`src/i18n/index.tsx`, `src/i18n/i18n.test.ts`, `src/i18n/locales/common.ts`, `src/components/LanguageToggle.tsx`, `src/components/LanguageToggle.test.tsx`, `src/App.tsx`.

## O que implementar

1. `src/i18n/index.tsx` exatamente com a API do contrato em `00-LEIA-ME.md`:
   - `resolveInitialLang({ search, stored, navigatorLanguage })`: ordem `?lang=en|pt`, depois valor salvo, depois navegador que começa com `pt`, depois `'en'`. Valores inválidos são ignorados. Todo acesso a `window`, `localStorage` e `navigator` em `try/catch` e protegido para SSR e testes.
   - `translate(lang, key, vars)`: busca em `lang`; se faltar, usa a chave em `en`; se faltar, devolve a própria chave. Interpolação `{nome}` com `vars`.
   - Catálogo carregado com `import.meta.glob('./locales/*.ts', { eager: true })`: cada módulo exporta `en` e `pt`; junte todos os `en` num mapa e todos os `pt` noutro. Funciona com zero ou muitos arquivos.
   - `LangProvider`: estado inicial de `resolveInitialLang` (ou `initialLang`); `setLang` grava em `localStorage` sob `LANG_STORAGE_KEY` (em `try/catch`); quando `?lang=` válido está na URL, também persiste; efeito que define `document.documentElement.lang` como `en` ou `pt-BR` e restaura o valor anterior ao desmontar.
   - `useI18n`: dentro do provider usa o estado; fora dele devolve `lang: 'pt'`, `setLang` que não faz nada e `t` em português (contexto com valor padrão, sem lançar erro).
2. `src/i18n/locales/common.ts`: exporta `en` e `pt` com chaves `common.language` ("Language" e "Idioma"), `common.lang.en` ("English"/"Inglês"), `common.lang.pt` ("Portuguese"/"Português").
3. `src/components/LanguageToggle.tsx`: dois botões "EN" e "PT" (`aria-pressed`, `min-h-[44px] min-w-[44px]`, foco visível, `aria-label` vindo de `common.language`), usa `useI18n`. Estilo com os componentes `Button` existentes. Sem emojis.
4. `src/App.tsx`: envolver somente os elementos das rotas `/`, `/auth` e `/demo` em `<LangProvider>`. Nenhuma outra mudança; as demais rotas e o `ProtectedRoute` (se houver) ficam como estão.
5. O app fora dessas três rotas continua em português e idêntico.

## Testes (AAA)

- `resolveInitialLang`: precedência (`?lang=pt` vence `stored='en'`; `stored` vence navegador; `pt-BR` vira `pt`; `fr` cai em `en`; valor inválido em `?lang=` é ignorado).
- `translate`: interpolação, fallback para `en`, fallback para a chave.
- Paridade: percorre `import.meta.glob('./locales/*.ts', { eager: true })` e, para cada arquivo, afirma que `en` e `pt` têm exatamente as mesmas chaves e que toda chave começa com o nome do arquivo seguido de ponto. Esse teste vale para todas as fases seguintes.
- `LangProvider` e `useI18n`: troca de idioma atualiza `t`, grava `localStorage`, define `document.documentElement.lang`; fora do provider devolve `pt`.
- `LanguageToggle`: clicar em EN e PT chama `setLang` e atualiza `aria-pressed`.

## Verificação (cole a saída real no SUMMARY)

```bash
npx eslint src/i18n src/components/LanguageToggle.tsx src/App.tsx
npm test -- --run
npx tsc --noEmit
npm run build
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```

Esperado: 0 falhas (os 562 testes anteriores continuam passando), tsc e build limpos, diff dos blindados vazio. Confirme que `/dashboard` e as demais rotas não passam pelo provider.

## Entrega

`.planning/phases/21-i18n-core/PLAN.md` e `SUMMARY.md` (inclua a API final exportada). Commit só dos arquivos exclusivos: `feat(i18n): nucleo EN/PT com provider, hook e seletor de idioma`. Sem push. Avise ao final: "Fase 21 commitada, pode liberar 22 a 29."
