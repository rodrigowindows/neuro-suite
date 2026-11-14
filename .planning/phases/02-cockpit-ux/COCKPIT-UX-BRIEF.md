# Fase 02 — Cockpit UX: Auditoria e Brief de Implementação (para Anti Gravity)

Origem: auditoria do front-end atual (AppSidebar, Dashboard, DashboardContent, BridgeConsole, PredictiveAlert, DailyCheckin).
Escopo: **somente UI**. Nenhuma mudança em chaves de aba, endpoints Supabase, schema ou thresholds.

## 0. Regras invioláveis (AGENTS.md + restrições Lovable)
1. Chaves internas permanecem: `bridge-console`, `checkin`, `neuroscore`, `gamification`, `neurocoach`, `cognitive-fatigue`, `mission-log` (+ chaves de gestor). `activeTab` continua sendo uma dessas strings. `DashboardContent.tsx` (switch) **não é alterado**.
2. Endpoints/tabelas Supabase (`stress_scans`, `profiles`...) intocados.
3. Alerta preditivo = **demonstração rotulada**, não previsão validada. O rótulo "Cenário demonstrativo" deve continuar visível.
4. Piscadas/min formatadas só na fronteira de exibição (`roundBlinkRate`); valor armazenado e thresholds mantêm precisão.
5. Stack: Vite + React 18 + Tailwind + shadcn/ui. Sem novas dependências.
6. Testes existentes (`BridgeConsole.test.tsx`, `Dashboard.test.tsx`, `NeuroCoach.test.tsx`, etc.) devem ser atualizados junto, seguindo AAA, e `npm test` + `tsc` + build devem passar.

## 1. Diagnóstico (evidências no código)

| # | Problema | Evidência |
|---|----------|-----------|
| D1 | 7 itens de sidebar com título + subtítulo + emoji + badge de score | `AppSidebar.tsx:21-29` |
| D2 | **Dois alertas vermelhos empilhados**: banner "Atenção: Fadiga elevada" + `PredictiveAlert` aninhado dentro de um `Card` vermelho | `BridgeConsole.tsx:197-210` |
| D3 | Alerta preditivo repete a mesma informação 4x (título, frase, "+45%", "Ação Recomendada") e tem o botão "Iniciar Protocolo de Mitigação" | `PredictiveAlert.tsx:20-60` |
| D4 | Alerta aparece **sempre**, com valores fixos (BioScore 34) mesmo quando o BioScore exibido é 85 → contradição visível na mesma tela | `PredictiveAlert.tsx:28` vs `BridgeConsole.tsx:97-104` |
| D5 | `PredictiveAlert` também é renderizado na aba `checkin` (`Dashboard.tsx:145`) → duplicado | `Dashboard.tsx:145` |
| D6 | 3 cards "Jornada do Astronauta" com badge + descrição + "Finalidade:" + link + tooltip: 5 camadas de texto por atalho | `BridgeConsole.tsx:212-368` |
| D7 | Botões concorrentes na mesma tela: "Avaliação de Turno", "Modo Autônomo", "Iniciar Protocolo de Mitigação", 3 cards-botão, "Iniciar Contramedidas (AstroAssist)", "Abrir Biometric Log Completo" = **8 CTAs** | `BridgeConsole.tsx` |
| D8 | Título repetido: header global (`Dashboard.tsx:131`) + `<h1>Bridge Console</h1>` interno + CardTitle "Console da Ponte" | `BridgeConsole.tsx:158,379` |
| D9 | Texto de desenvolvedor vazando para a UI: "Formatado na fronteira de exibição" | `BridgeConsole.tsx:449-451` |
| D10 | HRV aparece como 4º número e "Status" repete o label do badge de prontidão (3x o mesmo label) | `BridgeConsole.tsx:387,473` |
| D11 | Defaults inventados sem sinalização: HRV 48, piscadas 21.6, sono 7.5h, exercício "ARED" | `BridgeConsole.tsx:94-95,133-141` |
| D12 | Emojis em UI: sidebar (campo `emoji` não usado, mas poluição de dados), DailyCheckin (🤩😊⚡😔😩 🔋), "✨", "⚠️" no título do alerta | `DailyCheckin.tsx:14-18,275`, `PredictiveAlert.tsx:25` |
| D13 | Sidebar de gestor com 8 itens adicionais misturados à navegação do astronauta | `AppSidebar.tsx:31-40` |
| D14 | Pós-scan redireciona para `gamification` (aba "Disciplina de Missão"), desconectada do fluxo de decisão | `Dashboard.tsx:106` |
| D15 | Terminologia mista PT/EN e jargão: "Bridge Console", "BioScore", "Biometric Log", "AstroAssist", "Avaliação de Turno" ("Fazer novo Avaliação de Turno" — erro de concordância) | `DailyCheckin.tsx:195` |

## 2. Arquitetura de Informação — Regra dos 3 Modos

A sidebar passa de 7 itens para **3 seções**. Cada seção mapeia para uma aba existente (a "porta de entrada"); as demais abas continuam existindo e são alcançadas por **sub-navegação interna (Tabs shadcn)** ou por CTA contextual. `setActiveTab` continua recebendo as mesmas chaves.

| Seção (UI) | Chave principal | Chaves absorvidas (acessíveis via Tabs internas) | Papel |
|---|---|---|---|
| **1. Cockpit** | `bridge-console` | `checkin` (como passo "Avaliação de Turno" do próprio cockpit), `neuroscore` (botão "Atualizar scan") | Decidir: GO / NO-GO |
| **2. Contramedidas** | `neurocoach` | `gamification` (protocolos/rotinas), `cognitive-fatigue` (ciência/apoio) | Agir quando NO-GO |
| **3. Histórico de Voo** | `mission-log` | `cognitive-fatigue` (série temporal), `checkin` (histórico `CheckinHistory`) | Revisar tendências |

Regras de implementação:
- `AppSidebar.tsx`: `employeeItems` vira 3 itens `{ title, value, icon }` — **sem** `description`, **sem** `emoji`, **sem** badge de score na sidebar. Grupo de gestor continua, mas colapsado em um único `SidebarGroup` recolhível "Comando" (default fechado).
- `gamificationDisabled` deixa de bloquear navegação na sidebar (a aba some da sidebar); bloqueio fica dentro da seção Contramedidas.
- Sub-navegação: componente leve `SectionTabs` (shadcn `Tabs`) renderizado no topo de cada seção, que chama `onTabChange(chave)`. Sem alterar `DashboardContent`.
- `PAGE_TITLES/PAGE_DESCRIPTIONS` em `Dashboard.tsx`: título curto (1-2 palavras), descrição removida do header (`hidden sm:block` some).
- Pós-scan (`handleStressLevelComplete`): voltar para `bridge-console` (não `gamification`), para o usuário ver o veredito atualizado.

## 3. Tela principal — Cockpit GO / NO-GO (`BridgeConsole.tsx`)

Reescrever o **corpo** de `BridgeConsole` mantendo props (`onNavigateTab`, `stressLevel`, `hrvValue`, `blinkRate`, `bioScore`) e o `loadTelemetry` (mesmas queries). Hierarquia vertical, uma coluna, centralizada, `max-w-3xl`:

```
┌───────────────────────────────────────────────┐
│  NÍVEL 1  — SEMÁFORO DE PRONTIDÃO             │
│  ● GO          (verde)  "APTO PARA O TURNO"   │
│  ● ATENÇÃO     (âmbar)  "VIGILÂNCIA"          │
│  ● NO-GO       (vermelho) "FADIGA — NÃO APTO" │
│  (bloco único ~35% da altura, texto 4xl-6xl)  │
├───────────────────────────────────────────────┤
│  NÍVEL 2  — 3 NÚMEROS                         │
│   BioScore      Piscadas/min      Sono        │
│     34            14               5.5 h      │
│   (cor do número = faixa; sem ícones/cards)   │
├───────────────────────────────────────────────┤
│  NÍVEL 3  — 1 AÇÃO                            │
│  [ Iniciar Protocolo 4-7-8 ]   ← NO-GO/ATENÇÃO│
│  [ Iniciar Turno ]             ← GO           │
└───────────────────────────────────────────────┘
 rodapé discreto: "Cenário demonstrativo" (apenas se dados forem demo) · link texto "Atualizar scan"
```

### 3.1 Lógica do semáforo (derivar, não inventar)
- Extrair `getReadinessStatus` para função pura em `src/lib/readiness.ts` retornando `{ state: 'go' | 'caution' | 'nogo', label, headline }`. **Reusar exatamente as regras atuais**: `nogo` se `stress==='high' || hrv<30`; `caution` se `stress==='moderate' || hrv<55`; senão `go`. Não alterar thresholds (AGENTS.md).
- Mapeamento de rótulos: `go`→"GO", `caution`→"ATENÇÃO", `nogo`→"NO-GO". Cores via tokens existentes (`emerald`, `amber`, `destructive`) + **ícone e texto** (não depender só de cor — daltonismo).
- Teste unitário AAA para os 3 estados e bordas (hrv=29, 30, 54, 55).

### 3.2 Nível 2 — 3 números
- BioScore (`effectiveBioScore`), Piscadas/min (`roundBlinkRate(effectiveBlinkRate)` — arredondar **só aqui**), Sono (`telemetry.horasSono`).
- Remover HRV do cockpit (continua alimentando o semáforo e visível em Histórico/Métricas).
- Valor ausente → exibir `—` e legenda "sem dado", **nunca** fallback fabricado (D11). Se algum dado for demonstração, mostrar selo único "DEMO" no rodapé.

### 3.3 Nível 3 — ação única
- `nogo` ou `caution`: botão primário "Iniciar Protocolo 4-7-8" → `onNavigateTab('neurocoach')` e abrir o overlay de respiração direto (ver 3.4).
- `go`: botão primário "Iniciar Turno" → registra início de turno via fluxo existente `checkin` (`onNavigateTab('checkin')`) — sem nova tabela.
- Um único `<Button size="lg">` na tela; tudo mais é link de texto (`variant="link"`).

### 3.4 Alerta preditivo (`PredictiveAlert.tsx`)
- Deixa de ser bloco gigante. Vira **uma linha** sob o semáforo, só quando `state !== 'go'`: "Risco de erro em tarefas de precisão nas próximas 4 h — suspender acoplagem/EVA" + selo "Demonstração".
- Remover: segunda moldura vermelha em `BridgeConsole` (D2), grid de 2 chips, caixa "Ação Recomendada", botão próprio "Iniciar Protocolo de Mitigação" (a ação única do Nível 3 o substitui), `animate-pulse`, "⚠️".
- **Eliminar o valor fixo 34/100**: o texto não cita número; o número vem do Nível 2. Manter o rótulo "Cenário demonstrativo — não é uma previsão clínica validada" (AGENTS.md).
- Remover a renderização em `Dashboard.tsx:145` (aba `checkin`).
- Aceitar prop opcional `bioScore?: number` se for necessário citar valor; nunca hardcode.
- Para o deep-link do protocolo: `NeuroCoach/index.tsx` já tem overlay 4-7-8 (linhas ~382-408). Adicionar prop opcional `autoStartBreathing?: boolean` (default false) sem mudar o comportamento atual.

## 4. Lista de eliminação ("cortar sem dó")

**Remover do DOM/UI (código pode permanecer onde indicado):**
1. Banner vermelho duplicado "Atenção: Fadiga elevada. Risco operacional." + badge "Alerta Ativo" (`BridgeConsole.tsx:197-210`) e o `Card` que envolve o `PredictiveAlert`.
2. Banner de boas-vindas do Bridge Console (h1 + badge "Status Operacional" + parágrafo) (`:147-194`) — o header global já dá o título.
3. Toggle "Uplink da Terra / Modo Autônomo" — mover para o `ConnectionStatusWidget` do header (já existe) ou remover do cockpit.
4. Botão "Avaliação de Turno" no banner (substituído pelo Nível 3).
5. Os 3 cards "Jornada do Astronauta" inteiros (`:212-368`), incluindo "Finalidade:", tooltips e badges "Se estiver bem / Análise Rápida / Novo Scan". Substituir por 1 link texto "Atualizar scan" + a sidebar.
6. Card "Console da Ponte · Status Fisiológico" (`:373-497`): cabeçalho, descrição, badge duplicado, círculo grande de BioScore, "Estimativa de Desempenho", "Nível de Carga", card de HRV, texto "Formatado na fronteira de exibição".
7. Botão "Iniciar Contramedidas (AstroAssist)" com `Sparkles animate-spin-slow` (`:487-495`).
8. Card lateral "Biometric Log" (sono/exercício) e botão "Abrir Biometric Log Completo" (`:500-560`) — o sono vira 1 dos 3 números; exercício vai só para o Histórico.
9. Subtítulos e emojis da sidebar; badges de score na sidebar; descrições de página no header.
10. Emojis: 🤩😊⚡😔😩, 🔋/⚡ do slider, "✨" em `DailyCheckin.tsx` → trocar por escala numérica 1–5 (botões segmentados com rótulo texto) e ícones lucide monocromáticos; remover "✨" e "⚠️" de textos/toasts.
11. Botões de IA duplicados: "✨ Gerar Plano de Ação 24h com IA" (`PostScanActionPlan.tsx:89`) deixa de aparecer no fluxo de scan; plano vira conteúdo da seção Contramedidas. Uma única entrada de IA = AstroAssist, dentro de Contramedidas.
12. `WelcomeBanner` em `neuroscore` para primeira visita — substituir por estado vazio de uma linha no Cockpit ("Sem scan hoje — faça o primeiro BioScore").
13. Rodapé "CrewVitals by Dark Sector · Beta" — manter só "Zero-Trust Privacy" + link "Validação de Pesquisa" (já existe) em tamanho mínimo.

**Corrigir texto:** "Fazer novo Avaliação de Turno" → "Nova avaliação de turno"; padronizar nomenclatura: Cockpit / Contramedidas / Histórico de Voo (PT) e manter "BioScore" como nome de métrica.

**Não deletar (só esconder da navegação):** componentes `Gamification`, `CognitiveFatigueAnalyzer`, `MissionLog`, `DailyCheckin`, `NeuroScore`, e todo o grupo gestor.

## 5. Princípios visuais
- Uma cor de alarme por tela. Vermelho só no semáforo NO-GO e no botão primário de NO-GO.
- Tipografia: semáforo ≥ `text-5xl`, números ≥ `text-4xl`, rótulos `text-xs uppercase`. Mínimo 16px para qualquer texto operacional.
- Contraste WCAG AA; estado nunca só por cor (ícone + texto). `role="status"` + `aria-live="polite"` no semáforo; foco visível no botão primário; alvo de toque ≥ 44px.
- Sem animações decorativas (`animate-pulse`, `animate-spin-slow`). Transição de estado ≤ 150ms; respeitar `prefers-reduced-motion`.
- Densidade: ≤ 3 blocos visíveis acima da dobra em 1366×768, sem scroll no cockpit.

## 6. Roteiro de demo — 30 segundos

| t | Ação | Fala |
|---|------|------|
| 0–5s | App abre direto no Cockpit: semáforo **NO-GO** vermelho, 3 números | "Um olhar: o astronauta está NO-GO por fadiga." |
| 5–10s | Apontar BioScore 34 · Piscadas 14/min · Sono 5.5h | "Três sinais: BioScore facial, piscadas e sono." |
| 10–15s | Apontar a linha preditiva (selo "Demonstração") | "Risco em acoplagem nas próximas 4h — rotulado como cenário, não previsão clínica." |
| 15–22s | Clicar **Iniciar Protocolo 4-7-8** → overlay de respiração inicia | "Uma única ação: contramedida guiada, sem menu." |
| 22–27s | Fechar protocolo → "Atualizar scan" → BioScore sobe, semáforo vira ATENÇÃO/GO | "Reavaliação fecha o ciclo: decidir, agir, verificar." |
| 27–30s | Clicar **Histórico de Voo** (tendência de sono/fadiga) | "Isso é software de missão crítica, não um dashboard genérico." |

Pré-requisito de demo: seed/mock com estado NO-GO e um segundo estado pós-protocolo (flag `?demo=1` ou fixture existente nos testes) — sem alterar dados reais nem schema.

## 7. Plano de execução sugerido (ordem, commits atômicos)
1. `src/lib/readiness.ts` + testes (3 estados + bordas).
2. `PredictiveAlert.tsx` → linha única, sem valor fixo; remover uso em `Dashboard.tsx:145`; atualizar testes.
3. `BridgeConsole.tsx` → cockpit 3 níveis; atualizar `BridgeConsole.test.tsx` (semáforo, 3 números, 1 botão primário, sem fallback fabricado, `roundBlinkRate` só na exibição).
4. `NeuroCoach/index.tsx` → `autoStartBreathing`; ajustar `NeuroCoach.test.tsx`.
5. `AppSidebar.tsx` → 3 seções + grupo gestor recolhido; `SectionTabs`; `Dashboard.tsx` (títulos curtos, redirect pós-scan para `bridge-console`); `Dashboard.test.tsx`.
6. `DailyCheckin.tsx` → remover emojis, escala 1–5, corrigir texto.
7. Limpeza da lista de eliminação restante (WelcomeBanner, PostScanActionPlan, rodapé).
8. Gate final: `tsc --noEmit`, `npm test`, `npm run build`, e verificação visual 1366×768 e 390×844.

## 8. Critérios de aceite
- [ ] Sidebar do astronauta com exatamente 3 itens, sem subtítulos/emojis/badges.
- [ ] Cockpit mostra exatamente: 1 semáforo, 3 números, 1 botão primário (`getAllByRole('button', {name: /iniciar/i})` primário = 1).
- [ ] Nenhuma ocorrência de "34" fixo, "21.6", "7.5h" ou "ARED" como fallback silencioso.
- [ ] "Cenário demonstrativo" visível sempre que o alerta preditivo aparecer.
- [ ] Todas as 7 chaves de aba + gestor ainda funcionam via `setActiveTab`; `git diff` não toca em `src/integrations/supabase/**` nem em migrations.
- [ ] Nenhum emoji em `src/components` de UI do astronauta (`grep -P "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]"` vazio, exceto testes).
- [ ] Cockpit sem scroll em 1366×768; estado legível sem cor (teste de escala de cinza).
- [ ] Juiz entende o app em <15s no vídeo (roteiro da seção 6 cronometrado).
