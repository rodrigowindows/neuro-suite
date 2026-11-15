# Fase 21 — Núcleo de Internacionalização EN/PT (CrewVitals)

## Objetivo
Implementar o módulo mínimo próprio de i18n em `src/i18n/`, o seletor `LanguageToggle` acessível e integrar o `LangProvider` exclusivamente nas rotas `/`, `/auth` e `/demo` em `src/App.tsx`.

## Escopo de Arquivos Exclusivos
- `src/i18n/index.tsx`
- `src/i18n/i18n.test.ts`
- `src/i18n/locales/common.ts`
- `src/components/LanguageToggle.tsx`
- `src/components/LanguageToggle.test.tsx`
- `src/App.tsx`

## Plano de Execução
1. Criar `src/i18n/locales/common.ts` com dicionários `en` e `pt` (`common.language`, `common.lang.en`, `common.lang.pt`).
2. Criar `src/i18n/index.tsx` com tipos, `LANG_STORAGE_KEY`, `resolveInitialLang`, agregação por `import.meta.glob`, `translate`, `LangProvider` e `useI18n`.
3. Criar `src/components/LanguageToggle.tsx` com botões EN e PT, alvo de 44px, foco visível, `aria-pressed` e sem emojis.
4. Atualizar `src/App.tsx` para envolver exclusivamente as rotas `/`, `/auth` e `/demo` no `<LangProvider>`.
5. Criar suíte de testes AAA em `src/i18n/i18n.test.ts` e `src/components/LanguageToggle.test.tsx`.
6. Executar bateria de validações: eslint, vitest, tsc, build e diff de arquivos blindados.
7. Gerar `SUMMARY.md` com saídas reais e realizar o commit atômico.
