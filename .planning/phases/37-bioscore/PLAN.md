# Fase 37 — BioScore, Scan por Webcam e Cartão de Bem-Estar em EN e PT

## Objetivo
Traduzir todo o fluxo do BioScore (captura por webcam, progresso do scan, resultado, dicas PNL, plano de ação pós-scan autônomo e cartão de pontuação de bem-estar) para inglês e português via dicionário `src/i18n/locales/bioscore.ts`, preservando paridade, cálculos matemáticos, dados persistidos e compatibilidade reversa.

## Escopo de Arquivos Exclusivos
- `src/i18n/locales/bioscore.ts` (novo)
- `src/components/features/NeuroScore/index.tsx`
- `src/components/features/NeuroScore/ScanProgress.tsx`
- `src/components/features/NeuroScore/ScanResult.tsx`
- `src/components/features/NeuroScore/index.test.tsx`
- `src/components/features/NeuroScore/ScanProgress.test.tsx`
- `src/components/features/NeuroScore/ScanResult.test.tsx`
- `src/components/NeuroScore.tsx`
- `src/components/WebcamCapture.tsx`
- `src/components/WellnessScoreCard.tsx`
- `src/components/PostScanActionPlan.tsx`
- `src/services/stressCalculator.ts` e `src/services/stressCalculator.test.ts`
- `src/hooks/useWellnessScore.ts` e `src/hooks/useWellnessScore.test.ts`

## Plano de Execução

1. **Dicionário (`src/i18n/locales/bioscore.ts`)**:
   - Criar arquivo exportando `en` e `pt` com paridade 100% e prefixo `bioscore.`.
   - Incluir permissões de câmera, estados do scan, posicionamento, taxa de piscadas, HRV (estimativas por webcam), diagnóstico, dicas PNL, plano de ação e métricas do cartão de bem-estar.

2. **Serviços e Hooks (`stressCalculator.ts`, `useWellnessScore.ts`)**:
   - Manter fallback padrão em português para chamadas legadas/sem `t`.
   - Adicionar suporte a parâmetro opcional `t` nas funções de rótulos/mensagens para internacionalização.
   - Preservar integridade dos testes existentes e adicionar novos testes cobrindo internacionalização.

3. **Componentes do BioScore**:
   - `WebcamCapture.tsx`: Traduzir mensagens de erro de permissão, alertas visuais (câmera desligada/ligada, background, posicionamento, luz baixa) e métricas em tempo real. Manter `console.log` protegido por `import.meta.env.DEV`.
   - `features/NeuroScore/ScanProgress.tsx`: Traduzir rótulo de progresso.
   - `features/NeuroScore/ScanResult.tsx`: Traduzir status badges, nível, mensagens, métricas (piscadas com `roundBlinkRate`, HRV), diagnóstico e dica PNL.
   - `features/NeuroScore/index.tsx` e `NeuroScore.tsx`: Traduzir título, descrição, botão de scan, tooltip e toasts (online e autônomo).
   - `WellnessScoreCard.tsx`: Traduzir título, estado vazio, tendências e barras de detalhamento (Estresse, Consistência, HRV).
   - `PostScanActionPlan.tsx`: Traduzir plano local autônomo, tarefas, durações e avisos.

4. **Testes Unitários e Paridade (AAA)**:
   - Manter testes existentes passando 100%.
   - Acrescentar testes em `ScanProgress.test.tsx`, `ScanResult.test.tsx`, `index.test.tsx`, `stressCalculator.test.tsx` e `useWellnessScore.test.ts` com `LangProvider initialLang="en"` e `initialLang="pt"`.
   - Validar teste de paridade em `src/i18n/i18n.test.ts`.

5. **Verificação Completa**:
   - `git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]"` nos componentes.
   - `npx eslint` nos arquivos exclusivos.
   - `npm test -- --run`.
   - `npx tsc --noEmit`.
   - `npm run build`.
   - `git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts`.
   - Gerar `SUMMARY.md` e realizar o commit atômico exclusivo.
