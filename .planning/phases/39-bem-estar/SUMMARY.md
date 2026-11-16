# Resumo da Fase 39: Internacionalização de Disciplina, Pausas, Carga Cognitiva e Liderança (EN e PT)

## Resumo
A Fase 39 do marco v1.4 internacionalizou com sucesso todos os componentes da suíte de Bem-Estar e Prontidão:
- **GamificationScoreCard**: tradução de títulos, níveis, contadores de ciclos, sequências e progresso de missão.
- **Gamification**: tradução de sequências de monitoramento, contadores, badges em exibição e metas dinâmicas, mantendo os nomes persistidos intactos no banco de dados.
- **SmartBreakAssistant**: formulário de carga cognitiva, energia, última pausa, estados de carregamento, badges de urgência e cartões de sugestão bilíngues com apoio operacional sem alegações clínicas.
- **CognitiveFatigueAnalyzer**: tradução de avisos operacionais de apoio à decisão (não substitui avaliação médica), áreas cognitivas, contadores de caracteres, indicadores e recomendações operacionais.
- **LeadershipCoaching**: internacionalização completa de módulos, 20 sessões práticas de exercícios com PNL/neurociência, selos Pro e cartões de upgrade.
- **useGamificationScore**: hook bilíngue com suporte a `useI18n()` e fallback padrão para português mantendo 100% de retrocompatibilidade com testes e chamadores existentes.
- **wellness.ts**: novo dicionário bilingue com namespace `wellness.*` e paridade estrita 1:1 entre `en` e `pt`.

## Chamadores de `useGamificationScore` (git grep)
```
src/components/GamificationScoreCard.tsx:4:import { useGamificationScore } from '@/hooks/useGamificationScore';
src/components/GamificationScoreCard.tsx:25:  const { level, nextLevel, progressToNext, badges, streak, totalScans, loading } = useGamificationScore();
src/hooks/useGamificationScore.test.ts:4:import { getLevelForXP, computeXP, LEVELS, useGamificationScore } from "./useGamificationScore";
src/hooks/useGamificationScore.test.ts:140:    renderHook(() => useGamificationScore());
src/hooks/useGamificationScore.ts:55:export function useGamificationScore(options?: { t?: (key: string) => string }): GamificationData {
```
Nenhum contrato quebrado; retrocompatibilidade preservada.

## Termos Novos no Dicionário (`wellness.*`)
- Níveis: `wellness.level.1` a `wellness.level.10` (Beginner .. NeuroElite / Iniciante .. NeuroElite)
- Disciplina / Gamificação: `wellness.gamification.title`, `emptyNotice`, `cyclesCompletedCount`, `stage`, `stageSubtitle`, `missionProgress`, `allStagesComplete`, `cyclesCompleted`, `monitoringStreak`, `protocolsUpToDate`, `protocolsUpToDateCount`, `streakActive`, `streakInactive`, `longestStreakTitle`, `longestStreakDesc`, `toastOffline`, `protocolUnlockedTitle`, `protocolUnlockedDesc`, `nextGoal`, `goalResilience`, `goal30Days`, `goalMax`
- Conquistas / Badges (apenas exibição): `wellness.badge.first_scan.*`, `warrior.*`, `zen_master.*`, `hrv_hero.*`, `low_stress_keeper.*`
- Pausas Inteligentes: `wellness.breaks.title`, `description`, `cognitiveLoadLabel`, `selectPlaceholder`, `mood.*`, `energyLabel`, `energy.*`, `lastBreakLabel`, `lastBreak.*`, `period.*`, `statusLine`, `generating`, `generateButton`, `errorTitle`, `errorDesc`, `urgencyBadge`, `urgency.*`, `nextBreakBadge`, `evidenceLabel`, `expectedBenefitLabel`, `startButton`, `completeButton`, `dailyPlanTitle`, `local.*`
- Fadiga Cognitiva: `wellness.fatigue.tooShortTitle`, `tooShortDesc`, `alertToastTitle`, `alertToastFallback`, `errorTitle`, `errorDesc`, `title`, `subtitle`, `inputLabel`, `inputPlaceholder`, `charCount`, `analyzing`, `analyzeButton`, `level.*`, `scoreTitle`, `area.*`, `indicatorsTitle`, `recommendationTitle`, `local.*`
- Liderança: `wellness.leadership.proBadge`, `sessionsCount`, `sessionDesc`, `availableInPro`, `startSession`, `upsellTitle`, `upsellDesc`, `upsellButton`, `mod.auto.*`, `mod.conflict.*`, `mod.leadership.*`, `mod.career.*`

## O Que Ficou Fora da Tradução
- Nomes de conquistas e descrições gravados em banco (`user_progress.badges`): salvos com os literais padrão em português (`'Check-in Inicial'`, `'Protocolo de Resiliência'`, `'HRV Hero'`, etc.). Apenas a camada visual traduz dinamicamente com base no `badge.id`.
- Chaves de persistência, nomes de colunas do Supabase e payload da função `smart-breaks` (`timeOfDay: 'manhã' | 'tarde' | 'noite'`).

## Saídas Reais de Verificação

### 1. `git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]"` (arquivos de código sem testes)
```
src/components/Gamification.tsx:137:          addBadge('low_stress_keeper', 'Estabilidade Fisiológica', '3 scans low consecutivos!', 'Trophy');
src/components/Gamification.tsx:313:        {/* Próximo objetivo */}
src/components/SmartBreakAssistant.tsx:64:  const timeOfDay = now.getHours() < 12 ? 'manhã' : now.getHours() < 18 ? 'tarde' : 'noite';
src/hooks/useGamificationScore.ts:32:  { level: 5, title: 'Avançado', titleKey: 'wellness.level.5', minXP: 700, maxXP: 1200 },
src/hooks/useGamificationScore.ts:35:  { level: 8, title: 'Grão-Mestre', titleKey: 'wellness.level.8', minXP: 3500, maxXP: 5500 },
```
*Comentários JSX, payload de persistência do banco/função e fallbacks retrocompatíveis no hook.*

### 2. `npx eslint` nos arquivos exclusivos
```
C:\Projetos\neuro-suite\src\components\Gamification.tsx
  56:6  warning  React Hook useEffect has missing dependencies: 'loadProgress' and 'user'. Either include them or remove the dependency array    react-hooks/exhaustive-deps
  62:6  warning  React Hook useEffect has missing dependencies: 'updateProgress' and 'user'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

✖ 2 problems (0 errors, 2 warnings)
```

### 3. Testes Unitários dos Arquivos Exclusivos e i18n
```
 ✓ src/i18n/i18n.test.ts (16 tests) 113ms
 ✓ src/hooks/useGamificationScore.test.ts (25 tests) 354ms
 ✓ src/components/Gamification.test.tsx (5 tests) 196ms
 ✓ src/components/CognitiveFatigueAnalyzer.test.tsx (3 tests) 302ms

Test Files  4 passed (4)
Tests       49 passed (49)
```

### 4. `npx tsc --noEmit`
```
(Exit code 0, sem erros de tipagem)
```

### 5. `npm run build`
```
vite v5.4.19 building for production...
✓ 3131 modules transformed.
dist/assets/LeadershipCoaching-By3fkSYb.js            4.57 kB │ gzip:   1.42 kB
dist/assets/CognitiveFatigueAnalyzer-BoiBhBoq.js      5.36 kB │ gzip:   1.89 kB
dist/assets/SmartBreakAssistant-Bs11FnKP.js           7.28 kB │ gzip:   2.34 kB
dist/assets/Gamification-DZ8_J22U.js                  8.42 kB │ gzip:   2.85 kB
✓ built in 17.59s
```

### 6. `git diff --stat` nos arquivos blindados
```
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
(vazio, 0 alterações)
```
