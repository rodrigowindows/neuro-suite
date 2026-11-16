# Plano da Fase 39: Internacionalização de Disciplina, Pausas, Carga Cognitiva e Liderança (EN e PT)

## Objetivo
Implementar a internacionalização completa (Inglês e Português) para o módulo de Bem-Estar e Prontidão Operacional: Disciplina (Gamificação), Assistente de Pausas Inteligentes, Analisador de Fadiga Cognitiva, Coaching de Liderança e GamificationScoreCard, mantendo compatibilidade total, dados persistidos intactos e sem alegações clínicas.

## Arquivos Exclusivos
- `src/i18n/locales/wellness.ts` (novo dicionário com namespace `wellness.*` e paridade estrita en/pt)
- `src/hooks/useGamificationScore.ts`
- `src/hooks/useGamificationScore.test.ts`
- `src/components/GamificationScoreCard.tsx`
- `src/components/Gamification.tsx`
- `src/components/SmartBreakAssistant.tsx`
- `src/components/CognitiveFatigueAnalyzer.tsx`
- `src/components/LeadershipCoaching.tsx`

## Etapas de Implementação

1. **Dicionário `src/i18n/locales/wellness.ts`**:
   - Criar catálogo bilingue com namespace `wellness.*`.
   - Paridade estrita 1:1 entre `en` e `pt`.
   - Strings em português idênticas às existentes; strings em inglês seguindo `GLOSSARY-APP.md` e terminologia concisa de cockpit.

2. **Hook `useGamificationScore.ts`**:
   - Manter títulos originais em `LEVELS` para retrocompatibilidade sem provider.
   - Adicionar suporte a tradução de títulos de nível via `t` de `useI18n()` preservando fallback.
   - Preservar regras de cálculo de XP e chamada ao Supabase sem `select('*')`.

3. **Componentes de Gamificação**:
   - `GamificationScoreCard.tsx`: internacionalizar título, cartões de estatísticas, etapas e barra de progresso.
   - `Gamification.tsx`: internacionalizar cabeçalho, sequências, contadores, títulos de badges em exibição (mantendo IDs e payloads gravados intactos) e próximos objetivos.

4. **Componentes de Assistência Operacional**:
   - `SmartBreakAssistant.tsx`: internacionalizar seletores de humor/energia/tempo, períodos operacionais, botão de ação, badges de urgência e cartões de sugestão.
   - `CognitiveFatigueAnalyzer.tsx`: internacionalizar avisos de apoio à decisão, campos de entrada, estados de carregamento, dimensões cognitivas e níveis de fadiga.
   - `LeadershipCoaching.tsx`: internacionalizar lista de módulos, sessões práticas, estados Pro e cartões de adesão.

5. **Testes Unitários (AAA)**:
   - Preservar testes existentes em `useGamificationScore.test.ts`, `Gamification.test.tsx` e `CognitiveFatigueAnalyzer.test.tsx` sem alteração de comportamento em PT.
   - Em `useGamificationScore.test.ts`, adicionar bateria de testes sob `<LangProvider initialLang="en">` e `initialLang="pt">` para validar exibição em inglês e ausência de termos antigos em português.
   - Rodar teste de paridade de `src/i18n/i18n.test.ts`.

6. **Verificação & Entrega**:
   - Rodar linter, suite de testes e build.
   - Gerar `SUMMARY.md` com evidências reais.
   - Executar commit atômico exclusivo dos 8 arquivos.
