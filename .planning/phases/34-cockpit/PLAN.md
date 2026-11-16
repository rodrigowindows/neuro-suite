# Fase 34 — Cockpit e Widgets de Status em EN e PT

## Objetivo
Internacionalizar o cockpit (`BridgeConsole`) e widgets de status (`MissionStatusWidget`, `ConnectionStatusWidget`, `StressAlertBanner`, e labels de downlink em `src/lib/downlink.ts`) para suporte bilíngue (EN/PT) com paridade estrita com o `GLOSSARY.md` e `GLOSSARY-APP.md`, preservando 100% o comportamento padrão em português sem provider e sem alterar `readiness.ts`, `useReadiness.ts`, `missionEvents.ts` nem estruturas persistidas.

## Arquivos Exclusivos
- `src/i18n/locales/cockpit.ts`
- `src/components/BridgeConsole.tsx` e `src/components/BridgeConsole.test.tsx`
- `src/components/MissionStatusWidget.tsx`
- `src/components/ConnectionStatusWidget.tsx` e `src/components/ConnectionStatusWidget.test.tsx`
- `src/components/StressAlertBanner.tsx`
- `src/lib/downlink.ts` e `src/lib/downlink.test.ts`

## Plano de Execução

1. **Criar `src/i18n/locales/cockpit.ts`:**
   - Dicionário com exports `en` e `pt` (`Record<string, string>`).
   - Todas as chaves prefixadas por `cockpit.`.
   - Paridade 1:1 rigorosa testada por `src/i18n/i18n.test.ts`.
   - Chaves para:
     - Estados do semáforo: GO, CAUTION, NO-GO, NO-GO Protocolo, AGUARDANDO SCAN.
     - Headline de aguardando scan e subtítulo de veredito baseado em estresse e HRV.
     - Métricas (BioScore, Piscadas/min, Sono, formatação do sono).
     - Ações primárias e secundárias (Iniciar Turno, Iniciar Protocolo 4-7-8, Reavaliar com BioScore, Realizar BioScore, Iniciar Scan de Prontidão, Simular novo scan, Atualizar scan).
     - Log de eventos recentes (título, selo DEMO, tempo relativo Hoje/Ontem, mensagens do cenário demo 1..3).
     - Status da Missão (Nominal, Atenção, Fadiga Detectada, Aguardando scan).
     - Conexão e Outbox (badges online/autônomo, contadores de fila no singular e plural, subtextos informativos, botões e tooltips, toasts de queda, restauração e sincronização da outbox).
     - Banner de Estresse (títulos crítico e prolongado, texto de dias consecutivos, percentual de scans, alerta de HRV, chips de ação).
     - Downlink (labels de pacote autônomo, pacote online, aviso clínico).

2. **Adaptar `src/components/BridgeConsole.tsx`:**
   - Obter `{ lang, t }` de `useI18n()`.
   - Mapear `readiness.state` para títulos i18n (`cockpit.readiness.*`), mantendo a verificação de `hasProtocolToday` para `'NO-GO - PROTOCOLO REGISTRADO'` / `'NO-GO - PROTOCOL REGISTERED'`.
   - Mapear headline de `unknown` com `t('cockpit.headline.unknown')`.
   - Substituir veredito por `t('cockpit.verdictSubtitle')`.
   - Traduzir rótulos dos 3 números e formatar sono via `cockpit.format.sleep`.
   - Traduzir botões de ação e rodapé.
   - Traduzir log de eventos recentes mantendo dados persistidos gravados no `localStorage` e internacionalizando título, selo DEMO, tempo relativo e fallback demo.

3. **Adaptar `src/components/MissionStatusWidget.tsx`:**
   - Obter `t` de `useI18n()`.
   - Mapear `text` por estado usando chaves `cockpit.missionStatus.*`.
   - Preservar ícones, classes CSS de cor e badge de stage demo.

4. **Adaptar `src/components/ConnectionStatusWidget.tsx`:**
   - Obter `t` de `useI18n()`.
   - Traduzir badges, contadores com singular/plural, subtextos, tooltips e aria-labels.
   - Traduzir mensagens de toast disparadas no toggle (`toastLost`, `toastRestored`, `toastFlushed_one`, `toastFlushed_other`).

5. **Adaptar `src/components/StressAlertBanner.tsx`:**
   - Obter `t` de `useI18n()`.
   - Traduzir títulos (severo / prolongado), corpo com interpolação de dias e percentual, alerta de HRV e chips de recomendação.

6. **Adaptar `src/lib/downlink.ts`:**
   - Adicionar parâmetros opcionais `lang?: Lang` e `t?: ...` em `generateDownlinkPackageAndFiles` e `assembleDownlinkPackage`.
   - Manter constantes padrão em português para compatibilidade retroativa absoluta.
   - Fornecer traduções adequadas quando `lang === 'en'` ou `t` for informado.

7. **Testes e Validações:**
   - Garantir que todos os testes existentes em `BridgeConsole.test.tsx`, `ConnectionStatusWidget.test.tsx` e `downlink.test.ts` passam sem alteração.
   - Acrescentar testes bilíngues em `BridgeConsole.test.tsx`, `ConnectionStatusWidget.test.tsx` e `downlink.test.ts` com `LangProvider initialLang="en"` e `initialLang="pt"`.
   - Executar paridade i18n, eslint, vitest, tsc e build.
   - Gerar `SUMMARY.md` e executar commit atômico exclusivo.
