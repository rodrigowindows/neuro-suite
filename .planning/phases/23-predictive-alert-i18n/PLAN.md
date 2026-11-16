# Fase 23 — Alerta Preditivo Multilíngue EN/PT (CrewVitals)

## Objetivo
Traduzir `PredictiveAlert.tsx` preservando o funcionamento atual no Dashboard (que permanece em PT por padrão fora de `LangProvider`) e permitindo exibição em inglês quando consumido sob `LangProvider initialLang="en"`.

## Escopo de Arquivos Exclusivos
- `src/i18n/locales/predictive.ts` (novo)
- `src/components/PredictiveAlert.tsx`
- `src/components/PredictiveAlert.test.tsx`

## Plano de Execução
1. Criar `src/i18n/locales/predictive.ts` com dicionários `en` e `pt` e chaves:
   - `predictive.badge`: "Demo" (EN) / "Demonstração" (PT)
   - `predictive.message`: "Risk of errors in precision tasks over the next 4 h — suspend docking/EVA." (EN) / "Risco de erro em tarefas de precisão nas próximas 4 h — suspender acoplagem/EVA." (PT)
   - `predictive.disclaimer`: "Demonstration scenario — not a validated clinical prediction." (EN) / "Cenário demonstrativo — não é uma previsão clínica validada." (PT)
   - `predictive.bioscorePrefix`: "BioScore {score} — " (EN e PT)
2. Atualizar `src/components/PredictiveAlert.tsx` para consumir `useI18n()` e `t(...)`, sem alterar props nem estrutura CSS/DOM, eliminando textos em português fixos e garantindo que fora de provider devolva PT.
3. Atualizar `src/components/PredictiveAlert.test.tsx` com padrão AAA cobrindo:
   - Renderização sem provider (fallback PT).
   - Renderização sob `LangProvider` com `initialLang="en"` (com e sem `bioScore`).
   - Renderização sob `LangProvider` com `initialLang="pt"`.
   - Preservação do acionamento de `onMitigate` e ausência de emojis/botões/estilos proibidos.
4. Executar bateria de validações: eslint, vitest (`npm test -- --run`), tsc (`npx tsc --noEmit`), build (`npm run build`) e diff de arquivos blindados.
5. Criar `SUMMARY.md` com a saída real e realizar o commit atômico dos 3 arquivos de código.
