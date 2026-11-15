/gsd-quick Fase 23 do marco v1.3 (CrewVitals): `PredictiveAlert` em inglês e português. Rode somente depois do commit da fase 21.

## Contexto

`src/components/PredictiveAlert.tsx` (37 linhas) tem textos fixos em português e é usado na `/demo` e no cockpit do Dashboard. O Dashboard deve continuar em português; só a `/demo` muda de idioma. Isso funciona porque `useI18n()` fora de um `LangProvider` devolve português (contrato da fase 21). Leia antes: `AGENTS.md`, `.planning/prompts-v1.3/00-LEIA-ME.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`, `src/components/PredictiveAlert.tsx`.

## Arquivos exclusivos

`src/components/PredictiveAlert.tsx`, `src/components/PredictiveAlert.test.tsx` (novo), `src/i18n/locales/predictive.ts` (novo). Não mude as props do componente (`onMitigate`, `bioScore`).

## O que implementar

1. `src/i18n/locales/predictive.ts` com `en` e `pt`: `predictive.badge` (PT "Demonstração", EN "Demo"), `predictive.message` (PT "Risco de erro em tarefas de precisão nas próximas 4 h — suspender acoplagem/EVA.", EN "Risk of errors in precision tasks over the next 4 h — suspend docking/EVA."), `predictive.disclaimer` (PT "Cenário demonstrativo — não é uma previsão clínica validada.", EN "Demonstration scenario — not a validated clinical prediction."). Prefixo do BioScore: `BioScore {score} — ` igual nas duas línguas (pode ser chave `predictive.bioscorePrefix`).
2. O componente passa a usar `useI18n()` e mantém exatamente a mesma estrutura, classes e comportamento. Em PT o texto renderizado deve ser idêntico ao atual.
3. Sem emojis; a ressalva de "não é previsão validada" tem que continuar visível nas duas línguas.

## Testes (AAA, `PredictiveAlert.test.tsx`)

- Sem provider: texto em português (garante que o Dashboard não muda).
- Com `<LangProvider initialLang="en">`: badge "Demo", mensagem e ressalva em inglês, com e sem `bioScore`.
- Com `<LangProvider initialLang="pt">`: textos em português.
- `onMitigate` continua sendo chamado ao clicar.
- Rode também `src/pages/Dashboard.test.tsx` e `src/components` relacionados para provar que nada quebrou.

## Verificação (cole a saída real no SUMMARY)

```bash
npx eslint src/components/PredictiveAlert.tsx src/components/PredictiveAlert.test.tsx src/i18n/locales/predictive.ts
npm test -- --run
npx tsc --noEmit
npm run build
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```

## Entrega

`.planning/phases/23-predictive-alert-i18n/PLAN.md` e `SUMMARY.md`. Commit só dos 3 arquivos: `feat(alerta): alerta preditivo em ingles e portugues`. Sem push.
