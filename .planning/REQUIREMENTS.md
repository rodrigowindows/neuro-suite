# Requirements: CrewVitals v1.1

**Defined:** 2026-11-15
**Core Value:** Apoiar o tripulante a identificar e agir sobre mudanças no próprio estado, com honestidade sobre o que é medido, estimado ou simulado.

## v1.1 Requirements

Marco "Endurecimento de Segurança e Demo com Conta Compartilhada". Cada requisito mapeia para uma fase.

### Segurança (SEC)

- [x] **SEC-01**: `neuro-coach` rejeita o token anônimo: exige `role = authenticated` e `sub` presente (PCS-002)
- [ ] **SEC-01 (produção)**: 401 para a chave publicável e para token sem `sub`, verificado no deploy. Nota: aguarda deploy e ensaio visual.
- [x] **SEC-02**: Cada Edge Function tem `verify_jwt` coerente com seus chamadores; `google-calendar` fica `false`, com justificativa escrita (PCS-002)
- [ ] **SEC-02 (produção)**: `verify_jwt` aplicado no deploy e chamadas conferidas em produção. Nota: aguarda deploy e ensaio visual.
- [x] **SEC-03**: `MeetingCheckIn` envia a sessão do usuário, não a chave publicável
- [x] **SEC-04**: O popup do Google Calendar entrega o token só à origem do app (allowlist ou variável) e o receptor valida `event.origin` e `state` (PCS-004)
- [x] **SEC-05**: Leituras usam colunas explícitas, sem `select('*')`, nos 6 arquivos (PCS-005)
- [x] **SEC-06**: Nenhum `console.log` de biometria (HRV, EAR, piscadas) em produção (PCS-006)
- [x] **SEC-07**: A função `neuro-coach` não registra o identificador do usuário nos logs

### Login (AUTH)

- [x] **AUTH-01**: Subtítulo do login: "Terminal de Telemetria de Saúde da Tripulação"
- [x] **AUTH-02**: Botão principal "Autenticar" (e "Autenticando..." durante o envio)
- [x] **AUTH-03**: Botões Google e Apple removidos, com os handlers e o import do `lovable` em `Auth.tsx`

### Landing (LAND)

- [x] **LAND-01**: Sem emojis na landing (`Index.tsx`)
- [x] **LAND-02**: Depoimentos de pessoas inventadas ligadas a programas NASA removidos
- [x] **LAND-03**: Sem alegações não sustentadas ("100% Offline", "0 Dados Vazados"); só afirmações verificáveis no código
- [x] **LAND-04**: Resquícios de RH e de gestão corporativa revisados; vocabulário de tripulação e controle de missão

### Demo com conta compartilhada (DEMO)

- [x] **DEMO-01**: Constante `DEMO_ACCOUNT_EMAIL` (vazia = recurso inerte). Com `?demo=1` e o usuário logado igual à conta demo, a demo é forçada mesmo que a conta tenha dados
- [x] **DEMO-02**: Outras contas mantêm o comportamento atual: dados reais vencem a demo
- [x] **DEMO-03**: `?demo=reset` reinicia a etapa, o protocolo e o log de eventos locais, sem trocar de conta
- [x] **DEMO-04**: `?demo=1` sobrevive ao redirecionamento de login
- [x] **DEMO-05**: Roteiro fixo de 3 etapas com os rótulos do cockpit (NO-GO, ATENÇÃO, GO e "Simular novo scan"); header e cockpit concordam em cada etapa

### Documentos (DOC)

- [x] **DOC-01**: PPTX editável para o Lincon: roteiro de gravação, fluxo da demo, "o que é medido e o que é simulado" e resumo de segurança
- [x] **DOC-02**: PDF equivalente ao PPTX
- [x] **DOC-03**: Checklist manual de segurança: revogar as duas chaves, confirmação de e-mail e CAPTCHA, headers da hospedagem, derrubar o deploy da Vercel
- [x] **DOC-04**: SQL do CHECK fisiológico em `docs/seguranca/` (com `NOT VALID`), sem migration aplicada
- [x] **DOC-05**: `.gitignore` cobre `Feedbacks/` e `.env*`; credenciais da conta demo nunca entram no repositório nem nos documentos (só placeholders)

### Qualidade (QA)

- [x] **QA-01**: `npm test -- --run`, `npx tsc --noEmit` e `npm run build` limpos; `git diff` vazio nos arquivos blindados
- [x] **QA-02**: Auditoria de emojis ampliada para `src/pages/`
- [ ] **QA-03**: UAT visual do v1.1 com roteiro cronometrado e resultado de cada passo. Nota: aguarda deploy e ensaio visual.

## Futuro

- Código do CAPTCHA (Turnstile) no `signUp`, depois de a plataforma ativar a confirmação de e-mail
- Sanitização completa de contexto no prompt de IA (hoje só há truncamento)
- Headers HTTP via hospedagem própria

## Out of Scope

| Feature | Reason |
|---------|--------|
| Aplicar o CHECK no banco | Decisão do dono: o SQL só é gerado (schema estável) |
| Migration em `supabase/migrations` | O Lovable a aplicaria ao sincronizar |
| Rota `/demo` pública | Decisão do dono: conta compartilhada |
| Tocar em `src/integrations/supabase/**`, `package.json`, `vite.config.ts` | Blindagem Lovable |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01, AUTH-02, AUTH-03 | Phase 04 | Complete |
| LAND-01, LAND-02, LAND-03, LAND-04 | Phase 04 | Complete |
| SEC-01, SEC-02, SEC-07 | Phase 05 | Complete (código) |
| SEC-01, SEC-02 (produção) | Phase 05 | Pending (aguarda deploy e ensaio visual) |
| SEC-04 (lado servidor) | Phase 05 | Complete |
| SEC-03, SEC-04 (lado cliente) | Phase 06 | Complete |
| SEC-05, SEC-06 | Phase 07 | Complete |
| DEMO-01, DEMO-02, DEMO-03, DEMO-04, DEMO-05 | Phase 08 | Complete |
| DOC-01, DOC-02 | Phase 09 | Complete |
| DOC-03, DOC-04, DOC-05 | Phase 10 | Complete |
| QA-01, QA-02 | Phase 11 | Complete |
| QA-03 | Phase 11 | Pending (aguarda deploy e ensaio visual) |

**Coverage:**
- v1.1 requirements: 27 total
- Complete (código e testes): 26
- Pending (ensaio visual): 1 (QA-03)
- Verificações de produção pendentes, fora da contagem de 27: SEC-01 e SEC-02 (aguardam deploy e ensaio visual)
- Unmapped: 0

SEC-04 aparece em duas fases porque o contrato tem dois lados (função e receptor). A Phase 11 confere os dois.

---
*Requirements defined: 2026-11-15*
*Last updated: 2026-11-15 após auditoria de código da Phase 11 (550 testes, tsc e build verdes)*
