/gsd-quick Fase 39 do marco v1.4 (CrewVitals): disciplina, pausas, carga cognitiva e liderança em EN e PT. Pode rodar já, em paralelo com as demais fases 32 a 44 (depende só do núcleo i18n da fase 21, que já existe).

## Contexto

Depois do login o app (`/dashboard` e demais telas) segue só em português e não tem seletor de idioma, porque no v1.3 o `LangProvider` cobriu apenas `/`, `/auth` e `/demo`. O v1.4 traduz a área logada para EN e PT. Esta fase cuida de: telas Disciplina (gamificação), Pausas inteligentes, Métricas de Carga e Liderança.

Leia antes: `.planning/prompts-v1.4/RULES.md` (método, testes, verificação e entrega: siga tudo), `.planning/prompts-v1.4/GLOSSARY-APP.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`.

## Arquivos exclusivos

- `src/components/Gamification.tsx`
- `src/components/GamificationScoreCard.tsx`
- `src/components/SmartBreakAssistant.tsx`
- `src/components/CognitiveFatigueAnalyzer.tsx`
- `src/components/LeadershipCoaching.tsx`
- `src/hooks/useGamificationScore.ts` e `src/hooks/useGamificationScore.test.ts` (rótulos exibidos)
- `src/i18n/locales/wellness.ts`

Namespace do dicionário: `wellness` (arquivo `src/i18n/locales/wellness.ts`, chaves `wellness.*`). Não edite nenhum arquivo fora desta lista; outros terminais cuidam do resto.

## Específico desta fase

1. Traduza títulos, conquistas, níveis, desafios, dicas, botões, estados vazios e textos montados a partir de dados. Nomes de níveis ou conquistas gravados no banco não mudam; traduza só a exibição.
2. Se algum desses componentes tiver teste próprio, ele deve continuar passando sem provider.
3. Sem promessas de resultado nem alegações clínicas; recomendações são apoio à decisão.

## Entrega

`.planning/phases/39-bem-estar/PLAN.md` e `SUMMARY.md`. Commit só dos arquivos exclusivos: `feat(bem-estar): disciplina, pausas, carga e lideranca em ingles e portugues`. Sem push.
