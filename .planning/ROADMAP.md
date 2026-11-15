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

---

# Marco v1.2 — Demo Pública sem Login (requisito da banca)

**Motivo:** a banca exige link público que não peça senha, permissão nem cadastro. Hoje `/dashboard` redireciona para `/auth` e o deck (9 slides) manda entrar com conta demo. Esta decisão **substitui** a linha "Rota `/demo` pública" de Out of Scope do v1.1; a conta compartilhada continua como plano B.

**Contrato fixo entre fases (permite paralelismo):** rota pública `/demo`, sem `AuthProvider` obrigatório, sem chamada ao Supabase, dados 100% simulados e rotulados. URL publicada: `https://neuro-suite.lovable.app/demo`.

**Blindagem Lovable (todas as fases):** não tocar `src/integrations/supabase/**`, `supabase/migrations/**`, `package.json`, `package-lock.json`, `bun.lock*`, `vite.config.ts`. Sem dependência nova. Chaves internas de navegação, endpoints e nomes de schema ficam estáveis. Fases rodam em terminais paralelos com arquivos exclusivos; a 16 roda por último.

| # | Phase | Goal | Requirements | Prompt |
|---|-------|------|--------------|--------|
| 12 | Rota `/demo` sem login | Cockpit navegável sem sessão, sem rede | PUB-01..04 | `.planning/prompts-v1.2/12-demo-publica.md` |
| 13 | Portas de entrada | Landing e login levam à demo sem login | PUB-05, PUB-06 | `.planning/prompts-v1.2/13-portas-de-entrada.md` |
| 14 | Deck de 7 slides e vídeo de 30 s | Material da banca sem credencial | PUB-07..09 | `.planning/prompts-v1.2/14-deck-7-slides.md` |
| 15 | Publicação e links públicos | Checklist do dono e README | PUB-10, PUB-11 | `.planning/prompts-v1.2/15-publicacao.md` |
| 16 | Auditoria e UAT sem login | Gates e prova de zero login | PUB-12 | `.planning/prompts-v1.2/16-auditoria.md` |

Fases 12, 13, 14 e 15 não compartilham arquivos. A fase 16 depende das quatro.

## Progress v1.2

| Phase | Plans | Status |
|-------|-------|--------|
| 12 | 1/1 | Concluída no código (commit 53ac4b7) |
| 13 | 1/1 | Concluída no código (commit 105c8a0) |
| 14 | 1/1 | Concluída nos materiais (commit e2810c1) |
| 15 | 1/1 | Concluída na documentação (commit 52a0a40) |
| 16 | 1/1 | Auditoria inicial com erros (commit ee90361), refeita na fase 19 |
| 17 | 1/1 | Concluída (commit c5c69bf): números reais, botões reais e acentos no deck e no vídeo |
| 18 | 1/1 | Concluída (commit 9c70ed3): `useGuestDemoReadiness` separado, eslint limpo |
| 19 | 1/1 | Reauditoria feita; resultado em `docs/publicacao/UAT-v1.2.md` |
| 20 | 0/1 | Pendente: remover e-mail da conta demo do bundle (`.planning/prompts-v1.2/20-remover-email-demo.md`) |

---

# Marco v1.3 — Demo Multilíngue (EN e PT)

**Motivo:** o projeto e a banca são em inglês. A demo, a landing, o login, o deck, o vídeo, o README e a publicação precisam de EN e PT, com EN como padrão para navegadores não portugueses.

**Decisão:** módulo próprio `src/i18n/` (sem biblioteca; `package.json` é blindado), `LangProvider` só nas rotas `/`, `/auth` e `/demo`. O resto do app segue em português. Contrato e glossário em `.planning/prompts-v1.3/`.

| # | Phase | Goal | Requirements | Prompt |
|---|-------|------|--------------|--------|
| 21 | Núcleo i18n | Provider, hook, seletor EN/PT, teste de paridade | I18N-01..03 | `21-i18n-core.md` |
| 22 | Demo EN/PT | `/demo` traduzida, log e avisos incluídos | I18N-04 | `22-demo-i18n.md` |
| 23 | Alerta preditivo EN/PT | Tradução sem afetar o Dashboard | I18N-05 | `23-predictive-alert-i18n.md` |
| 24 | Landing EN/PT | Landing traduzida | I18N-06 | `24-landing-i18n.md` |
| 25 | Login EN/PT | `/auth` traduzida | I18N-07 | `25-auth-i18n.md` |
| 26 | Deck EN/PT | PPTX e PDF de 7 slides em cada língua | I18N-08 | `26-deck-bilingue.md` |
| 27 | Vídeo EN/PT | Roteiros de 30 s | I18N-09 | `27-video-bilingue.md` |
| 28 | README EN/PT | README bilíngue sem emojis nos títulos | I18N-10 | `28-readme-bilingue.md` |
| 29 | Publicação EN/PT | Checklist, links e texto de submissão | I18N-11 | `29-publicacao-en.md` |
| 30 | Revisão de tradução | Termos, naturalidade, PT preservado | I18N-12 | `30-revisao-traducao.md` |
| 31 | Auditoria v1.3 | Gates, escopo, consistência, UAT | I18N-12 | `31-auditoria-i18n.md` |

Ondas: 21, 26, 27, 28, 29 em paralelo; depois 22, 23, 24, 25 em paralelo; depois 30; por fim 31.
