---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Endurecimento de Seguranca e Demo com Conta Compartilhada
status: planning
last_updated: "2026-11-15T18:32:00.000Z"
last_activity: 2026-11-15
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State — CrewVitals

## Marco 2 (Milestone 2) — Cockpit UX & Homologacao UAT Polish (Fases 02 e 03)

- **Status:** Concluido e Homologado com 100% de sucesso
- **Fases:** `02-cockpit-ux` e `03-polish` validadas com sucesso estrito
- **Metricas de Validacao:**
  - 39 arquivos de teste unitario aprovados (0 falhas)
  - 478 testes unitarios aprovados (100% pass, auditoria de 2026-11-15)
  - Checklist visual da demo no navegador: NAO VERIFICADO (ver `03-polish/UAT.md`)
  - `npx tsc --noEmit` limpo com 0 erros de tipagem
  - `npm run build` de producao concluido com sucesso
  - `git diff package.json src/integrations/supabase/` 100% vazio (zero alteracoes nao autorizadas)
  - Ausencia total de emojis na cabine operacional e nos fluxos de voo
  - Integridade estrita das 7 chaves internas de navegacao Lovable

## Sintese das Entregas Validadas

1. **Cockpit de 3 Niveis (`BridgeConsole.tsx`):**
   - **Nivel 1:** Semaforo de Prontidao (GO / ATENCAO / NO-GO / SEM DADOS) derivado deterministicamente de `src/lib/readiness.ts`.
   - **Nivel 2:** 3 Numeros essenciais (BioScore, Piscadas/min formatadas na borda com `roundBlinkRate`, Horas de Sono) sem fallbacks fabricados silenciosos.
   - **Nivel 3:** Acao primaria unica e inequivoca ("Iniciar Turno", "Iniciar Protocolo 4-7-8", "Reavaliar com BioScore" ou "Realizar BioScore").
2. **Log de Eventos Aeroespacial:**
   - Exibicao de eventos reais gravados via `missionEvents` (`appendEvent`), com selo DEMO condicional apenas na ausencia de dados reais sob modo demonstrativo.
3. **Widget de Conexao (Uplink Terra / Modo Autonomo):**
   - Transicao reativa entre conexao online e processamento local edge com outbox offline e feedback sonner de disparo unico.
4. **Arquitetura de Navegacao da Cabine:**
   - Sidebar simplificada para 3 secoes centrais de voo (Cockpit, Contramedidas, Historico de Voo) com `SectionTabs` para sub-navegacao contextual.

## Marco v1.1 — Endurecimento de Seguranca e Demo com Conta Compartilhada

- **Status:** Fases 04 a 10 concluidas no codigo. Fase 11 executada nos gates automatizados; aguarda ensaio visual e deploy.
- **Metricas da auditoria de 2026-11-15 (reexecucao completa):**
  - 49 arquivos de teste, 550 testes aprovados (0 falhas, 19.83 s)
  - `npx tsc --noEmit` sem erros (exit code 0)
  - `npm run build` concluido em 12.18 s (aviso de chunk acima de 500 kB, nao e falha)
  - `git diff HEAD` e `git status` 100% vazios nos arquivos blindados (`src/integrations/`, `supabase/migrations/`, `package.json`, `package-lock.json`, `vite.config.ts`)
  - Varredura de emojis em `src/pages`, `src/components`, `src/hooks`, `src/services`, `src/lib`: 0 ocorrencias fora das exclusoes (135 arquivos escaneados)
  - `select('*')` fora de testes: 0 ocorrencias em `src/` e `supabase/functions/`
  - `console.log` fora de testes: 2 em `src/components/WebcamCapture.tsx` (protegidos por `import.meta.env.DEV`), 0 em `supabase/functions/`
  - Chaves `AIza`: 0 ocorrencias no codigo rastreado fora de `Feedbacks/` (coberto pelo `.gitignore`)
- **Correcoes registradas nesta rodada:**
  - O comentario de `supabase/config.toml` foi corrigido (W1), removendo a indicacao de pendencia e documentando que `MeetingCheckIn.tsx` envia o `access_token` da sessao autenticada.
  - A conta demo funciona no login (`DEMO_ACCOUNT_EMAIL` centralizado em `src/lib/constants.ts`; senha nunca registrada no repositorio).
- **Aguardando resultado informado (mantidos NAO VERIFICADO):**
  - Roteiro visual cronometrado da conta demo no navegador (QA-03)
  - Teste 401 do `neuro-coach` com chave publicavel e token sem `sub` pos-deploy (SEC-01 e SEC-02 em producao)
- **Acao externa pendente (fora do codigo):**
  - Revogar as 2 chaves listadas no relatorio AppSec
  - Conferir manualmente o arquivo dentro de `Feedbacks/` e revogar se for chave ativa
- **Detalhes:** `.planning/phases/11-auditoria/UAT.md`

## Proximos Passos

1. Revogar as 2 chaves do relatorio AppSec e conferir o arquivo em `Feedbacks/` (acao do dono).
2. Fazer o deploy em producao e executar o teste 401 do `neuro-coach` (UAT secao 9).
3. Executar o roteiro visual cronometrado da conta demo no navegador (UAT secao 8) e registrar os resultados reais.

## Current Position

Phase: 11 — Auditoria e UAT (codigo e gates validados; ensaio visual e teste 401 pos-deploy mantidos NAO VERIFICADO)
Plan: —
Status: Gates e codigo 100% validados; aguarda resultados informados de producao e ensaio visual
Last activity: 2026-11-15 — Reexecucao de auditoria completa da Phase 11 (550 testes, tsc, build, diff blindados e greps aprovados)


## Marco v1.2 — Demo Pública sem Login (concluído em 2026-11-15)

- **Status:** Concluído no código, materiais e auditoria (Phase 16).
- **Entregas Validadas:**
  - Rota pública /demo sem sessão e sem chamadas Supabase (useGuestReadiness, Demo.tsx, Demo.test.tsx).
  - Botões de acesso na Landing Page (Index.tsx) e tela de Login (Auth.tsx).
  - Deck PPTX e PDF com exatamente 7 slides e roteiro de vídeo de 30s sem credenciais (docs/apresentacao/).
  - Checklist operacional de publicação e links públicos (docs/publicacao/).
  - Auditoria e UAT documentados em docs/publicacao/UAT-v1.2.md (561 testes passando, tsc/build verdes, blindados intactos).
- **Ações Externas Pendentes (do Dono):**
  - Publicar no Lovable com acesso público (https://neuro-suite.lovable.app/demo).
  - Hospedar o deck (PDF/PPTX) e vídeo de 30s com link público e preencher docs/publicacao/LINKS.md.
  - Executar o UAT cronometrado de 60s em janela anônima (docs/publicacao/UAT-v1.2.md).
