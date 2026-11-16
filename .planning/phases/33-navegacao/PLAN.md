# Fase 33 — Navegação Lateral e Abas de Seção em EN e PT

## Objetivo
Traduzir para inglês (EN) e português (PT) a navegação lateral (`AppSidebar.tsx`), as abas de seção do cockpit (`SectionTabs.tsx`) e os rótulos de feature scores (`useFeatureScores.tsx`), mantendo as chaves internas das abas (`value`) e endpoints do Supabase estritamente inalterados, preservando o português idêntico ao atual e seguindo os glossários `GLOSSARY.md` e `GLOSSARY-APP.md`.

## Arquivos Exclusivos
- `src/components/AppSidebar.tsx`
- `src/components/SectionTabs.tsx`
- `src/hooks/useFeatureScores.tsx`
- `src/hooks/useFeatureScores.test.ts`
- `src/i18n/locales/nav.ts`

## Plano de Execução
1. **Criar `src/i18n/locales/nav.ts`**:
   - Dicionário com namespace `nav` (`en` e `pt`), paridade 1:1 rigorosa.
   - Itens da sidebar: `nav.item.cockpit`, `nav.item.countermeasures`, `nav.item.flightLog`, `nav.item.aiInsights`, `nav.item.commandAlerts`, `nav.item.roi`, `nav.item.missionSafety`, `nav.item.aiReports`, `nav.item.missionSafetyChatbot`, `nav.item.integrations`, `nav.item.commandPanel`.
   - Grupos: `nav.group.cabinSystems` ("Sistemas de Cabine" / "Cabin Systems"), `nav.group.cabin` ("Cabine" / "Cabin"), `nav.group.command` ("Comando" / "Command").
   - Rodapé: `nav.footer.profile` ("Meu Perfil" / "Profile"), `nav.footer.admin` ("Admin" / "Admin"), `nav.footer.logout` ("Sair" / "Sign out").
   - Abas (`SectionTabs`): `nav.tabs.panel` ("Painel" / "Panel"), `nav.tabs.readinessAssessment` ("Avaliação de Prontidão" / "Readiness Assessment"), `nav.tabs.astroAssist` ("AstroAssist" / "AstroAssist"), `nav.tabs.discipline` ("Disciplina" / "Discipline"), `nav.tabs.workloadMetrics` ("Métricas de Carga" / "Workload Metrics").
   - Acessibilidade: `nav.aria.sidebar`, `nav.aria.cockpitTabs`, `nav.aria.countermeasureTabs`, `nav.aria.commandToggle`.
   - Scores: `nav.score.low`, `nav.score.moderate`, `nav.score.high`, `nav.score.alert`, `nav.score.caution`, `nav.score.ok`.

2. **Atualizar `src/components/AppSidebar.tsx`**:
   - Integrar `useI18n()`.
   - Modificar `employeeItems` e `managerItems` para referenciar chaves `titleKey` (ou resolver `title` com `t(...)` no render), mantendo `value` estritamente idêntico.
   - Resolver rótulos de grupo, botões de rodapé e `aria-label`s com `t(...)`.

3. **Atualizar `src/components/SectionTabs.tsx`**:
   - Integrar `useI18n()`.
   - Substituir os textos estáticos dos `TabsTrigger` por `t(...)`, mantendo `value` inalterado.
   - Adicionar atributos `aria-label` nos componentes de abas.

4. **Atualizar `src/hooks/useFeatureScores.tsx` e `src/hooks/useFeatureScores.test.ts`**:
   - Permitir `t` opcional nas funções puras de cálculo de rótulos (`computeNeuroscoreLabel`, `computeInsightsFromScans`), com fallback padrão para português para garantir compatibilidade retroativa total com chamadores existentes.
   - No hook `useFeatureScores`, obter `t` via `useI18n()`.
   - Adicionar testes em `useFeatureScores.test.ts` cobrindo traduções em EN com `t` ou `LangProvider`, preservando 100% dos 21 testes existentes em PT.

5. **Validação e Entrega**:
   - `git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]"` nos arquivos modificados (apenas comentários e dicionário permitidos).
   - `npx eslint` nos arquivos alterados.
   - `npm test -- --run` para garantir que todos os testes continuam passando.
   - `npx tsc --noEmit` e `npm run build`.
   - `git diff --stat` nos arquivos blindados (deve ser vazio).
   - Gerar `.planning/phases/33-navegacao/SUMMARY.md` e realizar o commit atômico dos arquivos exclusivos.
