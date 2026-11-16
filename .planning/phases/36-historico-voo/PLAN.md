# Plano da Fase 36 — Histórico de Voo (MissionLog) em EN e PT (Marco v1.4 CrewVitals)

## Objetivo
Traduzir a tela de Histórico de Voo (`MissionLog.tsx`) para Inglês e Português sob o namespace `missionlog`, suportando timeline de eventos derivados dinamicamente em EN sem alterar dados persistidos (`localStorage` / `missionEvents.ts`), mapeando o veredito do cockpit para exibição em EN e garantindo formatação de datas e horas de acordo com o idioma ativo (`pt-BR` ou `en-US`), mantendo os 731 linhas de testes existentes sem alteração.

## Arquivos Exclusivos
- `src/i18n/locales/missionlog.ts` (criação do catálogo `en` e `pt`)
- `src/components/MissionLog.tsx` (integração com `useI18n`, timeline de eventos e formatação multilíngue)
- `src/components/MissionLog.test.tsx` (testes bilingues com LangProvider e preservação dos testes legados)

## Passos de Execução
1. Criar dicionário de tradução `src/i18n/locales/missionlog.ts` exportando `en` e `pt` com paridade estrita de chaves e prefixo `missionlog.`.
2. Adaptar `src/components/MissionLog.tsx`:
   - Integrar `useI18n()`.
   - Substituir literais JSX por `t('missionlog...')`.
   - Formatar datas e horas por idioma com função local `formatLocalizedEventDate` (`Hoje, HH:mm` / `Today, HH:mm`).
   - Mapear `cockpitVerdict` para exibição em inglês sem alterar o prop original.
   - Apresentar timeline de eventos com tradução derivada de `type` + `metadata` para EN e fallback transparente para o label original em PT.
3. Ampliar `src/components/MissionLog.test.tsx` com suíte bilíngue em AAA, cobrindo `LangProvider initialLang="en"` e `initialLang="pt"`.
4. Executar bateria de verificação completa:
   - `git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]" -- src/components/MissionLog.tsx`
   - `npx eslint src/components/MissionLog.tsx src/i18n/locales/missionlog.ts`
   - `npm test -- src/components/MissionLog.test.tsx src/i18n/i18n.test.ts --run`
   - `npx tsc --noEmit`
   - `npm run build`
   - `git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts`
5. Gerar `SUMMARY.md` e realizar o commit atômico exclusivo.
