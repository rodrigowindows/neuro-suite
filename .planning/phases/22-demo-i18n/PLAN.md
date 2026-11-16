# Fase 22 — Internacionalização da Página Demo (/demo) em EN e PT

## Objetivo
Internacionalizar a página `/demo` para suportar inglês (EN) e português (PT) com alternância dinâmica em tempo de execução via `LanguageToggle`, mantendo conformidade estrita com o `GLOSSARY.md`, sem alterar `PredictiveAlert.tsx`, `demoScenario.ts`, `useReadiness.ts` nem `App.tsx`, e com 0 chamadas ao Supabase e sem emojis.

## Escopo de Arquivos Exclusivos
- `src/i18n/locales/demo.ts`
- `src/pages/Demo.tsx`
- `src/pages/Demo.test.tsx`

## Plano de Execução
1. Criar `src/i18n/locales/demo.ts` exportando `en` e `pt` com paridade 1:1 rigorosa, cobrindo todas as chaves `demo.*`:
   - Selo (`demo.seal`), títulos dos 4 estados (`demo.status.go`, `demo.status.caution`, `demo.status.nogo`, `demo.status.unknown`), subtítulo do veredito (`demo.verdictSubtitle`), métricas (`demo.metric.bioScore`, `demo.metric.blinkRate`, `demo.metric.sleep`, `demo.format.sleep`), botões de ação e cabeçalho (`demo.btn.startShift`, `demo.btn.startProtocol`, `demo.btn.simulateScan`, `demo.btn.reset`, `demo.link.signIn`, `demo.btn.close`), avisos (`demo.notice.countermeasure`, `demo.notice.shiftStarted`), e log de eventos (`demo.log.title`, `demo.log.badge`, `demo.log.1.time`, `demo.log.1.message`, `demo.log.2.time`, `demo.log.2.message`, `demo.log.3.time`, `demo.log.3.message`).
2. Adaptar `src/pages/Demo.tsx`:
   - Importar `useI18n` de `@/i18n` e `LanguageToggle` de `@/components/LanguageToggle`.
   - Inserir `<LanguageToggle />` no cabeçalho em container `flex-wrap` responsivo para 375 px.
   - Substituir textos literais por `t(...)`.
   - Formatar sono: PT `5.5h` e EN `5.5 h`. Manter `roundBlinkRate`.
   - Mapear logs por `log.id` com interpolação dinâmica de `{score}` e `{hrv}`.
   - Rastrear avisos de protocolo/turno por chave semântica para troca dinâmica instantânea de idioma.
3. Atualizar `src/pages/Demo.test.tsx`:
   - Preservar testes em PT sob `LangProvider initialLang="pt"`.
   - Adicionar bateria completa de testes em EN sob `LangProvider initialLang="en"`.
   - Adicionar teste de alternância de idioma em tempo de execução via `LanguageToggle`.
   - Garantir 0 chamadas de rede no Supabase em todos os fluxos.
4. Executar bateria de validações: eslint, vitest, tsc, build e verificação dos arquivos blindados.
5. Criar `SUMMARY.md` com resultados reais e realizar o commit atômico dos 3 arquivos de código.
