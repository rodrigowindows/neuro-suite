# Plano da Fase 18: Correção do Hook Condicional em useReadiness

## Objetivo
Eliminar a violação de `react-hooks/rules-of-hooks` em `src/hooks/useReadiness.ts`.

## Tarefas
1. Exportar `useGuestDemoReadiness` de forma independente e invariante em `src/hooks/useReadiness.ts`.
2. Restaurar `useReadiness` como hook invariante padrão para usuários autenticados e rotas convencionais (BridgeConsole, Dashboard).
3. Atualizar `src/pages/Demo.tsx` para importar e consumir diretamente `useGuestDemoReadiness`.
4. Atualizar os testes em `src/hooks/useReadiness.test.ts` para testar `useGuestDemoReadiness`.
5. Adicionar teste unitário AAA em `src/pages/Demo.test.tsx` cobrindo as 3 etapas contra `getDemoScenarioData(1|2|3)`.
6. Validar com ESLint, Vitest (562 testes), TypeScript e Vite Build.
