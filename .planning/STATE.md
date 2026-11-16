---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Demo Multilingue (EN e PT)
status: completed
last_updated: "2026-11-15T21:15:00.000Z"
last_activity: 2026-11-15
progress:
  total_phases: 11
  completed_phases: 11
  total_plans: 11
  completed_plans: 11
  percent: 100
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

## Marco v1.2 — Demo Pública sem Login (auditoria final em 2026-11-15)

- **Status:** Auditoria final aprovada no repositório (commit cfcbe26): 562 testes, tsc, eslint e build limpos, blindados intactos, e-mail da conta demo removido do código e do bundle. Pendente (dono): log de rede real em `/demo`, ensaio em janela anônima, hospedar deck e vídeo, trocar a senha da conta demo.
- **Entregas e Correções Validadas:**
  - Rota pública `/demo` sem sessão e sem chamadas Supabase (`useGuestDemoReadiness`, `Demo.tsx`, `Demo.test.tsx`).
  - Botões de acesso na Landing Page (`Index.tsx`) e tela de Login (`Auth.tsx`).
  - Deck PPTX e PDF com exatamente 7 slides e roteiro de vídeo de 30s sem credenciais (`docs/apresentacao/`).
  - Correção de consistência da Fase 17 (`c5c69bf`): números reais alinhados a `demoScenario.ts` (34/14/5,5, 52/14/5,5, 72/18/5,5), botões reais de tela, remoção de métricas não visíveis na tela da demo e acentuação UTF-8 completa restaurada no PPTX e PDF.
  - Correção de arquitetura e lint da Fase 18 (`9c70ed3`): desacoplamento explícito de `useGuestDemoReadiness`, eliminação de violações de `rules-of-hooks` no ESLint, e inclusão de teste de consistência AAA das 3 etapas em `Demo.test.tsx`.
  - Checklist operacional de publicação e links públicos (`docs/publicacao/CHECKLIST-PUBLICACAO.md` e `LINKS.md`).
  - Reauditoria formal da Fase 19 consolidada em `docs/publicacao/UAT-v1.2.md`: 562 testes passando (50/50 arquivos), `npx tsc --noEmit` limpo, `npm run build` limpo em 17.56s, `npx eslint src/hooks/useReadiness.ts src/pages/Demo.tsx` limpo (0 erros), diff dos arquivos blindados estritamente vazio e remoção do emoji residual do título no `README.md`.
- **Ações Externas Pendentes (do Dono):**
  - Publicar no Lovable com acesso público (`https://neuro-suite.lovable.app/demo`).
  - Abrir janela anônima, inspecionar DevTools (Network) e confirmar 0 requisições a `supabase`.
  - Hospedar o deck (PDF/PPTX) e vídeo de 30s com link público e preencher `docs/publicacao/LINKS.md`.
  - Executar o UAT cronometrado de 60s em janela anônima (`docs/publicacao/UAT-v1.2.md`).

## Marco v1.3 — Demo Multilíngue EN e PT (auditoria final em 2026-11-15)

- **Status:** Auditoria final técnica 100% aprovada (Fase 31 concluída; relatório oficial em `docs/publicacao/UAT-v1.3.md`). 52 arquivos de teste e 599 testes passando, `npx tsc --noEmit` limpo (0 erros), `npm run build` limpo em 18.24s, ESLint limpo (0 erros em i18n e páginas), blindados intactos, segredos sanitizados.
- **Entregas Validadas:**
  - Núcleo i18n (`src/i18n/index.tsx`) leve, reativo e puro com detecção via `?lang=`, `localStorage`, navegador e fallback `en`.
  - `LanguageToggle.tsx` acessível (alvo >= 44px) integrado nos headers de `/demo`, `/` e `/auth`, compatível com mobile 375px.
  - Isolamento estrito de escopo: `LangProvider` restrito a rotas públicas; Dashboard e rotas operacionais internas 100% em português (`Dashboard.test.tsx` 27/27 testes passando).
  - Paridade de chaves `en`/`pt` garantida em todos os namespaces (`common`, `demo`, `predictive`, `landing`, `auth`).
  - Zero chamadas Supabase na `/demo` em inglês e português comprovadas em `Demo.test.tsx` (8/8 testes passando).
  - Consistência de métricas (34/14/5,5; 52/14/5,5; 72/18/5,5) comprovada entre `Demo.tsx`, Decks (PPTX e PDF de exatamente 7 slides/páginas) e Roteiros de Vídeo (rigorosamente 30s).
  - Hashes SHA-256 de `CrewVitals-Demo.pptx` e `CrewVitals-Demo.pdf` estritamente idênticos às versões `-EN.pptx` e `-EN.pdf`.
  - Documentação de publicação e `README.md` bilíngues, sem emojis em títulos, com links `?lang=en` e `?lang=pt`.
- **Ações Externas Pendentes (do Dono):**
  - Publicação no Lovable com deploy público.
  - Execução do roteiro de 90 segundos em janela anônima com conferência de DevTools Network (0 requisições a `supabase`).
  - Upload externo do Deck e Vídeo e preenchimento dos placeholders `<FILL IN>` em `docs/publicacao/LINKS.md`.

## Current Position

Phase: 31 — Auditoria Final do Marco v1.3
Plan: Concluído
Status: Marco v1.3 auditado e homologado para submissão da banca
Last activity: 2026-11-15 — Auditoria técnica completa (599 testes, tsc, build, eslint, diff e consistência aprovados)

## Marco v1.4 — App logado em EN e PT (planejado em 2026-11-15)

- **Status:** planejado. Prompts prontos em `.planning/prompts-v1.4/` (fases 32 a 45). Nada executado.
- **Causa do pedido:** após o login não aparecia o seletor de idioma, porque o `LangProvider` só cobria `/`, `/auth` e `/demo`.
- **Ordem:** 32 a 44 em paralelo (sem dependência entre si, só do núcleo da fase 21); 45 por último. Não publicar no Lovable com fases pela metade (idiomas misturados).
- **Pendências herdadas (dono):** log de rede real em `/demo`, ensaio em janela anônima, hospedar deck e vídeo, trocar a senha da conta demo antiga.

- **Atualização v1.4 (2026-11-15):** fases 32 a 44 executadas; auditoria da fase 45 = APROVADO COM RESSALVAS. 680 testes (duas execuções), tsc, eslint do escopo e build limpos; blindados intactos; 18 locales, 1.495 chaves, sem duplicatas. Abertos: D1 (linha do tempo nova em `MissionLog`, fora de escopo), D2 (selo NASA e "tempo real" herdados), D3 (fallbacks locais ainda em português), D4 (`resetPassword` morto em `useAuth`), D5 (rastreabilidade). Pendências do dono: fluxo logado no navegador, log de rede em `/demo`, trocar a senha da conta demo antiga.
