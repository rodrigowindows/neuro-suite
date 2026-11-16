# Fase 30 — Revisão da Qualidade das Traduções EN/PT (Marco v1.3 CrewVitals)

## Status: Concluída com sucesso (Aprovada sem correções necessárias)

Data: 2026-11-15
Objetivo: Verificar consistência terminológica entre os dicionários criados (`src/i18n/locales/*.ts`), naturalidade do inglês, integridade absoluta dos textos em português e ausência de novas alegações infladas após as fases 21 a 29 commitadas.

---

## 1. Verificação Prévia de Dependências (Fases 21 a 29)
Todas as fases anteriores do marco v1.3 foram validadas e commitadas no branch `main`:
- Fase 21: `ea18d48` (`feat(i18n): nucleo EN/PT com provider, hook e seletor de idioma`) e `abc0e27` (`docs(21)`)
- Fase 22: `c5d614b` (`feat(demo): demonstracao em ingles e portugues`) e `3adbb4c` (`docs(22)`)
- Fase 23: `88549d9` (`feat(alerta): alerta preditivo em ingles e portugues`)
- Fase 24: `960a68e` (`feat(landing): landing em ingles e portugues`)
- Fase 25: `da359b0` (`feat(auth): tela de login em ingles e portugues`)
- Fase 26: `9dfbc15` (`docs(apresentacao): deck de 7 slides em ingles e portugues`)
- Fase 27: `5eacb5e` (`docs(video): roteiro de 30s em ingles e portugues`)
- Fase 28: `9722fe7` (`docs(readme): README em ingles e portugues`)
- Fase 29: `6f69a3a` (`docs(publicacao): checklist, links e texto de submissao em ingles e portugues`)

---

## 2. Auditoria Terminológica contra o `GLOSSARY.md`

| Termo / Conceito | Esperado GLOSSARY.md | Encontrado nos Locales | Status |
|---|---|---|---|
| Estado GO | `GO - FIT FOR SHIFT` | `demo.status.go`: `'GO - FIT FOR SHIFT'` | CONFORME |
| Estado CAUTION | `CAUTION - WATCH` | `demo.status.caution`: `'CAUTION - WATCH'` | CONFORME |
| Estado NO-GO | `NO-GO - FATIGUE (NOT FIT)` | `demo.status.nogo`: `'NO-GO - FATIGUE (NOT FIT)'` | CONFORME |
| Estado Indefinido | `AWAITING SCAN` | `demo.status.unknown`: `'AWAITING SCAN'` | CONFORME |
| Subtítulo do Veredito | `verdict based on stress and HRV` | `demo.verdictSubtitle`: `'verdict based on stress and HRV'` | CONFORME |
| Selo da Demo | `DEMO: simulated data` | `demo.seal`: `'DEMO: simulated data'` | CONFORME |
| Botão Protocolo | `Start 4-7-8 Protocol` | `demo.btn.startProtocol`: `'Start 4-7-8 Protocol'` | CONFORME |
| Botão Scan | `Simulate new scan` | `demo.btn.simulateScan`: `'Simulate new scan'` | CONFORME |
| Botão Iniciar Turno | `Start Shift` | `demo.btn.startShift`: `'Start Shift'` | CONFORME |
| Botão Reiniciar | `Restart demo` | `demo.btn.reset`: `'Restart demo'` | CONFORME |
| Link Entrar | `Sign in` | `demo.link.signIn`: `'Sign in'`, `auth.login.submit`: `'Sign in'` | CONFORME |
| Botão Fechar | `Close` | `demo.btn.close`: `'Close'` | CONFORME |
| Submetendo Login | `Signing in...` | `auth.login.submitting`: `'Signing in...'` | CONFORME |
| Link Demo sem Login | `View demo (no login)` / `View demo without signing in` | `landing.hero.demoButton`: `'View demo (no login)'`, `auth.login.demoLink`: `'View demo without signing in'` | CONFORME |
| Log de Eventos | `RECENT EVENT LOG` | `demo.log.title`: `'RECENT EVENT LOG'` | CONFORME |
| Log Tempos | `[10 min ago]`, `[2 min ago]`, `[now]` | `demo.log.1.time`, `demo.log.2.time`, `demo.log.3.time` | CONFORME |
| Log Mensagem 1 | `Predictive alert: Elevated fatigue (BioScore {score})` | `demo.log.1.message`: interpolado com `{score}` | CONFORME |
| Log Mensagem 2 | `Action: Countermeasure executed (4-7-8 breathing)` | `demo.log.2.message` | CONFORME |
| Log Mensagem 3 | `Status updated: Stable (BioScore {score}, HRV {hrv})` | `demo.log.3.message`: interpolado com `{score}`, `{hrv}` | CONFORME |
| Aviso Contramedida | `Local countermeasure executed: 3 cycles of 4-7-8 breathing completed.` | `demo.notice.countermeasure` | CONFORME |
| Aviso Turno | `Operational shift started.` | `demo.notice.shiftStarted` | CONFORME |
| Selo Alerta Preditivo | `Demo` | `predictive.badge`: `'Demo'` | CONFORME |
| Mensagem Alerta | `Risk of errors in precision tasks over the next 4 h — suspend docking/EVA.` | `predictive.message` | CONFORME |
| Disclaimer Alerta | `Demonstration scenario — not a validated clinical prediction.` | `predictive.disclaimer` | CONFORME |
| Unidade Piscadas | `Blinks/min` | `demo.metric.blinkRate`: `'Blinks/min'` | CONFORME |
| Unidade Sono | `Sleep`, formato `{hours} h` (EN) e `{hours}h` (PT) | `demo.metric.sleep`, `demo.format.sleep` | CONFORME |
| Tripulação | `Crew` (e não `Team`) | 100% consistente em todos os arquivos (`auth.ts`, `demo.ts`, `landing.ts`) | CONFORME |

---

## 3. Preservação dos Textos em Português
Comparação linha a linha realizada entre os locales (`pt`) e o código fonte original pré-i18n (`git show 99aee14:src/pages/Index.tsx`, `Auth.tsx`, `Demo.tsx`, `PredictiveAlert.tsx`):
- `src/i18n/locales/auth.ts`: 34 chaves PT 100% idênticas ao original.
- `src/i18n/locales/demo.ts`: 26 chaves PT 100% idênticas ao original (`5.5h`, sem emojis, com interpolação de BioScore e HRV).
- `src/i18n/locales/predictive.ts`: 4 chaves PT 100% idênticas ao componente original (`Demonstração`, `Cenário demonstrativo — não é uma previsão clínica validada`).
- `src/i18n/locales/landing.ts`: 48 chaves PT 100% idênticas aos textos originais da landing page, mantendo pontuação, termos e tags (`Tripulação`/`Comando`).

---

## 4. Honestidade Científica e Ausência de Alegações Proibidas
Varredura automatizada executada sobre todos os arquivos em `src/i18n/locales/*.ts`:
- Termos proibidos pesquisados: `clinically proven`, `NASA certified`, `NASA-approved`, `medical device`, `real-time prediction`, `100% offline`, `zero data leaks`.
- Ocorrências encontradas: 0 (Zero).
- Alerta preditivo devidamente acompanhado de seu aviso de demonstração ("Demonstration scenario — not a validated clinical prediction" / "Cenário demonstrativo — não é uma previsão clínica validada") em ambas as línguas.
- CrewVitals devidamente identificado como Decision Support System (DSS).

---

## 5. Tabela de Achados e Ajustes
| Arquivo | Chave | Antes | Depois | Motivo |
|---|---|---|---|---|
| *(Nenhum)* | - | - | - | Todos os arquivos foram gerados em estrita conformidade com o glossário e sem desvios gramaticais ou conceituais. |

**Decisão de Commit:** Como não houve necessidade de alteração em `src/i18n/locales/*.ts`, segue a diretriz: *"Se não houver correção, não commite."*

---

## 6. Itens Mantidos Fora de Escopo (Outros Prompts)
- As mensagens de toast emitidas internamente por `useAuth.tsx` (ex: `title: 'Erro no login'`, `title: 'Cadastro realizado!'`) permanecem em português, conforme deliberado na Fase 25 e nas diretrizes gerais (`useAuth.tsx` pertence ao backend/auth e não está nos locales).

---

## 7. Saídas Reais dos Comandos de Verificação

### 1. Paridade e Testes Unitários/Integração (`npm test -- --run`)
```text
> vite_react_shadcn_ts@0.0.0 test
> vitest run --run

 RUN  v4.1.12 C:/Projetos/neuro-suite

 ✓ src/lib/noEmojiUi.test.ts (1 test) 598ms
 ✓ src/components/Gamification.test.tsx (5 tests) 216ms
 ✓ src/components/LanguageToggle.test.tsx (5 tests) 222ms
 ✓ src/pages/Demo.test.tsx (8 tests)
 ✓ src/pages/Index.test.tsx (12 tests)
 ✓ src/pages/Auth.test.tsx (14 tests)
 ✓ src/components/PredictiveAlert.test.tsx (9 tests) 313ms
 ✓ src/i18n/i18n.test.ts (16 tests) 126ms
 ...
 Test Files  52 passed (52)
      Tests  599 passed (599)
   Start at  21:09:03
   Duration  33.60s (transform 9.88s, setup 70.72s, import 130.35s, tests 33.70s, environment 319.30s)
```

### 2. TypeScript (`npx tsc --noEmit`)
```text
(sem erros - exit code 0)
```

### 3. ESLint (`npx eslint src/i18n`)
```text
(sem erros nem avisos - exit code 0)
```

### 4. Build de Produção (`npm run build`)
```text
vite v5.4.19 building for production...
✓ 3118 modules transformed.
rendering chunks...
✓ built in 19.41s
```

### 5. Verificação de Arquivos Blindados
```bash
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```
Saída real:
```text
(saída vazia - zero alterações nos arquivos blindados)
```

### 6. Status do Repositório (`git status --short`)
```text
?? .planning/phases/23-predictive-alert-i18n/
?? .planning/phases/24-landing-i18n/
?? .planning/phases/25-auth-i18n/
?? .planning/phases/26-deck-bilingue/
?? .planning/phases/27-video-bilingue/
?? .planning/phases/29-publicacao-en/
?? .planning/phases/30-revisao-traducao/
```
*(Somente pastas de documentação das fases presentes como untracked, nenhum arquivo de código ou locale pendente de commit).*
