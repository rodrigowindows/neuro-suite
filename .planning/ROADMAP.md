# Roadmap: CrewVitals v1.1 — Endurecimento de Segurança e Demo com Conta Compartilhada

Numeração continua do Marco 2 (fases 01 a 03). As fases 04 a 10 não compartilham arquivos e rodam em terminais paralelos; a fase 11 roda por último.

## Phases

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 04 | Login e Landing | Texto NASA, sem OAuth, landing honesta | AUTH-01..03, LAND-01..04 | 5 |
| 05 | Edge Functions e JWT | Funções só aceitam usuário autenticado; origem do OAuth correta | SEC-01, SEC-02, SEC-07, SEC-04 (servidor) | 4 |
| 06 | Cliente OAuth e Sessão | Receptor valida origem e state; sessão do usuário no check-in | SEC-03, SEC-04 (cliente) | 3 |
| 07 | Leituras e Logs | Colunas explícitas; sem biometria no console | SEC-05, SEC-06 | 3 |
| 08 | Demo com Conta Compartilhada | Demo forçada na conta demo, reset limpo, roteiro de 3 etapas | DEMO-01..05 | 5 |
| 09 | Apresentação | PPTX editável e PDF para o Lincon | DOC-01, DOC-02 | 3 |
| 10 | Documentação de Segurança | Checklist manual, SQL de CHECK, `.gitignore` | DOC-03..05 | 3 |
| 11 | Auditoria e UAT | Gates, integração entre fases, UAT visual | QA-01..03 | 4 |

## Phase Details

### Phase 04: Login e Landing
**Goal:** `/auth` e a landing falam a língua da NASA e não afirmam o que o sistema não faz.
**Arquivos exclusivos:** `src/pages/Auth.tsx`, `src/pages/Index.tsx` e testes correspondentes.
**Success criteria:**
1. Subtítulo do login é "Terminal de Telemetria de Saúde da Tripulação".
2. Botão principal é "Autenticar" (e "Autenticando...").
3. Não existem botões Google e Apple, nem seus handlers.
4. `Index.tsx` não tem emojis, depoimentos inventados, "100% Offline" nem "0 Dados Vazados".
5. Nenhum texto de RH ou de gestão corporativa na landing.

### Phase 05: Edge Functions e JWT
**Goal:** As funções rejeitam token anônimo e entregam o OAuth só ao app.
**Arquivos exclusivos:** `supabase/config.toml`, `supabase/functions/neuro-coach/index.ts`, `supabase/functions/google-calendar/index.ts`, `supabase/functions/_shared/claims.ts` e seu teste.
**Success criteria:**
1. `neuro-coach` responde 401 para a chave publicável e para token sem `sub`.
2. `config.toml` tem `verify_jwt = true` só onde todos os chamadores enviam sessão de usuário; `google-calendar` fica `false` com comentário explicando.
3. `google-calendar` posta a mensagem para a origem do app (allowlist ou `FRONTEND_ORIGIN`), nunca `*` nem `window.location.origin`.
4. `neuro-coach` não loga o identificador do usuário.

### Phase 06: Cliente OAuth e Sessão
**Goal:** O navegador só aceita o token da origem esperada e as chamadas usam a sessão real.
**Arquivos exclusivos:** `src/components/IntegrationsDashboard.tsx`, `src/components/integrations/MeetingCheckIn.tsx` e testes.
**Success criteria:**
1. O receptor ignora mensagens cuja `event.origin` não seja a esperada.
2. O `state` gerado em `action=auth` é conferido antes de aceitar o token.
3. `MeetingCheckIn` envia o token da sessão (`supabase.auth.getSession()`) e trata sessão ausente sem chamar a função.

### Phase 07: Leituras e Logs
**Goal:** O cliente pede só as colunas de que precisa e não imprime biometria.
**Arquivos exclusivos:** `src/components/WebcamCapture.tsx`, `DailyCheckin.tsx`, `Gamification.tsx`, `src/hooks/useGamificationScore.ts`, `src/components/NeuroScore.tsx`, `src/components/features/NeuroScore/index.tsx` e testes.
**Success criteria:**
1. Não há `select('*')` em `src/` fora de testes.
2. Cada `select` lista colunas que existem em `src/integrations/supabase/types.ts` (somente leitura).
3. `console.log` de biometria removido, ou protegido por `import.meta.env.DEV`.

### Phase 08: Demo com Conta Compartilhada
**Goal:** A gravação é repetível com uma conta que o Lincon já tem, sem recriar nada.
**Arquivos exclusivos:** `src/lib/constants.ts`, `src/lib/demoScenario.ts`, `src/lib/missionEvents.ts`, `src/hooks/useReadiness.ts`, `src/pages/Dashboard.tsx` e testes.
**Pré-condição:** commit das alterações pendentes do G5 (mesmos arquivos).
**Success criteria:**
1. Com `DEMO_ACCOUNT_EMAIL` definido e o usuário igual a ele, `?demo=1` força a demo mesmo com dados no banco.
2. Com `DEMO_ACCOUNT_EMAIL` vazio ou outro usuário, nada muda (dados reais vencem).
3. `?demo=reset` volta à etapa 1, limpa o protocolo do dia e o log de eventos local, e a URL passa a `?demo=1`.
4. `?demo=1` sobrevive ao login.
5. Header e cockpit concordam nas etapas 1, 2 e 3.

### Phase 09: Apresentação
**Goal:** O Lincon grava sem precisar perguntar nada.
**Arquivos exclusivos:** `docs/apresentacao/**`.
**Success criteria:**
1. PPTX editável com roteiro cronometrado, fluxo da demo e quadro "medido versus simulado".
2. PDF com o mesmo conteúdo.
3. Credenciais ausentes (placeholders) e nenhuma alegação não sustentada.

### Phase 10: Documentação de Segurança
**Goal:** Tudo o que não é código fica escrito e com dono.
**Arquivos exclusivos:** `docs/seguranca/**`, `.gitignore`.
**Success criteria:**
1. Checklist manual com os passos e como verificar cada um.
2. SQL do CHECK (`NOT VALID`) em `docs/seguranca/`, sem migration criada.
3. `.gitignore` cobre `Feedbacks/` e `.env*`.

### Phase 11: Auditoria e UAT
**Goal:** Fechar o marco com evidência.
**Success criteria:**
1. Gates verdes e `git diff` vazio nos arquivos blindados.
2. Pares acoplados conferidos: `neuro-coach` com `MeetingCheckIn`; `google-calendar` com `IntegrationsDashboard`.
3. Auditoria de emojis em `src/pages/` e `src/components/`.
4. UAT visual cronometrado, com PASSOU, FALHOU ou NÃO VERIFICADO em cada passo.

## Progress

| Phase | Plans | Status |
|-------|-------|--------|
| 04 | 1/1 | Concluída no código |
| 05 | 1/1 | Concluída no código |
| 06 | 1/1 | Concluída no código |
| 07 | 1/1 | Concluída no código |
| 08 | 1/1 | Concluída no código |
| 09 | 1/1 | Concluída no código |
| 10 | 1/1 | Concluída no código |
| 11 | 0/1 | Aguarda ensaio visual e deploy |

---
*Roadmap created: 2026-11-15*
