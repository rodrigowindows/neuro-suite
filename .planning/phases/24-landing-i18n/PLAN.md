# Fase 24 — Landing Page EN/PT (CrewVitals)

## Objetivo
Internacionalizar a landing page (`src/pages/Index.tsx`) para inglês e português utilizando o catálogo próprio `src/i18n/locales/landing.ts`, integrando o seletor `LanguageToggle` no cabeçalho e assegurando paridade estrita de chaves e testes automatizados.

## Arquivos Exclusivos
- `src/pages/Index.tsx`
- `src/pages/Index.test.tsx`
- `src/i18n/locales/landing.ts`

## Plano de Execução
1. Criar `src/i18n/locales/landing.ts` com dicionários `en` e `pt` contendo todas as chaves prefixadas por `landing.`.
   - Textos em PT idênticos aos atuais.
   - Textos em EN alinhados com `GLOSSARY.md` (cockpit style, sem alegações médicas ou de marketing).
2. Atualizar `src/pages/Index.tsx`:
   - Importar `useI18n` e `LanguageToggle`.
   - Substituir literais de texto pelas chaves com `t(...)`.
   - Adicionar `<LanguageToggle />` no cabeçalho.
   - Apontar botão principal para `/demo` com "Ver demonstração (sem login)" (PT) e "View demo (no login)" (EN).
   - Manter âncoras internas intactas (`#beneficios`, `#modulos`, `#depoimentos`).
3. Atualizar `src/pages/Index.test.tsx`:
   - Preservar testes existentes (passando em PT por padrão).
   - Adicionar testes de renderização com `<LangProvider initialLang="en">` e `<LangProvider initialLang="pt">`.
   - Validar ausência de termos proibidos ("100% Offline", "0 Dados Vazados", "0 data leaks") e ausência de emojis em ambos os idiomas.
4. Executar bateria de validações:
   - `npx eslint src/pages/Index.tsx src/pages/Index.test.tsx src/i18n/locales/landing.ts`
   - `npm test -- --run`
   - `npx tsc --noEmit`
   - `npm run build`
   - `git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts` (deve ser vazio)
5. Criar `.planning/phases/24-landing-i18n/SUMMARY.md` com a saída real das validações.
6. Realizar commit atômico dos 3 arquivos exclusivos.
