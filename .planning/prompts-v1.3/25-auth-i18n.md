/gsd-quick Fase 25 do marco v1.3 (CrewVitals): tela de login (`/auth`) em inglês e português. Rode somente depois do commit da fase 21.

## Contexto

`src/pages/Auth.tsx` (209 linhas) é o login/cadastro. Tem o subtítulo "Terminal de Telemetria de Saúde da Tripulação", o botão "Autenticar" e o link "Ver demonstração sem login". A fase 21 entregou `src/i18n/`; `/auth` já está dentro do `LangProvider` em `src/App.tsx`. Leia antes: `AGENTS.md`, `.planning/prompts-v1.3/00-LEIA-ME.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`, `src/pages/Auth.tsx`, `src/pages/Auth.test.tsx`.

## Arquivos exclusivos

`src/pages/Auth.tsx`, `src/pages/Auth.test.tsx`, `src/i18n/locales/auth.ts`. Não toque em `useAuth.tsx`, `Index.tsx`, `Demo.tsx` nem `App.tsx`.

## O que implementar

1. Mova todo texto visível de `Auth.tsx` (títulos, subtítulo, rótulos e placeholders dos campos, botões, links, mensagens de validação exibidas na página, `aria-label`) para `src/i18n/locales/auth.ts` (`en` e `pt`, chaves `auth.*`). Os textos PT ficam **idênticos** aos atuais.
2. EN conforme o `GLOSSARY.md`: subtítulo "Crew Health Telemetry Terminal", botão "Sign in" / "Signing in...", link "View demo without signing in".
3. Toasts e erros vindos do `useAuth` (arquivo fora do seu escopo) continuam como estão; só traduza textos que `Auth.tsx` mesmo define. Registre no SUMMARY quais mensagens do `useAuth.tsx` ficaram em português, para decisão futura.
4. Inclua `<LanguageToggle />` visível em 375 px, sem quebrar o layout do cartão.
5. Preserve o fluxo: login com e-mail e senha, redirecionamento pós-login, `?demo=1` sobrevivendo ao login, link para `/demo`, e que não existam botões Google/Apple (fase 04). Nenhum texto de credencial, e-mail institucional ou senha no código.
6. Sem emojis; sem chaves internas ou rotas novas.

## Testes (AAA, `Auth.test.tsx`)

- Testes existentes continuam passando sem provider (português por padrão).
- Novos: `<LangProvider initialLang="en">` mostra "Crew Health Telemetry Terminal", "Sign in" e o link "View demo without signing in" com destino `/demo`; `initialLang="pt"` mostra "Autenticar"; ausência de Google e Apple nas duas línguas; ausência de emojis.

## Verificação (cole a saída real no SUMMARY)

```bash
npx eslint src/pages/Auth.tsx src/pages/Auth.test.tsx src/i18n/locales/auth.ts
npm test -- --run
npx tsc --noEmit
npm run build
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```

## Entrega

`.planning/phases/25-auth-i18n/PLAN.md` e `SUMMARY.md`. Commit só dos 3 arquivos: `feat(auth): tela de login em ingles e portugues`. Sem push.
