# Fase 37 — BioScore, Scan por Webcam e Cartão de Bem-Estar em EN e PT

## Status: Concluída com sucesso

### Arquivos Modificados / Criados (Escopo Exclusivo)
- `src/i18n/locales/bioscore.ts` (novo): Dicionário com chaves `bioscore.*` cobrindo captura por webcam, progresso, resultado, métricas, dicas PNL, plano de ação e cartão de pontuação de bem-estar em inglês e português com 100% de paridade.
- `src/components/features/NeuroScore/ScanProgress.tsx`: Internacionalizado com `useI18n()` e `bioscore.scan.progress`.
- `src/components/features/NeuroScore/ScanProgress.test.tsx`: Testes expandidos com cobertura sob `LangProvider` (`en` e `pt`).
- `src/components/features/NeuroScore/ScanResult.tsx`: Internacionalizado para badges, nível, mensagens, métricas com `roundBlinkRate`, diagnóstico, dica PNL e confiança do modelo.
- `src/components/features/NeuroScore/ScanResult.test.tsx`: Testes expandidos com cobertura multilíngue (`en` e `pt`).
- `src/components/features/NeuroScore/index.tsx`: Internacionalizado para título, descrição, botões de scan, tooltip e toasts (online e autônomo).
- `src/components/features/NeuroScore/index.test.tsx`: Testes expandidos com cobertura multilíngue (`en` e `pt`).
- `src/components/NeuroScore.tsx`: Internacionalizado (legado) mantendo compatibilidade total e consumindo `bioscore.*`.
- `src/components/NeuroScore.test.tsx`: Testes expandidos com cobertura multilíngue (`en` e `pt`).
- `src/components/WebcamCapture.tsx`: Internacionalizado para permissões de câmera, câmera desligada/ligada, indicador de background, avisos de posicionamento e luz baixa, métricas em tempo real (`roundBlinkRate`), preservando `console.log` protegido por `import.meta.env.DEV`.
- `src/components/WellnessScoreCard.tsx`: Internacionalizado para título, estado vazio, tendências, sufixo "de 100", barras de quebra (estresse, consistência, HRV) e rótulo de pontuação.
- `src/components/PostScanActionPlan.tsx`: Internacionalizado para plano operacional autônomo, tarefas, durações e avisos de prevenção.
- `src/services/stressCalculator.ts`: Adicionado suporte opcional a `t` para exibição traduzida, mantendo retorno padrão idêntico em português e cálculos matemáticos intocados.
- `src/services/stressCalculator.test.ts`: Testes ampliados cobrindo internacionalização com `translate`.
- `src/hooks/useWellnessScore.ts`: Adicionado suporte opcional a `t` em `getLabel` e integração de `useI18n()`, preservando lógica e valores numéricos.
- `src/hooks/useWellnessScore.test.ts`: Testes ampliados cobrindo rótulos bilíngues.

### Termos Novos no Dicionário (`src/i18n/locales/bioscore.ts`)
- Header: `bioscore.title`, `bioscore.description`
- Botões e Tooltips: `bioscore.btn.newScan`, `bioscore.btn.startScan`, `bioscore.tooltip.position`
- Progresso: `bioscore.scan.progress`
- Toasts: `bioscore.toast.offlineTitle`, `bioscore.toast.onlineTitle`, `bioscore.toast.desc`, `bioscore.toast.hrvSuffix`
- Badges e Níveis: `bioscore.badge.*`, `bioscore.stress.*`, `bioscore.result.levelHeading`, `bioscore.result.confidence`
- Métricas: `bioscore.metric.*`, `bioscore.diagnostic.*`
- Mensagens e Dicas: `bioscore.msg.*`, `bioscore.pnl.*`
- Webcam: `bioscore.webcam.*` (permissões, alertas visuais, métricas em tempo real)
- Bem-Estar: `bioscore.wellness.*` (título, estados, tendências, detalhamento)
- Plano Pós-Scan: `bioscore.plan.*` (ações, durações, mantra autônomo)

### O que ficou fora (Preservação de Dados e Lógica)
- Nomes de tabelas e colunas (`stress_scans`, `blink_rate`, `stress_level`, `hrv_value`, `user_id`).
- Valores enumerados gravados no banco (`low`, `moderate`, `high`).
- Payload de Edge Functions (`ai-insights` invoke com `type: 'action_plan'`).
- Chaves de `localStorage` (`crewvitals_lang`, etc.).

### Chamadores Identificados via `git grep`
- `stressCalculator`:
  - `src/components/features/NeuroScore/ScanResult.tsx`
  - `src/components/features/NeuroScore/index.tsx`
  - `src/components/NeuroScore.tsx`
  - `src/services/stressCalculator.test.ts`
  - `src/components/features/NeuroScore/ScanResult.test.tsx`
- `useWellnessScore`:
  - `src/components/WellnessScoreCard.tsx`
  - `src/hooks/useReadiness.ts`
  - `src/pages/Dashboard.tsx`
  - `src/hooks/useWellnessScore.test.ts`
  - `src/hooks/useReadiness.test.ts`
  - `src/pages/Dashboard.test.tsx`
  - `src/components/BridgeConsole.test.tsx`

---

## Resultados das Validações

### 1. Verificação de Acentos no JSX (`git grep`)
```bash
git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]" -- src/components/features/NeuroScore/index.tsx src/components/features/NeuroScore/ScanProgress.tsx src/components/features/NeuroScore/ScanResult.tsx src/components/NeuroScore.tsx src/components/WebcamCapture.tsx src/components/WellnessScoreCard.tsx src/components/PostScanActionPlan.tsx src/services/stressCalculator.ts src/hooks/useWellnessScore.ts
```
Saída: Zero acentos em elementos JSX visíveis. Ocorrências restantes limitadas estritamente a comentários de código, fallbacks para chamadores sem `t` e payloads de edge function.

### 2. ESLint
```bash
npx eslint src/components/features/NeuroScore/ src/components/NeuroScore.tsx src/components/WebcamCapture.tsx src/components/WellnessScoreCard.tsx src/components/PostScanActionPlan.tsx src/services/stressCalculator.ts src/services/stressCalculator.test.ts src/hooks/useWellnessScore.ts src/hooks/useWellnessScore.test.ts src/i18n/locales/bioscore.ts
```
Saída: 0 erros, 0 avisos (código de saída 0).

### 3. Vitest
```bash
npm test -- --run
```
Saída real:
```text
Test Files  52 passed (52)
     Tests  679 passed (679)
  Duration  66.40s
```
- Testes de `features/NeuroScore/ScanProgress.test.tsx` (7 testes) aprovados.
- Testes de `features/NeuroScore/ScanResult.test.tsx` (13 testes) aprovados.
- Testes de `features/NeuroScore/index.test.tsx` (3 testes) aprovados.
- Testes de `NeuroScore.test.tsx` (3 testes) aprovados.
- Testes de `stressCalculator.test.ts` (26 testes) aprovados.
- Testes de `useWellnessScore.test.ts` (26 testes) aprovados.
- Testes de paridade de `src/i18n/i18n.test.ts` (16 testes) verificaram e aprovaram o novo namespace `bioscore`.

### 4. TypeScript
```bash
npx tsc --noEmit
```
Saída: 0 erros (código de saída 0).

### 5. Build de Produção
```bash
npm run build
```
Saída:
```text
✓ 3131 modules transformed.
dist/index.html                                       2.18 kB │ gzip:   0.82 kB
dist/assets/index-DY38nOFF.js                     1,054.84 kB │ gzip: 302.29 kB
✓ built in 15.75s
```

### 6. Verificação de Arquivos Blindados
```bash
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```
Saída: Vazio (0 alterações).
