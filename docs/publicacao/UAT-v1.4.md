# UAT do marco v1.4: app logado em EN e PT

**Data:** 2026-11-15
**Base:** commit `fb0987f` (última fase, 38). Fases 32 a 44 commitadas; auditoria feita sobre o `HEAD`.
**Legenda:** PASSOU, FALHOU, NÃO VERIFICADO.
**Veredito: APROVADO COM RESSALVAS.** Os gates passam, o seletor existe e funciona e a paridade está íntegra. Há 5 discrepâncias a decidir (seção 4), nenhuma bloqueia o uso, mas duas afetam a honestidade e o escopo e merecem correção antes de divulgar o app logado.

## 1. Gates (saída real)

| Verificação | Resultado |
|---|---|
| `npm test -- --run` (duas execuções) | 52 arquivos, 680 testes, 0 falhas nas duas. A falha intermitente do teste 10 de `Dashboard.test.tsx` vista antes não reapareceu |
| `npx tsc --noEmit` | exit 0 |
| `npm run build` | concluído em 10,32 s |
| `npx eslint src/i18n src/App.tsx src/pages/Dashboard.tsx src/components/AppSidebar.tsx src/components/BridgeConsole.tsx` | exit 0 |
| Blindados (`git diff 99aee14..HEAD -- src/integrations supabase/migrations package.json package-lock.json bun.lock bun.lockb vite.config.ts`) | vazio |
| Segredos e e-mail institucional (`git grep` em todo o repositório) | saída vazia |

## 2. Matriz de verificação

| # | Item | Evidência | Resultado |
|---|---|---|---|
| 1 | Provider único acima do `AuthProvider` | `src/App.tsx:21-41`: um só `LangProvider` envolvendo `AuthProvider`, `BrowserRouter` e todas as rotas; `git grep` mostra `LangProvider` só em `App.tsx` e `src/i18n/index.tsx` | PASSOU |
| 2 | Seletor no Dashboard troca sem recarregar | `Dashboard.tsx:159` (`<LanguageToggle />`); `Dashboard.test.tsx:833` troca EN para PT e confere o título; `:891` confere rodapé e modal | PASSOU (testes); navegador real NÃO VERIFICADO |
| 3 | Paridade e duplicatas | Script próprio sobre os 18 locales: 1.495 chaves, `en` e `pt` com as mesmas chaves em todos, todas com o prefixo do namespace, 0 chaves duplicadas entre arquivos, 0 valores vazios. O teste `i18n.test.ts` também passa | PASSOU |
| 4 | Chaves de aba e dados persistidos | `AppSidebar.tsx`: `value` das abas inalterados (`bridge-console`, `neurocoach`, `mission-log`, `ai-insights`, `alerts`, `roi`, `nr1`, `narrative-reports`, `nr1-chatbot`, `integrations`, `dashboard-rh`). `missionEvents.ts`, `readiness.ts`, `src/integrations` sem alteração | PASSOU |
| 5 | Segurança do OAuth e da sessão | Testes de `IntegrationsDashboard` e `integrations/` passam (11/11); nenhuma linha com `event.origin`, `state`, `getSession`, `access_token` ou `Authorization` mudou nos dois arquivos | PASSOU |
| 6 | PT preservado | 1.351 valores PT dos 13 dicionários novos comparados com o código de `99aee14`: 1.302 aparecem verbatim. Os 49 restantes são formas plurais novas, rótulos de acessibilidade novos, textos que no original eram compostos em código ou estavam em inglês (`NotFound`) e o bloco novo da linha do tempo (ver D1). Nenhuma regressão encontrada nos componentes amostrados (`BridgeConsole`, `DailyCheckin`) | PASSOU, com D1 |
| 7 | Honestidade (alegações clínicas, certificação) | Varredura em EN e PT dos 18 locales: 27 ocorrências, todas pré-existentes (ver D2) | PASSOU, com D2 |
| 8 | Cobertura de texto (o que sobrou em português) | Seção 5 | PARCIAL (D3) |
| 9 | Responsividade em 375 px, fluxo logado real | O Chrome automatizado não alcançou `localhost` nas auditorias anteriores | NÃO VERIFICADO |

## 3. Requisitos

| Requisito | Veredito |
|---|---|
| I18N-13 provider global, seletor, barra lateral, títulos | PASSOU |
| I18N-14 cockpit | PASSOU |
| I18N-15 contramedidas e histórico de voo | PASSOU com ressalva (D1, D2) |
| I18N-16 BioScore e check-in | PASSOU |
| I18N-17 gestão, segurança, relatórios, integrações | PARCIAL: textos de fallback local seguem em português (D3) |
| I18N-18 conta, perfil, admin, mensagens | PASSOU com ressalva (D4) |
| I18N-19 auditoria | PASSOU (gates e relatório); fluxo no navegador NÃO VERIFICADO |

## 4. Discrepâncias

| # | Gravidade | Achado | Evidência | Ação proposta |
|---|---|---|---|---|
| D1 | Média (escopo) | A fase 36 acrescentou uma funcionalidade nova ao Histórico de Voo: seção "Mission Event Timeline" com filtros (Todos, Scan, Protocolo, Fadiga, Sintomas) e botão de veredito. O original não tinha isso. `MissionLog.tsx` passou de 644 para 981 linhas e o arquivo de testes ganhou cerca de 200 linhas. O prompt da fase descrevia a tela com "linha do tempo e filtros", o que induziu a criação | `git diff 99aee14..HEAD -- src/components/MissionLog.tsx` (blocos `// Timeline state` e `Linha do Tempo de Eventos`) | Decidir: manter (está traduzida e testada) ou reverter o bloco. Se mantiver, revisar a exibição de rótulos gravados |
| D2 | Média (honestidade) | Alegações herdadas do português e traduzidas fielmente: selo "NASA HRP Guidelines" nas Contramedidas, modal "Research & Validation (NASA / Harvard)" com 3 fontes citadas, aba "Real-Time Alerts" (alertas calculados a partir de scans salvos) | `locales/coach.ts` (`coach.badge.nasaHrp`, `coach.overlay.guidelines`), `locales/dashboard.ts` (`dashboard.researchModal.*`), `locales/insights.ts` (`insights.alerts.tab.realtime`) | Reescrever em EN e PT juntos: "baseado em literatura publicada" no lugar de "Diretrizes NASA HRP", e "Alertas" no lugar de "Tempo Real" |
| D3 | Baixa a média | Em EN, algumas telas mostram português nos conteúdos de fallback local ("Gerado localmente (regras fixas, sem IA em nuvem)...") | `AIInsightsDashboard.tsx:125-133`, `NR1Report.tsx:399-400`, `NarrativeReportGenerator.tsx:43`, `PGRReportGenerator.tsx:82-104`, `AIInsightsDashboard.tsx:81` (`piorando` e afins), `Gamification.tsx:137` (nome de conquista), `NeuroCoach/index.tsx:155-156` | Prompt cirúrgico por arquivo; nomes de conquista gravados no banco ficam como dado |
| D4 | Baixa | A fase 44 acrescentou `resetPassword` em `useAuth.tsx` (nova função com `resetPasswordForEmail`) que nada usa: `Auth.tsx` continua chamando o Supabase direto. A regra era só traduzir | `useAuth.tsx:14,103-126` | Remover a função morta ou usá-la em `Auth.tsx` |
| D5 | Baixa (histórico) | O trabalho da fase 32 (`App.tsx`, `DashboardContent`, `DashboardSkeleton`, `ResearchValidationModal`, `WelcomeBanner`, `dashboard.ts`) foi commitado dentro de `8a84c59 feat(bioscore)`. Não há `.planning/phases/43-integracoes` (falta SUMMARY da fase 43) | `git show --stat 8a84c59` | Só rastreabilidade; sem correção de código |

## 5. Português restante fora dos dicionários

Aceito como está (dado ou padrão de compatibilidade): `readiness.ts`, `demoScenario.ts`, `symptoms.ts`, `perceivedFatigue.ts`, `downlink.ts` (PT padrão, variante por idioma), valores de `type` e rótulos gravados em `missionEvents`, prompts de IA em `MeetingCheckIn.tsx` e mensagens de `console.error`. Pendente: itens de D3.

Fora de propósito, como combinado: respostas de IA (coach, chatbot, relatórios gerados), prompts enviados às edge functions, textos do banco e `index.html`.

## 6. Roteiro do dono (3 minutos, janela anônima)

1. Entrar com uma conta e abrir `/dashboard`. Conferir o seletor EN | PT no cabeçalho.
2. Em EN: percorrer Cockpit, Contramedidas, Histórico de Voo, BioScore e Check-in; anotar qualquer texto em português.
3. Alternar para PT e repetir o Cockpit; os números não mudam.
4. Reduzir a janela a 375 px e conferir que o cabeçalho não gera rolagem horizontal.
5. Abrir DevTools, aba Network, filtro `supabase`, em `/demo?lang=en`: zero requisições.

Itens 1 a 5 NÃO VERIFICADO até o dono executar.

## Conclusão

Aprovado com ressalvas. Corrigir D2 (honestidade) e decidir D1 (escopo) antes de divulgar o app logado. D3 a D5 podem esperar. Não bloqueiam a demo pública (`/demo`), que não passou por mudança funcional neste marco.
