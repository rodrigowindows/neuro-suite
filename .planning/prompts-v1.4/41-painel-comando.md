/gsd-quick Fase 41 do marco v1.4 (CrewVitals): Painel de Comando e indicadores em EN e PT. Pode rodar já, em paralelo com as demais fases 32 a 44 (depende só do núcleo i18n da fase 21, que já existe).

## Contexto

Depois do login o app (`/dashboard` e demais telas) segue só em português e não tem seletor de idioma, porque no v1.3 o `LangProvider` cobriu apenas `/`, `/auth` e `/demo`. O v1.4 traduz a área logada para EN e PT. Esta fase cuida de: Painel de Comando e seus cartões: rotatividade, benchmark setorial, pontuação da empresa, comparação semanal e tendência de estresse.

Leia antes: `.planning/prompts-v1.4/RULES.md` (método, testes, verificação e entrega: siga tudo), `.planning/prompts-v1.4/GLOSSARY-APP.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`.

## Arquivos exclusivos

- `src/components/DashboardRH.tsx`
- `src/components/TurnoverPrediction.tsx`
- `src/components/SectorBenchmark.tsx`
- `src/components/CompanyScoreCard.tsx`
- `src/components/WeeklyComparison.tsx`
- `src/components/StressTrendChart.tsx`
- `src/hooks/useCompanyScore.ts` e `src/hooks/useCompanyScore.test.ts` (rótulos exibidos)
- `src/i18n/locales/command.ts`

Namespace do dicionário: `command` (arquivo `src/i18n/locales/command.ts`, chaves `command.*`). Não edite nenhum arquivo fora desta lista; outros terminais cuidam do resto.

## Específico desta fase

1. Rótulos de gráficos, legendas, eixos, tooltips e estados vazios entram no dicionário. Datas e dias da semana por idioma.
2. `TurnoverPrediction` é uma demonstração/estimativa: mantenha qualquer rótulo de demonstração e não o reescreva como previsão validada (`AGENTS.md`: sem modelo preditivo validado). Se o texto atual afirmar mais do que o sistema faz, preserve o PT, traduza fielmente e registre no SUMMARY como risco de honestidade para outra fase.
3. Chaves de dados dos gráficos (nomes de campos) não mudam.

## Entrega

`.planning/phases/41-painel-comando/PLAN.md` e `SUMMARY.md`. Commit só dos arquivos exclusivos: `feat(comando): painel de comando e indicadores em ingles e portugues`. Sem push.
