/gsd-quick Fase 24 do marco v1.3 (CrewVitals): landing (`/`) em inglês e português. Rode somente depois do commit da fase 21.

## Contexto

`src/pages/Index.tsx` (351 linhas) é a landing e tem o botão "Ver demonstração (sem login)". A banca lê em inglês. A fase 21 entregou `src/i18n/` (`useI18n`, `LangProvider`, `LanguageToggle`); a landing já está dentro do `LangProvider` em `src/App.tsx`. Leia antes: `AGENTS.md`, `.planning/prompts-v1.3/00-LEIA-ME.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`, `src/pages/Index.tsx`, `src/pages/Index.test.tsx`.

## Arquivos exclusivos

`src/pages/Index.tsx`, `src/pages/Index.test.tsx`, `src/i18n/locales/landing.ts`. Não toque em `Auth.tsx`, `Demo.tsx` nem `App.tsx`.

## O que implementar

1. Inventarie todo texto visível de `Index.tsx` (títulos, parágrafos, botões, rótulos de seção, `aria-label`, `alt`) e passe tudo para `src/i18n/locales/landing.ts` (`en` e `pt`, chaves `landing.*`). Os textos PT devem ficar **idênticos** aos atuais.
2. Traduza para EN seguindo o `GLOSSARY.md`. Mantenha as restrições já existentes: sem "100% Offline", sem "0 Dados Vazados" / "0 data leaks", sem depoimentos, sem linguagem de RH ou gestão corporativa, sem alegações novas.
3. O botão principal da primeira dobra: PT "Ver demonstração (sem login)", EN "View demo (no login)", ambos para `/demo`. Preserve a propagação do idioma: o link vai para `/demo` simples (o idioma já fica salvo em `localStorage` pelo provider).
4. Inclua `<LanguageToggle />` no cabeçalho ou na primeira dobra, visível em 375 px.
5. Listas, cartões e seções mapeados por dados (arrays dentro do arquivo): mova os textos desses arrays para o dicionário e leia com `t`, sem criar abstração nova além do necessário.
6. Sem emojis; sem mudar rotas, chaves internas ou estilos.

## Testes (AAA, `Index.test.tsx`)

- Os testes existentes continuam passando sem provider (português por padrão).
- Novos: com `<LangProvider initialLang="en">` aparece "View demo (no login)" com `href="/demo"`, e não aparece "Ver demonstração"; com `initialLang="pt"` aparece o texto em português; nenhum texto proibido ("100% Offline", "0 Dados Vazados", "0 data leaks") em nenhuma das línguas; nenhum emoji.
- Paridade de chaves: coberta pelo teste da fase 21; rode-o.

## Verificação (cole a saída real no SUMMARY)

```bash
npx eslint src/pages/Index.tsx src/pages/Index.test.tsx src/i18n/locales/landing.ts
npm test -- --run
npx tsc --noEmit
npm run build
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```

## Entrega

`.planning/phases/24-landing-i18n/PLAN.md` e `SUMMARY.md` (liste termos novos que não estavam no glossário). Commit só dos 3 arquivos: `feat(landing): landing em ingles e portugues`. Sem push.
