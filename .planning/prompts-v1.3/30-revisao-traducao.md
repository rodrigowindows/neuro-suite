/gsd-verify-work Fase 30 do marco v1.3 (CrewVitals): revisão da qualidade das traduções EN/PT. Rode somente depois das fases 21 a 29 commitadas.

## Contexto

As fases 22 a 25 traduziram `/demo`, o alerta preditivo, a landing e o login; a 26 a 29 produziram deck, roteiro de vídeo, README e documentos de publicação em EN e PT. Cada fase traduziu isolada. Esta revisão procura inconsistência de termos, inglês pouco natural, texto PT alterado sem querer e alegações novas. Leia antes: `AGENTS.md`, `.planning/prompts-v1.3/GLOSSARY.md` e os `SUMMARY.md` das fases 21 a 29 (principalmente os "termos novos").

## Arquivos que podem ser alterados

Somente `src/i18n/locales/*.ts` (traduções já existentes) e os `SUMMARY.md` das fases. Não altere componentes, testes, documentos de apresentação nem README: se achar problema neles, descreva com arquivo e linha e proponha o prompt de correção.

## Tarefas

1. Consistência de termos: extraia todas as strings EN de `src/i18n/locales/*.ts` e confira contra o `GLOSSARY.md`: os três estados (GO - FIT FOR SHIFT, CAUTION - WATCH, NO-GO - FATIGUE (NOT FIT)), os botões, "Blinks/min", "Sleep", "simulated data". Dois termos diferentes para o mesmo conceito entre arquivos (por exemplo "Crew" e "Team") é defeito.
2. PT preservado: compare os textos PT dos locales com o texto original das telas em `git show 99aee14:src/pages/Index.tsx`, `Auth.tsx` e com o commit anterior de `Demo.tsx` e `PredictiveAlert.tsx`. Qualquer diferença não intencional é FALHOU com chave e valor antigo e novo.
3. Honestidade: procure em EN e PT qualquer alegação nova ("validated", "certified", "NASA-approved", "real-time", "medical device", "clinically proven", "100% offline", "zero data leaks", depoimentos, números não presentes no cenário). O alerta preditivo e a ressalva "not a validated clinical prediction" devem estar presentes em ambas as línguas.
4. Qualidade do inglês: frases naturais e operacionais, ortografia dos EUA, sem calques do português ("fatigue state of the crew member who is not apt"), sem exclamações de marketing. Corrija diretamente em `src/i18n/locales/*.ts` quando for tradução, mantendo as mesmas chaves e valores PT.
5. Rode o teste de paridade e o conjunto completo depois de qualquer correção.

## Verificação (cole a saída real no SUMMARY)

```bash
npm test -- --run
npx tsc --noEmit
npx eslint src/i18n
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
git status --short
```

Esperado: 0 falhas; só `src/i18n/locales/*.ts` e SUMMARYs alterados.

## Entrega

`.planning/phases/30-revisao-traducao/SUMMARY.md` com tabela de achados (arquivo, chave, antes, depois, motivo) e lista do que ficou para outro prompt. Commit só dos locales alterados: `fix(i18n): revisao de termos e naturalidade do ingles`. Sem push. Se não houver correção, não commite.
