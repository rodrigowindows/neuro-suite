# Sumário da Fase 18: Correção do Hook Condicional em useReadiness

## Status
Concluído com sucesso.

## Mudanças Realizadas
1. **`src/hooks/useReadiness.ts`**:
   - Criada a interface `UseGuestDemoReadinessOptions` e exportado o hook invariante `useGuestDemoReadiness`.
   - Revertido `useReadiness` para sua forma pura e invariante (sem condicional `if (options.guestDemo)`), eliminando o erro `react-hooks/rules-of-hooks`.
   - Removida a propriedade obsoleta `guestDemo` de `UseReadinessOptions`.
2. **`src/pages/Demo.tsx`**:
   - Importa e consome diretamente `useGuestDemoReadiness()`.
3. **`src/hooks/useReadiness.test.ts`**:
   - Ajustada a suíte de testes do modo visitante anônimo para invocar `useGuestDemoReadiness()`.
4. **`src/pages/Demo.test.tsx`**:
   - Adicionado teste unitário AAA que percorre as 3 etapas da demonstração e valida BioScore, piscadas inteiras (`roundBlinkRate`) e horas de sono contra `getDemoScenarioData(1|2|3)`.

## Verificação
- `npx eslint src/hooks/useReadiness.ts src/pages/Demo.tsx src/pages/Demo.test.tsx`: 0 erros (exit code 0)
- `npm test -- --run`: 50 arquivos de teste aprovados, 562 testes aprovados (0 falhas)
- `npx tsc --noEmit`: 0 erros de tipagem (exit code 0)
- `npm run build`: Build de produção Vite concluído em 15.80s (exit code 0)
- `git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts`: Vazio
