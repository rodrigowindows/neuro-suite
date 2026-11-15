# User Acceptance Testing (UAT) — Fase 03-Polish
**Data de Execução:** 15/11/2026
**Ambiente:** Windows 11 / PowerShell + Git Bash / Node.js v24.15.0 / Vite 5.4.19 / Vitest 4.1.12
**Escopo:** Verificação automatizada por comando com saídas reais + checklist visual manual pendente. Nenhum código foi alterado nesta execução; apenas este arquivo.

**Classificações usadas:** PASSOU · FALHOU · NÃO VERIFICADO

---

## 1. Sumário

| # | Verificação | Status | Evidência (saída real) |
|:-:|:--|:--:|:--|
| 1a | `npm test -- --run` | **PASSOU** | `Test Files 39 passed (39)`, `Tests 478 passed (478)`, exit 0, 15.83s. Ver §2.1 |
| 1b | `npx tsc --noEmit` | **PASSOU** | Exit 0, sem saída |
| 1c | `npm run build` | **PASSOU** | Exit 0, `✓ built in 15.44s`. Ver §2.3 |
| 2 | `git diff package.json package-lock.json src/integrations/supabase/ supabase/` | **PASSOU** | 0 linhas de diff; `git status` nos mesmos caminhos vazio |
| 3 | Grep de emojis em `src/components/` (exclusões da regra) | **PASSOU** | 0 ocorrências no escopo. Ver §2.5 para as exclusões |
| 4a | Valor fabricado `34/100` em `src/` (sem testes) | **PASSOU** | 0 ocorrências |
| 4b | Valor fabricado `21.6` em `src/` (sem testes) | **PASSOU** | 0 ocorrências |
| 4c | Valor fabricado `7.5` em `src/` (sem testes) | **PASSOU** | Única ocorrência real: `MissionLog.tsx:385` (`placeholder="Ex: 7.5"`). Não é fallback |
| 4d | Rótulo `ARED` em `src/` (sem testes) | **PASSOU** | Apenas rótulo/placeholder: `MissionLog.tsx:398`, `WellnessReportPDF.tsx:158` |
| 5 | Checklist visual (4 estados, sincronia, widget de conexão, 1366x768 e 390x844, 3 etapas da demo) | **NÃO VERIFICADO** | Exige navegador. Roteiro na §4 |

**Nota sobre as greps (4a–4d):** foram refeitas sobre o disco com a ferramenta Grep, não com `git grep`. Motivo: 22 arquivos de `src/` estão **não rastreados** pelo git (ex.: `src/lib/downlink.ts`, `src/hooks/useReadiness.ts`, `src/lib/demoScenario.ts`) e `git grep` os ignora.

---

## 2. Resultados Automatizados

### 2.1 `npm test -- --run` — PASSOU

- **Comando:** `npm test -- --run` (`vitest run --run`)
- **Resultado:** Exit 0. `Test Files 39 passed (39)`. `Tests 478 passed (478)`. Duração 15.83s.
- **Falhas:** nenhuma. A falha antiga de `src/hooks/useReadiness.test.ts:261` (`caution` esperado, `nogo` recebido) **não ocorre mais** e foi removida deste documento.
- **"Not implemented" no stderr:** **0 ocorrências** (verificado em stdout e stderr).
- **Stderr (4 linhas, não são falhas):**
  - Aviso do Vite sobre `__dirname` em `vitest.config.ts:14` (`configLoader: 'native'`).
  - Aviso de `optimizeDeps.esbuildOptions` deprecado, vindo do plugin `vite:react-swc`.

### 2.2 `npx tsc --noEmit` — PASSOU

- Exit 0, sem erros de tipagem.

### 2.3 `npm run build` — PASSOU

- Exit 0, `✓ built in 15.44s`.
- Aviso não bloqueante: chunk `index-BGvojv9g.js` com 853.70 kB (gzip 256.37 kB), acima do limite de 500 kB. Não é falha de build.

### 2.4 `git diff package.json package-lock.json src/integrations/supabase/ supabase/` — PASSOU

- 0 linhas de diff. `git status` nesses caminhos também não lista nada. Não há alteração não commitada em dependências nem na integração Supabase.

### 2.5 Grep de emojis — PASSOU

```
Regra: [\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}] em src/components/, excluindo *.test.*, *AIInsights*, *DashboardRH*, *HRAlerts*, *NR1*, *ROIDashboard*, *PGR*, *Turnover*, *NarrativeReport*
Resultado: 0 ocorrências no escopo.
```

- **Limite da regra:** os 10 arquivos com emoji dentro de `src/components/` são exatamente os excluídos (`AIInsightsDashboard`, `DashboardRH`, `HRAlerts`, `NR1ComplianceChatbot`, `NR1ComplianceScoreCard`, `NR1Report`, `NarrativeReportGenerator`, `PGRReportGenerator`, `ROIDashboard`, `TurnoverPrediction`). O PASS vale para o escopo definido, não para esses módulos.
- **Fora do escopo da regra:** há emojis em `src/pages/` (`Auth.tsx`, `Index.tsx`, `Profile.tsx`, `ResetPassword.tsx`), `src/hooks/` (`useAuth.tsx`, `useFeatureScores.tsx`, `useStressNotifications.ts`) e `src/services/` (`alertGenerator.ts`, `coachService.ts`, `stressCalculator.ts`). Não foram tratados nesta verificação.

### 2.6 Valores fabricados — PASSOU

```
34/100  → 0 ocorrências em src/ (sem testes)
21.6    → 0 ocorrências em src/ (sem testes)
7.5     → src/components/MissionLog.tsx:385  placeholder="Ex: 7.5"
          (ocorrências em src/pages/Auth.tsx:174 e :269 são dados de path SVG, não valores de UI)
ARED    → src/components/MissionLog.tsx:398  placeholder (ARED)
          src/components/WellnessReportPDF.tsx:158  rótulo "Log de Exercício Físico (ARED / Contra Microgravidade)"
```

---

## 3. Itens de Verificação Visual — NÃO VERIFICADO

Nenhum item visual foi inspecionado no navegador nesta execução.

Estados a validar (textos conforme código atual):

| Estado | Header (`MissionStatusWidget`) | Cockpit (`BridgeConsole`) | Botão primário |
|:--|:--|:--|:--|
| Sem dados | Status da Missão: Aguardando scan | AGUARDANDO SCAN | Iniciar Scan de Prontidão |
| NO-GO demo (`?demo=1`) | Atenção: Fadiga Detectada | NO-GO - FADIGA (NÃO APTO) + badge DEMO | Iniciar Protocolo 4-7-8 |
| NO-GO após protocolo (real) | — | NO-GO - PROTOCOLO REGISTRADO | Reavaliar com BioScore |
| GO | Status da Missão: Nominal | GO - APTO PARA O TURNO | Iniciar Turno |

Widget de conexão (`ConnectionStatusWidget.tsx`): botões `Simular Queda` / `Reconectar`; badge `Uplink da Terra: Ativo` / modo autônomo; persistência em `localStorage` (`mars_mission_connection_mode`).

---

## 4. Roteiro Cronometrado de Verificação Manual (≈ 30 min)

**Pré-requisitos (0:00–0:05)**
1. Terminal em `C:\Projetos\neuro-suite`: `npm run dev`.
2. Aguardar a URL. Porta `8080` (`vite.config.ts`).
3. **Fazer login antes** de gravar, em `http://localhost:8080/auth`.
4. **Abrir `http://localhost:8080/dashboard?demo=reset` antes de gravar.** Limpa o estágio de sessão da demo e restaura a etapa 1. Depois, abrir DevTools (F12) → aba *Console* e *Application → Local Storage*.

**Bloco A — Viewport desktop 1366x768 (0:05–0:14)**
1. (0:05) DevTools → Device toolbar → `1366 x 768`. Recarregar em `/dashboard?demo=reset`.
2. (0:06) Estado sem dados: limpar `mars_mission_connection_mode` no Local Storage e confirmar a tela sem scan. Conferir: header `Aguardando scan`, cockpit `AGUARDANDO SCAN`, botão `Iniciar Scan de Prontidão`. Registrar PASSOU/FALHOU.
3. (0:08) Clicar em `Iniciar Scan de Prontidão`. Deve abrir a aba NeuroScore. Registrar.
4. (0:09) Abrir `http://localhost:8080/dashboard?demo=1`. Conferir NO-GO: header `Atenção: Fadiga Detectada`, cockpit `NO-GO - FADIGA (NÃO APTO)`, badge DEMO, botão `Iniciar Protocolo 4-7-8`. Registrar.
5. (0:11) Widget de conexão: clicar `Simular Queda`. Esperar 1 toast ("Conexão com a Terra perdida…"). Badge âmbar e botão `Reconectar`. Verificar `localStorage.mars_mission_connection_mode === 'autonomous'`. Registrar.
6. (0:12) Clicar `Reconectar`. Esperar 1 toast ("Uplink restabelecido…"). Badge verde. Verificar `'online'`.
7. (0:13) Checar overflow: header, widget e título não sobrepostos. Sem barra de rolagem horizontal.

**Bloco B — Viewport mobile 390x844 (0:14–0:24)**
1. (0:14) DevTools → `390 x 844`. Recarregar em `/dashboard?demo=reset`.
2. (0:15) Repetir os passos 2–4 do Bloco A (estado sem dados, `?demo=1`).
3. (0:18) Widget de conexão: subtexto truncado (`max-w-[200px] truncate`) e botão mostrando só ícone (`hidden sm:inline`). Confirmar que o ícone é visível e clicável.
4. (0:20) Repetir `Simular Queda` / `Reconectar`. Confirmar 1 toast por clique.
5. (0:22) Rolar a página inteira. Sem rolagem horizontal. Gutter lateral de 16px.
6. (0:23) Alternar as abas do cockpit: `bridge-console`, `checkin`, `neuroscore`, `gamification`, `neurocoach`, `cognitive-fatigue`, `mission-log`. Cada aba renderiza sem erro no Console.

**Bloco C — Console e encerramento (0:24–0:30)**
1. (0:24) Console: filtrar erros vermelhos desde o carregamento. Registrar qualquer `Error`/`Warning` relevante.
2. (0:26) Preencher a tabela de §5 com PASSOU/FALHOU por linha.
3. (0:28) Se houver FALHOU, anotar arquivo:linha e captura de tela.
4. (0:30) Encerrar `npm run dev` (Ctrl+C).

---

## 5. Registro Manual (preencher durante o roteiro)

| Passo | Viewport | Resultado |
|:--|:--|:--:|
| Estado sem dados (header + cockpit + botão) | 1366x768 | NÃO VERIFICADO |
| Estado sem dados (header + cockpit + botão) | 390x844 | NÃO VERIFICADO |
| NO-GO demo (`?demo=1`) | 1366x768 | NÃO VERIFICADO |
| NO-GO demo (`?demo=1`) | 390x844 | NÃO VERIFICADO |
| Widget de conexão: queda e reconexão, 1 toast cada | 1366x768 | NÃO VERIFICADO |
| Widget de conexão: queda e reconexão, 1 toast cada | 390x844 | NÃO VERIFICADO |
| Sem overflow horizontal | 390x844 | NÃO VERIFICADO |
| Sete abas do cockpit sem erro no Console | 390x844 | NÃO VERIFICADO |

---

## 6. Mudanças de comportamento conhecidas

Estas mudanças são intencionais nesta fase. Não são regressões.

**(a) Estresse moderado com HRV até cerca de 40 vira NO-GO.**
- Regra do veredito fisiológico: `bioScore > 0 && bioScore < 50` resulta em `nogo` (`src/lib/readiness.ts:51`). Um HRV baixo pode derrubar o bioScore abaixo de 50.
- Status: NÃO VERIFICADO no navegador. Comportamento descrito pelo solicitante; não há teste manual executado nesta rodada.

**(b) Após reload sem rede, o cockpit volta a AGUARDANDO SCAN.**
- O último scan vem do Supabase: `src/hooks/useReadiness.ts:103` lê `stress_scans` e `:111` lê `profiles`. Sem rede, não há dado para exibir.
- Status: a fonte está confirmada no código. O comportamento de reload offline é NÃO VERIFICADO.

**(c) "Pacote salvo localmente" é simulação, sem envio real.**
- Texto em `src/lib/downlink.ts:18`: `Pacote salvo localmente (simulação de uplink — nenhum envio real)`.
- Aplicado no Modo Autônomo, com marcação `envio: 'simulado'` (`src/lib/downlink.ts:491`). Nenhum dado sai do navegador.
- Status: texto e marcação confirmados no código e nos testes (`src/lib/downlink.test.ts:440`, `src/components/MissionLog.test.tsx:637`).

---

## 7. Pendências

1. **Verificação visual:** executar o Bloco A–C da §4 e preencher §5.
2. **Emojis fora do escopo da regra:** `src/pages/`, `src/hooks/` e `src/services/` contêm emojis. Não tratados nesta fase.
3. **Aviso de bundle:** chunk principal de 853.70 kB. Não é falha; code-splitting fica para fase futura.
