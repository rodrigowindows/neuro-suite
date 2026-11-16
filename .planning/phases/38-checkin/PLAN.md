# Plano da Fase 38: Internacionalização de Check-in, Histórico, Relatório e Meditação (EN e PT)

## Objetivo
Implementar internacionalização completa (Inglês e Português) para a suíte de avaliação de prontidão diária, histórico de check-ins, relatório de telemetria em PDF/HTML, mini meditação guiada, e rótulos de sintomas e fadiga percebida.

## Arquivos Exclusivos
- `src/i18n/locales/checkin.ts` (novo namespace com paridade estrita en/pt)
- `src/lib/symptoms.ts` e `src/lib/symptoms.test.ts`
- `src/lib/perceivedFatigue.ts` e `src/lib/perceivedFatigue.test.ts`
- `src/components/DailyCheckin.tsx` e `src/components/DailyCheckin.test.tsx`
- `src/components/CheckinHistory.tsx`
- `src/components/WellnessReportPDF.tsx` e `src/components/WellnessReportPDF.test.tsx`
- `src/components/MiniMeditation.tsx`

## Etapas de Implementação
1. **Dicionário `src/i18n/locales/checkin.ts`**:
   - Chaves com prefixo `checkin.` para DailyCheckin, CheckinHistory, WellnessReportPDF, MiniMeditation, Symptoms e PerceivedFatigue.
   - Paridade estrita 1:1 entre `en` e `pt`.
2. **Bibliotecas `symptoms.ts` e `perceivedFatigue.ts`**:
   - Manter exports em português como padrão (retrocompatibilidade total).
   - Adicionar funções de consulta por idioma (`getSymptomLabel(id, lang)`, `getFatigueLabel(val, lang)`).
   - Manter chaves e valores persistidos em banco/localStorage inalterados.
   - Atualizar testes unitários (`symptoms.test.ts` e `perceivedFatigue.test.ts`) cobrindo as funções bilíngues.
3. **Componentes**:
   - `DailyCheckin.tsx`: integrar `useI18n()`, traduzir etapas (mood, energy, note, done, feedback), mantendo o português idêntico.
   - `CheckinHistory.tsx`: integrar `useI18n()`, traduzir título, rótulos de humor, legenda e dias da semana (`pt-BR` / `en-US`).
   - `WellnessReportPDF.tsx`: suportar parâmetro `lang` em `buildWellnessReportHtml`, traduzir textos do HTML gerado, datas e nome do arquivo gerado conforme idioma ativo. Sem novas alegações clínicas.
   - `MiniMeditation.tsx`: integrar `useI18n()`, passos guiados, temporizadores, TTS vocal (`pt-BR` / `en-US`) e rodapé.
4. **Testes Unitários (AAA)**:
   - Preservar testes existentes passando sem alteração (comportamento padrão PT).
   - Adicionar cenários bilíngues (`<LangProvider initialLang="en">` e `initialLang="pt">`) em `DailyCheckin.test.tsx` e `WellnessReportPDF.test.tsx`.
5. **Verificação & Gates**:
   - `git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]"` nos componentes.
   - `npx eslint` nos arquivos modificados.
   - `npm test -- --run`.
   - `npx tsc --noEmit`.
   - `npm run build`.
   - `git diff --stat` nos arquivos blindados (deve ser 0).
6. **Entrega**:
   - `SUMMARY.md` com saídas reais dos comandos.
   - Commit atômico exclusivo com os 11 arquivos.
