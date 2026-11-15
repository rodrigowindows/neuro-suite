# Plano da Fase 20: Remoção do E-mail da Conta Demo do Bundle Público

## Objetivo
Remover o e-mail institucional `[e-mail institucional removido]` do bundle público em `src/lib/constants.ts` tornando o recurso de conta demo inerte por padrão, e garantir que a cobertura de testes do comportamento legado de conta demo utilize exclusivamente e-mails fictícios mockados via `vi.mock`.

## Tarefas
1. Em `src/lib/constants.ts`, definir `DEMO_ACCOUNT_EMAIL = ''` com comentário esclarecedor (recurso de conta demo inerte, demo pública oficial em `/demo`).
2. Em `src/hooks/useReadiness.test.ts` e `src/pages/Dashboard.test.tsx`, manter o mock de `@/lib/constants` via `vi.mock` com e-mail fictício para validar o comportamento legado sem dados reais.
3. Verificar a ausência do e-mail no código-fonte de `src/`, `README.md` e no bundle final `dist/`.
4. Executar bateria de verificação completa (`npm test -- --run`, `npx tsc --noEmit`, `npm run build`, e `git diff --stat` dos arquivos blindados).
5. Realizar commit atômico dos arquivos de código/teste alterados.
