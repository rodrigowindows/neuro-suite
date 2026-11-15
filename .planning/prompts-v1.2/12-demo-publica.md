/gsd-quick Fase 12 do marco v1.2 (CrewVitals): rota pública `/demo` sem login e sem rede.

## Contexto

A banca exige link de demo sem senha, permissão ou cadastro. Hoje `src/pages/Dashboard.tsx` redireciona para `/auth` quando não há usuário, e `src/hooks/useReadiness.ts` só usa o cenário demo se o e-mail do usuário for `DEMO_ACCOUNT_EMAIL`. Leia antes: `AGENTS.md`, `.planning/ROADMAP.md` (seção v1.2), `src/lib/demoScenario.ts`, `src/hooks/useReadiness.ts`, `src/components/BridgeConsole.tsx`, `src/components/MissionStatusWidget.tsx`, `src/pages/Dashboard.tsx`.

## Objetivo

`/demo` renderiza o cockpit (semáforo, 3 números, ação primária, log de eventos) com o roteiro de 3 etapas, para visitante anônimo, sem nenhuma chamada ao Supabase.

## Arquivos exclusivos (só estes)

- `src/pages/Demo.tsx` (novo)
- `src/pages/Demo.test.tsx` (novo)
- `src/App.tsx` (adicionar apenas `<Route path="/demo" element={<Demo />} />` acima do `*`)
- `src/hooks/useReadiness.ts` (adicionar opção `guestDemo?: boolean`; `useReadiness.test.ts` pode ganhar casos novos)
- `src/components/BridgeConsole.tsx` somente se for indispensável repassar `guestDemo`

Outro terminal edita `Index.tsx` e `Auth.tsx`; outro edita `docs/`. Não toque neles.

## Requisitos

1. PUB-01: `/demo` não redireciona para `/auth` e funciona sem `AuthProvider` ter usuário (`user === null`).
2. PUB-02: com `guestDemo`, `useReadiness` não chama `loadTelemetryFromDb` nem `supabase.auth.getUser`. Verifique também `useWellnessScore` (chama `supabase.auth.getUser()` hoje): em modo guest ele não pode ser executado, ou o hook precisa receber uma forma de pular a consulta. Prefira uma mudança mínima e compatível com os chamadores atuais. Se o `AuthProvider` já chama `supabase.auth.getSession()` no mount, isso é leitura de sessão local e não rede quando não há token; confirme no teste e documente. Se houver requisição de rede, a rota `/demo` deve montar sem consumir `useAuth` de forma que dispare rede, ou o `AuthProvider` deve pular a leitura quando `window.location.pathname === '/demo'` (só edite `src/hooks/useAuth.tsx` se for a única saída).
3. PUB-03: etapas 1, 2 e 3 (NO-GO, ATENÇÃO, GO) via `getDemoScenarioData`; botão "Simular novo scan" avança; ação primária de protocolo registra evento local (`appendEvent` e `COUNTERMEASURE_REGISTERED_EVENT`) e leva à etapa 2; botão "Reiniciar demonstração" volta à etapa 1 sem recarregar. Use as mesmas funções de `demoScenario.ts` (`resetDemoStage`, `simulateDemoScan`). Se o componente real de respiração 4-7-8 depender de rede ou de usuário, use uma contramedida local simples de 3 respirações guiadas sem rede.
4. PUB-04: selo fixo "DEMO: dados simulados" visível em toda a página; o alerta preditivo, se aparecer, mantém o rótulo de demonstração (não é previsão validada); piscadas/min formatadas só na exibição com `roundBlinkRate`, sem alterar valores armazenados nem limiares.
5. Não afirmar nada que o sistema não faz: sem métricas inventadas, sem depoimentos, sem emojis (há teste `src/lib/noEmojiUi.test.ts`).
6. Em `/demo` não exibir botão de login obrigatório; um link discreto "Entrar" para `/auth` é permitido.
7. Comportamento existente intacto: `/dashboard?demo=1` com conta compartilhada, 7 chaves internas de aba, endpoints e nomes de schema. Os 550 testes atuais continuam passando.

## Testes (AAA)

- `Demo.test.tsx`: mocka `@/integrations/supabase/client` com `vi.fn()` em `auth.getSession`, `auth.getUser`, `auth.onAuthStateChange`, `from` e `functions.invoke`; monta `<Demo />` dentro de `MemoryRouter` e `AuthProvider`; assert: nenhum `from`, `getUser` nem `functions.invoke` chamado; sem redirecionamento para `/auth`; selo "DEMO: dados simulados" presente; etapa 1 mostra NO-GO e BioScore 34; clique em "Simular novo scan" mostra GO e 72 ou a etapa definida pelo roteiro existente; reinício volta à etapa 1.
- `useReadiness.test.ts`: caso novo para `guestDemo` sem usuário.

## Verificação (rode e cole o resultado real no SUMMARY)

```bash
npm test -- --run
npx tsc --noEmit
npm run build
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```

Tudo verde e diff dos blindados vazio. Se algo ficar sem verificar, marque NÃO VERIFICADO.

## Entrega (fluxo GSD)

Crie `.planning/phases/12-demo-publica/PLAN.md` curto antes de codar e `SUMMARY.md` depois (o que mudou, arquivos, saída dos gates). Commit atômico só com os arquivos exclusivos, mensagem em português no estilo `feat(demo): rota publica /demo sem login e sem rede`. Sem push.
