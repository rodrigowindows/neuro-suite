/gsd-quick Fase 40 do marco v1.4 (CrewVitals): IA Insights, Alertas Comando e ROI em EN e PT. Pode rodar já, em paralelo com as demais fases 32 a 44 (depende só do núcleo i18n da fase 21, que já existe).

## Contexto

Depois do login o app (`/dashboard` e demais telas) segue só em português e não tem seletor de idioma, porque no v1.3 o `LangProvider` cobriu apenas `/`, `/auth` e `/demo`. O v1.4 traduz a área logada para EN e PT. Esta fase cuida de: telas de gestão: IA Insights, Alertas Comando (incluindo o gerador de alertas) e ROI.

Leia antes: `.planning/prompts-v1.4/RULES.md` (método, testes, verificação e entrega: siga tudo), `.planning/prompts-v1.4/GLOSSARY-APP.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`.

## Arquivos exclusivos

- `src/components/AIInsightsDashboard.tsx`
- `src/components/HRAlerts.tsx`
- `src/components/ROIDashboard.tsx`
- `src/services/alertGenerator.ts` e `src/services/alertGenerator.test.ts`
- `src/services/roiCalculator.ts` e `src/services/roiCalculator.test.ts` (somente se produzirem texto exibido)
- `src/i18n/locales/insights.ts`

Namespace do dicionário: `insights` (arquivo `src/i18n/locales/insights.ts`, chaves `insights.*`). Não edite nenhum arquivo fora desta lista; outros terminais cuidam do resto.

## Específico desta fase

1. `alertGenerator.ts` produz mensagens em português: mantenha o padrão PT e ofereça variante por idioma (parâmetro `lang` ou função de mensagens), sem mudar os tipos, severidades nem a lógica dos alertas. Liste os chamadores com `git grep`.
2. Moeda e números: formatar por idioma sem mudar cálculo (`ROIDashboard`). Não troque a moeda dos valores calculados; se hoje exibe R$, mantenha e apenas formate o número conforme o idioma, registrando a decisão no SUMMARY.
3. Textos gerados por IA em runtime não se traduzem aqui.

## Entrega

`.planning/phases/40-insights-alertas/PLAN.md` e `SUMMARY.md`. Commit só dos arquivos exclusivos: `feat(gestao): insights, alertas e roi em ingles e portugues`. Sem push.
