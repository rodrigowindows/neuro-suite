# Plano - Fase 12: Rota Pública `/demo` sem Login e sem Rede

## Objetivo
Implementar a rota pública `/demo` que renderiza o cockpit (semáforo, 3 números, ação primária, log de eventos) com o roteiro de 3 etapas para visitante anônimo (`user === null`), sem nenhuma requisição ao Supabase (0 chamadas a `from`, `getUser`, `functions.invoke`), mantendo o comportamento existente intacto e sem emojis.

## Requisitos Cobertos
- **PUB-01**: `/demo` não redireciona para `/auth` e funciona com `user === null`.
- **PUB-02**: Com `guestDemo`, `useReadiness` não chama `loadTelemetryFromDb`, `supabase.auth.getUser()`, nem tabelas/funções do Supabase.
- **PUB-03**: Etapas 1, 2 e 3 (NO-GO, ATENÇÃO, GO) via `getDemoScenarioData`:
  - Botão "Simular novo scan" avança a etapa.
  - Ação primária registra contramedida localmente (`appendEvent` e `COUNTERMEASURE_REGISTERED_EVENT`) e leva à etapa 2.
  - Botão "Reiniciar demonstração" volta à etapa 1 sem recarregar.
- **PUB-04**: Selo fixo "DEMO: dados simulados" visível; alerta preditivo rotulado como demonstração; piscadas/min formatadas com `roundBlinkRate`.
- **PUB-05**: Sem emojis, sem métricas inventadas, sem depoimentos.
- **Blindagem Lovable**: Não alterar `src/integrations/supabase/**`, `supabase/migrations/**`, `package.json`, `package-lock.json`, `vite.config.ts`. Sem novas dependências.

## Arquivos Envolvidos
1. `src/hooks/useReadiness.ts`: Adicionar suporte a `guestDemo?: boolean` isolando o caminho de execução sem Supabase/rede/getUser/useWellnessScore.
2. `src/hooks/useReadiness.test.ts`: Adicionar testes para o modo `guestDemo`.
3. `src/pages/Demo.tsx`: Nova página de demonstração pública contendo selo fixo, cockpit (semáforo, 3 números, alerta preditivo, ação primária e log de eventos) e controles de demonstração.
4. `src/pages/Demo.test.tsx`: Testes AAA verificando ausência total de chamadas Supabase, ausência de redirect, transição de etapas 1 -> 2 -> 3 e reset.
5. `src/App.tsx`: Adicionar `<Route path="/demo" element={<Demo />} />` logo acima do catch-all `*`.

## Verificação
- `npm test -- --run src/pages/Demo.test.tsx src/hooks/useReadiness.test.ts`
- `npx tsc --noEmit`
- `npm run build`
- `npm test -- --run`
- `git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts` (deve ser vazio)
