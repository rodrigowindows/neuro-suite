# Plano de Execução - Fase 41: Painel de Comando e Indicadores em EN e PT

## Objetivo
Internacionalizar os componentes do Painel de Comando (`DashboardRH`, `TurnoverPrediction`, `SectorBenchmark`, `CompanyScoreCard`, `WeeklyComparison`, `StressTrendChart`), o hook `useCompanyScore` e criar o dicionário `src/i18n/locales/command.ts` com namespace `command.*`, suportando Português (PT) e Inglês (EN), preservando textos atuais em PT, chaves de dados de gráficos e mantendo explicitamente rotulada a demonstração/estimativa em `TurnoverPrediction`.

## Arquivos Exclusivos
- `src/i18n/locales/command.ts` (criação do catálogo `command.*` em `en` e `pt`)
- `src/components/DashboardRH.tsx`
- `src/components/TurnoverPrediction.tsx`
- `src/components/SectorBenchmark.tsx`
- `src/components/CompanyScoreCard.tsx`
- `src/components/WeeklyComparison.tsx`
- `src/components/StressTrendChart.tsx`
- `src/hooks/useCompanyScore.ts`
- `src/hooks/useCompanyScore.test.ts`

## Etapas de Execução

1. **Criação do Dicionário `src/i18n/locales/command.ts`**:
   - Mapear chaves sob namespace `command.*` com paridade 1:1 rigorosa entre `en` e `pt`.
   - Seções:
     - `command.dashboard.*`: títulos, KPIs, exportação CSV, gráficos, predição IA, métricas.
     - `command.turnover.*`: título, selo de demonstração/estimativa, KPIs de risco, custos, tabela de colaboradores, ações de retenção, estados vazios.
     - `command.benchmark.*`: setores, diffs, posições comparativas, rótulos e legendas de gráficos, rodapé.
     - `command.companyScore.*`: títulos, gauge, KPIs, badges de saúde organizacional, distribuição, tendências.
     - `command.weekly.*`: título, semana anterior/atual, médias de prontidão e energia, estados vazios, badges de variação.
     - `command.trend.*`: períodos, indicadores de tendência, tooltips, legendas e eixos de estresse e HRV, formatação de data por idioma.

2. **Adaptação de `useCompanyScore.ts` e `useCompanyScore.test.ts`**:
   - Manter compatibilidade total de chamada existente (parâmetro `t?: (key: string) => string`).
   - Atualizar testes mantendo os testes existentes e adicionando cenários de internacionalização.

3. **Adaptação dos Componentes JSX**:
   - `DashboardRH.tsx`: uso de `useI18n()`, `t(...)`, labels do ChartJS e formatação.
   - `TurnoverPrediction.tsx`: uso de `useI18n()`, `t(...)`, manutenção explícita do selo e rótulos de demonstração/estimativa.
   - `SectorBenchmark.tsx`: uso de `useI18n()`, `t(...)`, labels do gráfico e opções de setor traduzidas.
   - `CompanyScoreCard.tsx`: uso de `useI18n()`, `t(...)`, distribuição e KPIs traduzidos.
   - `WeeklyComparison.tsx`: uso de `useI18n()`, `t(...)`, níveis de humor e prontidão traduzidos.
   - `StressTrendChart.tsx`: uso de `useI18n()`, formatação de datas via `Intl` ou `toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US')`, tooltips traduzidos, chaves de dados do Recharts (`stressScore`, `hrvAvg`, `label`) inalteradas.

4. **Verificação e Testes**:
   - Executar `git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]"` para garantir ausência de caracteres acentuados hardcoded nos componentes.
   - Executar `npx eslint`.
   - Executar testes com `npm test -- src/hooks/useCompanyScore.test.ts src/i18n/i18n.test.ts --run`.
   - Executar `npx tsc --noEmit`.
   - Executar `npm run build`.
   - Verificar `git diff --stat` para arquivos blindados.
   - Gerar `SUMMARY.md`.
   - Realizar commit atômico exclusivo.
