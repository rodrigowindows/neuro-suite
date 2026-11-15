/gsd-quick Fase 22 do marco v1.3 (CrewVitals): página `/demo` em inglês e português. Rode somente depois do commit da fase 21.

## Contexto

`src/pages/Demo.tsx` tem todos os textos em português fixo. A fase 21 entregou `src/i18n/` (`useI18n`, `LangProvider`, `LanguageToggle`). A demo precisa de EN (padrão para navegadores não portugueses) e PT, com seletor visível. Leia antes: `AGENTS.md`, `.planning/prompts-v1.3/00-LEIA-ME.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`, `src/pages/Demo.tsx`, `src/pages/Demo.test.tsx`, `src/lib/demoScenario.ts`.

## Arquivos exclusivos

`src/pages/Demo.tsx`, `src/pages/Demo.test.tsx`, `src/i18n/locales/demo.ts`. Não toque em `PredictiveAlert.tsx` (fase 23), `demoScenario.ts`, `useReadiness.ts` nem `src/App.tsx`.

## O que implementar

1. `src/i18n/locales/demo.ts` com `en` e `pt`, chaves `demo.*`, cobrindo todo texto visível e `aria-label` de `Demo.tsx`: selo, títulos dos 3 estados e do estado sem dados, subtítulo do veredito, rótulos dos três números, botões do cabeçalho e da ação primária, link "Entrar", avisos de contramedida e de turno, botão "Fechar", título do log, selo DEMO do log, e as três mensagens do log. Os textos em PT devem ser **idênticos** aos atuais; os em EN seguem o `GLOSSARY.md`.
2. Log de eventos: não altere `demoScenario.ts`. Mapeie `readiness.logs[i].id` (`demo-log-1`, `demo-log-2`, `demo-log-3`) para chaves `demo.log.1.time`, `demo.log.1.message` etc. com interpolação do BioScore e do HRV quando o texto os citar. Se vier um id desconhecido, mostre `log.message` e `log.timeRelative` originais.
3. `Demo.tsx` usa `useI18n()` e `t(...)`. Inclua `<LanguageToggle />` no cabeçalho, visível em celular de 375 px sem estourar a linha (use `flex-wrap`).
4. Formatação: sono em PT mantém o formato atual (`5.5h` como hoje); em EN mostre `5.5 h`. Piscadas continuam inteiras via `roundBlinkRate`. Não mude valores do cenário nem a lógica do hook de convidado.
5. O `PredictiveAlert` continua sendo importado como está (a fase 23 o traduz internamente via `useI18n`, sem mudar props).
6. Nenhuma chamada ao Supabase, nenhum texto novo com alegação extra, sem emojis.

## Testes (AAA, em `Demo.test.tsx`)

- Mantenha os testes existentes, renderizando dentro de `<LangProvider initialLang="pt">` (os asserts em PT não mudam).
- Acrescente os mesmos fluxos em EN com `<LangProvider initialLang="en">`: selo "DEMO: simulated data"; etapa 1 "NO-GO - FATIGUE (NOT FIT)", BioScore 34, Blinks/min 14, Sleep 5.5 h; "Start 4-7-8 Protocol" leva a "CAUTION - WATCH", 52; "Simulate new scan" leva a "GO - FIT FOR SHIFT", 72, 18; "Restart demo" volta à etapa 1; log em EN (`[10 min ago]`).
- Troca em tempo de execução: clicar no seletor PT muda os textos sem recarregar e os números permanecem iguais.
- Mantenha o teste de zero chamadas a `from`, `auth.getUser` e `functions.invoke`.
- Paridade das chaves é coberta pelo teste da fase 21; rode-o.

## Verificação (cole a saída real no SUMMARY)

```bash
npx eslint src/pages/Demo.tsx src/pages/Demo.test.tsx src/i18n/locales/demo.ts
npm test -- --run
npx tsc --noEmit
npm run build
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```

Esperado: 0 falhas, eslint, tsc e build limpos, diff dos blindados vazio.

## Entrega

`.planning/phases/22-demo-i18n/PLAN.md` e `SUMMARY.md`. Commit só dos 3 arquivos: `feat(demo): demonstracao em ingles e portugues`. Sem push.
