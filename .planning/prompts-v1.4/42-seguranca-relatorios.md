/gsd-quick Fase 42 do marco v1.4 (CrewVitals): Segurança de Missão, relatórios e chatbot em EN e PT. Pode rodar já, em paralelo com as demais fases 32 a 44 (depende só do núcleo i18n da fase 21, que já existe).

## Contexto

Depois do login o app (`/dashboard` e demais telas) segue só em português e não tem seletor de idioma, porque no v1.3 o `LangProvider` cobriu apenas `/`, `/auth` e `/demo`. O v1.4 traduz a área logada para EN e PT. Esta fase cuida de: relatório de Segurança de Missão (NR-1), gerador de relatório PGR, Relatórios IA e Chatbot de Segurança.

Leia antes: `.planning/prompts-v1.4/RULES.md` (método, testes, verificação e entrega: siga tudo), `.planning/prompts-v1.4/GLOSSARY-APP.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`.

## Arquivos exclusivos

- `src/components/NR1Report.tsx`
- `src/components/PGRReportGenerator.tsx`
- `src/components/NarrativeReportGenerator.tsx`
- `src/components/NR1ComplianceChatbot.tsx`
- `src/components/NR1ComplianceScoreCard.tsx`
- `src/hooks/useNR1ComplianceScore.ts` (rótulos e textos exibidos; a regra de pontuação não muda)
- `src/i18n/locales/safety.ts`

Namespace do dicionário: `safety` (arquivo `src/i18n/locales/safety.ts`, chaves `safety.*`). Não edite nenhum arquivo fora desta lista; outros terminais cuidam do resto.

## Específico desta fase

1. Termos normativos brasileiros (NR-1, PGR, riscos psicossociais): em EN use a forma descritiva (por exemplo "NR-1 (Brazilian workplace safety regulation)") na primeira ocorrência e mantenha a sigla depois; registre as escolhas no SUMMARY.
2. Relatórios gerados na tela (texto montado pelo componente) seguem o idioma ativo; respostas de IA e do chatbot em runtime continuam como vierem do backend (registre como pendência).
3. Não afirme conformidade legal nem certificação: preserve o PT e traduza fielmente; se o texto atual afirmar conformidade, liste no SUMMARY como risco para outra fase.

## Entrega

`.planning/phases/42-seguranca-relatorios/PLAN.md` e `SUMMARY.md`. Commit só dos arquivos exclusivos: `feat(seguranca): relatorios e chatbot de seguranca em ingles e portugues`. Sem push.
