# Fase 35 — Contramedidas (NeuroCoach) em EN e PT

## Objetivo
Internacionalizar a tela de Contramedidas (`NeuroCoach`), seus subcomponentes de chat e tom (`ToneSelector`, `ChatInput`, `ChatMessages`), serviço do assistente (`coachService`) e hook de streaming (`useStreamingChat`) com suporte bilíngue (EN/PT) em paridade estrita com o `GLOSSARY.md` e `GLOSSARY-APP.md`, preservando 100% o comportamento padrão em português sem provider e sem alterar dados persistidos, endpoints nem lógica de eventos de missão.

## Arquivos Exclusivos
- `src/i18n/locales/coach.ts`
- `src/components/features/NeuroCoach/index.tsx`
- `src/components/features/NeuroCoach/ChatInput.tsx`
- `src/components/features/NeuroCoach/ChatMessages.tsx`
- `src/components/features/NeuroCoach/ToneSelector.tsx`
- `src/components/features/NeuroCoach/NeuroCoach.test.tsx`
- `src/components/features/NeuroCoach/ToneSelector.test.tsx`
- `src/services/coachService.ts`
- `src/services/coachService.test.ts`
- `src/hooks/useStreamingChat.ts`
- `src/hooks/useStreamingChat.test.ts`

## Plano de Execução

1. **Criar `src/i18n/locales/coach.ts`:**
   - Dicionários `en` e `pt` (`Record<string, string>`) com namespace `coach.`.
   - Paridade 1:1 total entre chaves EN e PT.
   - Textos de cabeçalho, DSS, alerta de fadiga, checklist prescritivo (Ação 1 Respiração, Ação 2 Hidratação, Ação 3 Descanso), timer 4-7-8, overlay imersivo de respiração com fases 1, 2 e 3, exportação de plano, seletor de tom, chat e mensagens iniciais/erros.

2. **Adaptar `src/components/features/NeuroCoach/ToneSelector.tsx`:**
   - Integrar `useI18n()`.
   - Traduzir título, descrição, placeholder e rótulos dos 3 tons (`technical`, `casual`, `spiritual`), mantendo as chaves de valor (`value`) intactas.

3. **Adaptar `src/components/features/NeuroCoach/ChatInput.tsx`:**
   - Integrar `useI18n()`.
   - Traduzir placeholder do input e título do botão de cancelar geração.

4. **Adaptar `src/components/features/NeuroCoach/ChatMessages.tsx`:**
   - Integrar `useI18n()`.
   - Traduzir mensagem de digitação ("AstroAssist está digitando").

5. **Adaptar `src/components/features/NeuroCoach/index.tsx`:**
   - Integrar `useI18n()`.
   - Traduzir títulos, descrições, badges, alertas, textos de contramedidas, botões, timer guiado, aria-labels, overlay 4-7-8, fases de respiração e textos exportados.
   - Preservar `autoStartBreathing`, chave de persistência diária, `appendEvent` e conformidade com DSS.

6. **Adaptar `src/services/coachService.ts`:**
   - Adicionar suporte a parâmetro opcional `lang: 'pt' | 'en' = 'pt'` em `getInitialMessage`, `buildContext` e `exportConversation`, mantendo a assinatura e comportamento default em português.

7. **Adaptar `src/hooks/useStreamingChat.ts`:**
   - Integrar `useI18n()` para mensagens de erro com fallback default em português.

8. **Testes e Validação:**
   - Garantir que todos os testes existentes passam sem alteração.
   - Adicionar testes de renderização e comportamento bilíngue em `NeuroCoach.test.tsx`, `ToneSelector.test.tsx`, `coachService.test.ts` e `useStreamingChat.test.ts`.
   - Executar bateria completa de testes, eslint, tsc e build.
