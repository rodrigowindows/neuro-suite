# Fase 25 — Internacionalização da Tela de Login (/auth) (CrewVitals)

## Objetivo
Internacionalizar a página `src/pages/Auth.tsx` em inglês e português utilizando o catálogo i18n (`src/i18n/locales/auth.ts`) e integrar o componente `<LanguageToggle />` mantendo fidelidade ao `GLOSSARY.md`, sem emojis e sem credenciais expostas.

## Escopo de Arquivos Exclusivos
- `src/i18n/locales/auth.ts`
- `src/pages/Auth.tsx`
- `src/pages/Auth.test.tsx`

## Plano de Execução
1. Criar `src/i18n/locales/auth.ts` com dicionários `en` e `pt` contendo chaves prefixadas com `auth.*`. Textos em PT idênticos aos atuais da aplicação e textos em EN seguindo o `GLOSSARY.md` (ex: "Crew Health Telemetry Terminal", "Sign in" / "Signing in...", "View demo without signing in").
2. Atualizar `src/pages/Auth.tsx`:
   - Importar e utilizar `useI18n` para todo texto visível, placeholders, botões e labels.
   - Posicionar `<LanguageToggle />` no topo do card com espaçamento responsivo (compatível com 375px).
   - Preservar fluxos existentes, rotas e estabilidade de abas (`login` / `signup`).
3. Atualizar `src/pages/Auth.test.tsx`:
   - Garantir que testes continuem passando sem provider (devolvendo PT por padrão).
   - Adicionar testes com `<LangProvider initialLang="en">` e `<LangProvider initialLang="pt">` para validação de tradução de subtítulo, botões e links.
   - Testar alternância dinâmica via `<LanguageToggle />`.
   - Garantir ausência de botões Google/Apple e ausência de emojis.
4. Executar bateria de validações:
   - `npx eslint src/pages/Auth.tsx src/pages/Auth.test.tsx src/i18n/locales/auth.ts`
   - `npm test -- --run`
   - `npx tsc --noEmit`
   - `npm run build`
   - `git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts` (deve ser vazio)
5. Criar `SUMMARY.md` com saídas reais e realizar o commit atômico exclusivo dos 3 arquivos.
