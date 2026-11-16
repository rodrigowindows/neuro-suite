# Fase 40 — IA Insights, Alertas Comando e ROI em EN e PT (CrewVitals)

## Status: Concluída com sucesso

### Arquivos Exclusivos
- `src/i18n/locales/insights.ts`: Novo dicionário cobrindo namespace `insights.*` com 63 chaves em total paridade entre `en` e `pt`.
- `src/components/AIInsightsDashboard.tsx`: Interface traduzida com `useI18n()` e `t(...)`, eliminando textos em português hardcoded e mantendo tipagem estrita (sem `any`).
- `src/components/HRAlerts.tsx`: Interface traduzida com `useI18n()`, tabs, formulário de thresholds, badges e lista de alertas integrados; alertas dinâmicos recebem `lang` reativo.
- `src/components/ROIDashboard.tsx`: Interface traduzida, formatando moedas e números com base no idioma ativo (`en-US` vs `pt-BR`), preservando o cálculo original em BRL (R$).
- `src/services/alertGenerator.ts`: Adicionado suporte a `lang: 'en' | 'pt' = 'pt'` mantendo padrão PT, sem alterar severidades, tipos ou lógica.
- `src/services/alertGenerator.test.ts`: Testes ampliados cobrindo 20 casos de teste (PT padrão e variante EN).
- `src/services/roiCalculator.ts`: `formatCurrency` atualizada para receber `lang: 'en' | 'pt' = 'pt'`.
- `src/services/roiCalculator.test.ts`: Testes ampliados cobrindo 20 casos de teste (PT e EN).

---

### Chamadores Identificados (`git grep`)
1. `alertGenerator.ts`:
   - `src/components/HRAlerts.tsx` (consome `generateAlerts`, `sortAlerts`, `getAlertStyles`, `Alert`)
   - `src/services/alertGenerator.test.ts` (suíte unitária)
2. `roiCalculator.ts`:
   - `src/components/ROIDashboard.tsx` (consome `calculateROI`, `formatCurrency`, `ROIInputs`)
   - `src/services/roiCalculator.test.ts` (suíte unitária)

---

### Decisão sobre Moeda e Formatação (`ROIDashboard`)
- A moeda dos valores calculados permanece estritamente em **BRL (R$)** conforme requisitos arquiteturais do projeto (sem conversão cambial fictícia).
- Apenas a formatação gráfica e separadores decimais/milhares são adaptados conforme a localidade:
  - Em português (`pt`): `pt-BR` (`R$ 1.234,56`).
  - Em inglês (`en`): `en-US` (`R$1,234.56`).

---

### O que ficou fora da tradução (conforme especificação e RULES.md)
1. **Textos gerados por IA em tempo real**:
   - `burnout.prediction`, `burnout.factors`, `burnout.recommendation`, `summary.headline`, `summary.highlights`, `summary.concerns`, `summary.actions`, `summary.executiveSummary`, `sentiment.insight`.
2. **Textos de IA simulados localmente em modo autônomo**:
   - Mensagens com prefixo `Gerado localmente (regras fixas, sem IA em nuvem):...` em `AIInsightsDashboard.tsx` e `HRAlerts.tsx`.
3. **Valores enviados em payloads / persistidos**:
   - `data.trend` (`'piorando' | 'melhorando' | 'estável'`) consumido pela edge function `ai-insights`.

---

### Verificação Real Executada

#### 1. Verificação de Acentuação nos Componentes
```bash
git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]" -- src/components/AIInsightsDashboard.tsx src/components/HRAlerts.tsx src/components/ROIDashboard.tsx
```
Saída:
```text
src/components/AIInsightsDashboard.tsx:76:    const trend = recentHigh > olderHigh * 1.2 ? 'piorando' : recentHigh < olderHigh * 0.8 ? 'melhorando' : 'estável';
src/components/AIInsightsDashboard.tsx:118:          prediction: 'Gerado localmente (regras fixas, sem IA em nuvem): Análise de tendência baseada em contagem de scans com estresse elevado.',
src/components/AIInsightsDashboard.tsx:120:          recommendation: 'Gerado localmente (regras fixas, sem IA em nuvem): Priorize hidratação e pausas guiadas 4-7-8.',
src/components/AIInsightsDashboard.tsx:121:          timeframe: 'Próximos 7 dias',
src/components/AIInsightsDashboard.tsx:126:          narrative: 'Gerado localmente (regras fixas, sem IA em nuvem): Resumo semanal sintetizado a partir de medições locais de prontidão e HRV.',
src/components/AIInsightsDashboard.tsx:127:          highlights: ['Medições consistentes com protocolos de prontidão'],
src/components/AIInsightsDashboard.tsx:129:          recommendations: ['Manter rotina de contramedidas e hidratação.'],
src/components/HRAlerts.tsx:62:        setAiSummary('Gerado localmente (regras fixas, sem IA em nuvem): Análise proativa baseada em limites determinísticos de fadiga local.');
```
*(Restrito exclusivamente ao payload da edge function e às strings simuladas de IA em runtime).*

#### 2. ESLint
```bash
npx eslint src/components/AIInsightsDashboard.tsx src/components/HRAlerts.tsx src/components/ROIDashboard.tsx src/services/alertGenerator.ts src/services/alertGenerator.test.ts src/services/roiCalculator.ts src/services/roiCalculator.test.ts src/i18n/locales/insights.ts
```
Saída: Código de saída 0 (0 erros, 0 avisos).

#### 3. TypeScript
```bash
npx tsc --noEmit
```
Saída: Código de saída 0 (0 erros).

#### 4. Vitest
```bash
npm test -- --run
```
Saída:
```text
 Test Files  52 passed (52)
      Tests  679 passed (679)
```
- `src/i18n/i18n.test.ts`: 16 testes aprovados (paridade de `insights.ts` validada).
- `src/services/alertGenerator.test.ts`: 20 testes aprovados.
- `src/services/roiCalculator.test.ts`: 20 testes aprovados.

#### 5. Build de Produção
```bash
npm run build
```
Saída:
```text
✓ 3131 modules transformed.
✓ built in 16.56s
```

#### 6. Blindagem de Arquivos
```bash
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```
Saída: Vazia (0 alterações nos arquivos protegidos).
