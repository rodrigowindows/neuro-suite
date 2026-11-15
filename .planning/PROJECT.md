# CrewVitals — Projeto de Telemetria de Saúde Operacional (Padrão NASA)

## Visão Geral
Sistema de monitoramento fisiológico e suporte à decisão (DSS) para mitigação de fadiga cognitiva em tripulações em ambientes operacionais críticos e missões aeroespaciais.

## Current Milestone: v1.1 Endurecimento de Segurança e Demo com Conta Compartilhada

**Goal:** Fechar os achados de AppSec que se aplicam a este repositório, adequar login e landing ao contexto NASA com texto honesto e entregar uma demo repetível sem criar conta nova, com PDF e PPTX editável para o Lincon.

**Target features:**
- Edge Functions exigem usuário autenticado de verdade (não só JWT anônimo) e `verify_jwt` coerente por função (PCS-002)
- Fluxo OAuth do Google Calendar com origem de destino correta, `event.origin` e `state` validados (PCS-004)
- Leituras com colunas explícitas e sem `console.log` de biometria; SQL de CHECK fisiológico gerado em `docs/` (PCS-005, PCS-006)
- Login: subtítulo "Terminal de Telemetria de Saúde da Tripulação", botão "Autenticar", sem Google e Apple (PCS-003, feedback do Lincon)
- Landing sem emojis, sem depoimentos inventados e sem alegações não sustentadas ("100% Offline", "0 Dados Vazados")
- Demo com conta compartilhada: o modo `?demo=1` passa a valer para a conta de demonstração mesmo que ela tenha dados, e `?demo=reset` reinicia sem recriar conta
- PDF e PPTX editável com roteiro de gravação, fluxo da demo e quadro "o que é medido e o que é simulado"
- Checklist manual de segurança (revogar chaves, confirmação de e-mail e CAPTCHA, headers de hospedagem) e `Feedbacks/` fora do Git

## Marco 1: Transição Final NASA (Concluído)
- **Status:** Homologado com 100% de sucesso
- **Contramedidas Operacionais da NASA:** Homologação completa de contramedidas operacionais (alertas com carimbo demonstrativo, análise de fadiga cognitiva, métricas de piscamento e protocolos de repouso).
- **Blindagem Lovable:** Blindagem estrutural contra quebras na plataforma Lovable através de chaves internas, rotas e schemas persistidos estáveis (`neurocoach`, `cognitive-fatigue`, `checkin`, `mission-log`, `gamification`, `neuroscore`).
- **Stack:** Vite + React + TypeScript + Tailwind CSS + shadcn/ui + Supabase + Lovable
- **Princípio Arquitetural:** Zero-Trust Privacy, estabilidade estrita de navegação e formatação de biométricas na borda de exibição.

## Marco 2: Cockpit UX e Polish (Concluído)
- **Fases:** `02-cockpit-ux` e `03-polish`
- **Entregas:** Cockpit GO/ATENÇÃO/NO-GO derivado de `useReadiness`, demo de 3 etapas, outbox offline, linha de base pessoal, pacote de downlink simulado, sintomas e fadiga percebida.
- **Pendência herdada:** checklist visual da demo no navegador continua NÃO VERIFICADO (ver `03-polish/UAT.md`).

## Requirements

### Validated
- ✓ Cockpit de prontidão com estado "sem dados" seguro — Marco 2
- ✓ Veredito fisiológico sem pontos de engajamento — Marco 2 (F5)
- ✓ Modo Autônomo com outbox e rótulos honestos de simulação — Marco 2

### Active
- [ ] Edge Functions rejeitam token anônimo e validam o usuário (PCS-002)
- [ ] OAuth do Google Calendar entrega o token só à origem esperada (PCS-004)
- [ ] Sem `select('*')` e sem `console.log` de biometria no cliente (PCS-005, PCS-006)
- [ ] Login e landing em linguagem NASA, sem emojis e sem alegações falsas
- [ ] Demo repetível com conta compartilhada, sem depender de conta nova
- [ ] PDF e PPTX editável para o Lincon
- [ ] Checklist manual de segurança e SQL de CHECK documentados

### Out of Scope
- Aplicar migration de CHECK no banco real — decisão do dono; o SQL só é gerado em `docs/` (regra de schema estável)
- Alterar `src/integrations/supabase/**`, `package.json` ou dependências — blindagem Lovable
- Trocar a hospedagem para controlar headers HTTP — o Lovable não expõe `vercel.json`; fica como risco residual documentado
- Resolver `mailer_autoconfirm` e CAPTCHA por código — são configurações da plataforma, tratadas no checklist manual

## Context
- Relatório AppSec V2 do Prof. Pablo e notas do Lincon estão em `Feedbacks/` (não comitar: o PDF traz chaves em texto claro).
- O relatório audita o `neuro-suite-main` na Vercel; este repositório roda no Lovable e já difere em vários pontos (sem chave Gemini, escape do OAuth já corrigido, `getClaims` em `neuro-coach`).
- Os terminais de execução rodam em paralelo na mesma árvore; por isso cada fase é dona de arquivos exclusivos.

## Constraints
- **Lovable**: não alterar `src/integrations/supabase/**`, `package.json`, `package-lock.json`, `vite.config.ts`, `.env` — o Lovable sincroniza e regenera esses arquivos
- **Schema**: nomes persistidos e chaves de aba estáveis (`AGENTS.md`)
- **Honestidade**: tudo simulado leva o selo DEMO; sem depoimentos ou métricas inventadas
- **Qualidade**: testes AAA, `npm test -- --run`, `npx tsc --noEmit` e `npm run build` limpos

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Demo com conta compartilhada (e não rota `/demo` pública) | Preferência do dono; evita criar conta a cada ensaio | — Pending (mitigar: forçar demo na conta demo; credenciais fora do repo e dos documentos) |
| SQL de CHECK só em `docs/` | Migration em `supabase/migrations` é aplicada pelo Lovable e altera o banco real | — Pending |
| `verify_jwt` por função, não em bloco | `google-calendar` precisa aceitar o callback do Google sem JWT | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-11-15 after starting milestone v1.1*
