# Resumo da Fase 35 — Contramedidas (NeuroCoach) em EN e PT

## Status: Concluído ✓

Internacionalização completa da tela de Contramedidas (`NeuroCoach`), do seletor de tom (`ToneSelector`), dos componentes de chat (`ChatInput`, `ChatMessages`), do serviço (`coachService`) e do hook de streaming (`useStreamingChat`) para EN e PT com paridade estrita e 100% de compatibilidade retroativa.

## Arquivos Exclusivos Modificados / Criados
- `src/i18n/locales/coach.ts` (novo dicionário com namespace `coach.` em EN e PT)
- `src/components/features/NeuroCoach/index.tsx` (interface principal de contramedidas e overlay 4-7-8)
- `src/components/features/NeuroCoach/ChatInput.tsx` (placeholder e botão de cancelamento)
- `src/components/features/NeuroCoach/ChatMessages.tsx` (indicador de digitação)
- `src/components/features/NeuroCoach/ToneSelector.tsx` (títulos e opções de tom)
- `src/components/features/NeuroCoach/NeuroCoach.test.tsx` (testes existentes + testes bilíngues com LangProvider)
- `src/components/features/NeuroCoach/ToneSelector.test.tsx` (testes existentes + testes bilíngues com LangProvider)
- `src/services/coachService.ts` (suporte a parâmetro opcional `lang: Lang = 'pt'`)
- `src/services/coachService.test.ts` (testes existentes + testes com `lang="en"`)
- `src/hooks/useStreamingChat.ts` (mensagens de erro internacionalizadas via `useI18n()`)
- `src/hooks/useStreamingChat.test.ts` (testes existentes + testes bilíngues com LangProvider)

## Termos Novos no Dicionário (`coach.ts`)
| Chave | PT | EN |
|---|---|---|
| `coach.title` | AstroAssist — Prescrição de Contramedidas | AstroAssist — Countermeasure Prescription |
| `coach.dssSubtitle` | Sistema de Suporte à Decisão (DSS) para Mitigação de Carga e Fadiga Operacional | Decision Support System (DSS) for Workload Mitigation and Operational Fatigue |
| `coach.badge.nasaHrp` | Diretrizes NASA HRP | NASA HRP Guidelines |
| `coach.badge.autonomous` | Gerado localmente (regras fixas, sem IA em nuvem) | Generated locally (fixed rules, no cloud AI) |
| `coach.status.fatigueDetected` | Status: Fadiga Detectada. | Status: Fatigue Detected. |
| `coach.status.fatigueDesc` | Risco de lapso atencional e degradação de prontidão. Execute as contramedidas prescritas abaixo. | Risk of attentional lapse and readiness degradation. Execute the countermeasures prescribed below. |
| `coach.btn.executeMitigation` | Executar Protocolo de Mitigação | Execute Mitigation Protocol |
| `coach.badge.highPriority` | Prioridade Alta | High Priority |
| `coach.progress.label` | Progresso das Contramedidas: {completed} de {total} executadas | Countermeasures Progress: {completed} of {total} executed |
| `coach.section.prescriptions` | Prescrições Operacionais Obrigatórias | Mandatory Operational Prescriptions |
| `coach.action1.title` | Ação 1 (Respiração): Executar ciclo 4-7-8 por 3 minutos. | Action 1 (Breathing): Execute 4-7-8 cycle for 3 minutes. |
| `coach.action1.badge` | Respiração 4-7-8 | 4-7-8 Breathing |
| `coach.action1.desc` | Inspire pelo nariz por 4s, retenha o ar por 7s e expire pela boca por 8s... | Inhale through the nose for 4s, hold breath for 7s... |
| `coach.timer.start` | Iniciar Timer Guiado (3 min) | Start Guided Timer (3 min) |
| `coach.timer.pause` | Pausar Timer | Pause Timer |
| `coach.timer.resume` | Retomar Timer | Resume Timer |
| `coach.timer.reset` | Zerar / Reiniciar | Reset / Restart |
| `coach.action2.title` | Ação 2 (Hidratação): Ingestão de 500ml de água. | Action 2 (Hydration): 500ml water intake. |
| `coach.action3.title` | Ação 3 (Descanso): Agendar ciclo de sono de 90 min no Biometric Log. | Action 3 (Rest): Schedule 90-min sleep cycle in Biometric Log. |
| `coach.overlay.title` | Protocolo de Mitigação — Respiração 4-7-8 | Mitigation Protocol — 4-7-8 Breathing |
| `coach.breathing.phase1.title` | Inspire pelo nariz (4s) | Inhale through the nose (4s) |
| `coach.breathing.phase2.title` | Retenha o ar nos pulmões (7s) | Hold breath in lungs (7s) |
| `coach.breathing.phase3.title` | Expire lentamente pela boca (8s) | Exhale slowly through the mouth (8s) |
| `coach.tone.title` | Escolha teu tom de comunicação: | Choose your communication tone: |
| `coach.chat.placeholder` | Descreva como se sente ou o que quer melhorar... | Describe how you feel or what you want to improve... |
| `coach.chat.typing` | AstroAssist está digitando | AstroAssist is typing |
| `coach.chat.errorSession` | Sessão expirada. Faça novamente o login. | Session expired. Please sign in again. |

## O Que Ficou Fora
- Respostas geradas em tempo real pela IA (edge function `nr1-chatbot`) e prompts no backend.
- Rótulos e strings persistidos em barramento de eventos (`appendEvent({ type: 'protocol', label: 'Contramedida registrada (...)' })`) e chaves do `localStorage` (`crewvitals_countermeasures_YYYY-MM-DD`), preservados conforme a Regra 7 de dados estáveis.

## Chamadores de Serviços e Hooks Modificados
- `src/services/coachService.ts`: chamado por `src/components/features/NeuroCoach/ChatMessages.tsx` (tipo `CoachMessage`) e `src/services/coachService.test.ts`.
- `src/hooks/useStreamingChat.ts`: chamado por `src/components/NR1ComplianceChatbot.tsx` e `src/hooks/useStreamingChat.test.ts`.

## Saídas Reais das Validações

### 1. `git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]" -- src/components/features/NeuroCoach/index.tsx src/components/features/NeuroCoach/ChatInput.tsx src/components/features/NeuroCoach/ChatMessages.tsx src/components/features/NeuroCoach/ToneSelector.tsx src/services/coachService.ts src/hooks/useStreamingChat.ts`
```text
src/components/features/NeuroCoach/index.tsx:155:    if (countermeasures.breathing) activeItems.push('Respiração 4-7-8');
src/components/features/NeuroCoach/index.tsx:156:    if (countermeasures.hydration) activeItems.push('Hidratação');
```
*(Nota: As únicas ocorrências são os rótulos do evento persistido gravados em `appendEvent`, mantidos conforme Regra 7)*

### 2. `npx eslint <seus arquivos e seu locale>`
```text
(0 problemas, saída limpa, código 0)
```

### 3. `npx vitest run src/components/features/NeuroCoach/ src/services/coachService.test.ts src/hooks/useStreamingChat.test.ts src/i18n/i18n.test.ts`
```text
 ✓ src/services/coachService.test.ts (15 tests) 50ms
 ✓ src/hooks/useStreamingChat.test.ts (3 tests) 55ms
 ✓ src/i18n/i18n.test.ts (16 tests) 134ms
 ✓ src/components/features/NeuroCoach/ToneSelector.test.tsx (8 tests) 273ms
 ✓ src/components/features/NeuroCoach/NeuroCoach.test.tsx (20 tests) 2739ms

 Test Files  5 passed (5)
      Tests  62 passed (62)
```

### 4. `npx tsc --noEmit`
```text
(0 erros, saída limpa, código 0)
```

### 5. `npm run build`
```text
vite v5.4.19 building for production...
✓ 3131 modules transformed.
✓ built in 18.38s
```

### 6. `git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts`
```text
(Vazio - nenhum arquivo blindado foi alterado)
```
