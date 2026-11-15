/gsd-quick Fase 18 (correção do v1.2, CrewVitals): hook condicional em `useReadiness` quebra a regra do React.

## Defeito encontrado (reproduzido com eslint)

`npx eslint src/hooks/useReadiness.ts` falha com 2 erros `react-hooks/rules-of-hooks` (linhas 457 e 459): o `useReadiness` exportado chama `useGuestReadiness` ou `useStandardReadiness` conforme `options.guestDemo`. Hoje funciona porque `Demo.tsx` passa sempre `guestDemo: true`, mas se a opção mudar entre renders o React quebra, e o lint do projeto reprova.

## Arquivos exclusivos

`src/hooks/useReadiness.ts`, `src/hooks/useReadiness.test.ts`, `src/pages/Demo.tsx`, `src/pages/Demo.test.tsx`. Não toque em mais nada de `src/`.

## O que fazer

1. Tire o ramo condicional. Exporte o hook de convidado como `useGuestDemoReadiness` em `useReadiness.ts` e deixe `useReadiness` como o hook padrão, com a assinatura e o comportamento anteriores à fase 12. Remova `guestDemo` de `UseReadinessOptions` se ficar sem uso. `Demo.tsx` passa a importar o hook de convidado. BridgeConsole e Dashboard não podem mudar de comportamento.
2. Ajuste os testes de `useReadiness.test.ts` que usavam `guestDemo` para chamar o hook de convidado. Mantenha: etapa inicial 1, `simulateScan` leva à 3, `resetDemo` volta à 1, zero chamadas ao Supabase.
3. Em `Demo.test.tsx`, acrescente um teste (AAA) que percorre as 3 etapas e confere BioScore, piscadas inteiras (`roundBlinkRate`) e sono exibidos contra `getDemoScenarioData(1|2|3)`, para que deck e demo não divirjam de novo.
4. Mantenha: sem chamadas ao Supabase em `/demo`, selo "DEMO: dados simulados", sem emojis, `src/integrations/**` e `package.json` intocados.

## Verificação (cole a saída real no SUMMARY)

```bash
npx eslint src/hooks/useReadiness.ts src/pages/Demo.tsx src/pages/Demo.test.tsx
npm test -- --run
npx tsc --noEmit
npm run build
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```

Esperado: eslint sem erros nesses 3 arquivos, 0 falhas nos testes (hoje 561 passam), tsc e build limpos, diff dos blindados vazio.

## Entrega

`.planning/phases/18-corrigir-hook-lint/PLAN.md` e `SUMMARY.md`. Commit só dos 4 arquivos: `fix(demo): hook de convidado separado, sem hook condicional`. Sem push.
