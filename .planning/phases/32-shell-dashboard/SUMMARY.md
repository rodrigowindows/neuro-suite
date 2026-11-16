# Sumário de Entrega - Fase 32: Casca do App Logado (v1.4)

## Escopo Realizado
Implementação do `LangProvider` unificado em nível de raiz em `src/App.tsx` (posicionado acima de `AuthProvider`), internacionalização completa dos títulos de abas e seções via `PAGE_TITLE_KEYS`, inclusão do seletor `<LanguageToggle />` acessível no cabeçalho do `Dashboard.tsx` com `flex-wrap` e alvo de toque >= 44px, tradução dos estados vazios e fallbacks de carregamento em `DashboardContent.tsx` e `DashboardSkeleton.tsx`, internacionalização do `WelcomeBanner.tsx` e internacionalização integral do `ResearchValidationModal.tsx` com dicionário `src/i18n/locales/dashboard.ts`.

## Arquivos Exclusivos Modificados
- `src/App.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Dashboard.test.tsx`
- `src/components/DashboardContent.tsx`
- `src/components/DashboardSkeleton.tsx`
- `src/components/ResearchValidationModal.tsx`
- `src/components/WelcomeBanner.tsx`
- `src/i18n/locales/dashboard.ts` (novo dicionário com namespace `dashboard.*`)

## Termos Novos no Dicionário (`src/i18n/locales/dashboard.ts`)
| Chave | PT | EN |
|---|---|---|
| `dashboard.title.cockpit` | Cockpit | Cockpit |
| `dashboard.title.readinessAssessment` | Avaliação de Prontidão | Readiness Assessment |
| `dashboard.title.bioScore` | BioScore | BioScore |
| `dashboard.title.discipline` | Disciplina | Discipline |
| `dashboard.title.countermeasures` | Contramedidas | Countermeasures |
| `dashboard.title.leadership` | Liderança | Leadership |
| `dashboard.title.workloadMetrics` | Métricas de Carga | Workload Metrics |
| `dashboard.title.breaks` | Pausas | Breaks |
| `dashboard.title.flightLog` | Histórico de Voo | Flight Log |
| `dashboard.title.aiInsights` | IA Insights | AI Insights |
| `dashboard.title.commandAlerts` | Alertas Comando | Command Alerts |
| `dashboard.title.roi` | ROI | ROI |
| `dashboard.title.safety` | Segurança | Safety |
| `dashboard.title.aiReports` | Relatórios IA | AI Reports |
| `dashboard.title.safetyChatbot` | Chatbot Segurança | Safety Chatbot |
| `dashboard.title.integrations` | Integrações | Integrations |
| `dashboard.title.commandPanel` | Painel de Comando | Command Panel |
| `dashboard.loading` | Carregando... | Loading... |
| `dashboard.footer.privacy` | Zero-Trust Privacy | Zero-Trust Privacy |
| `dashboard.footer.researchValidation` | Validação de Pesquisa | Research Validation |
| `dashboard.content.completeBioScoreFirst` | Complete o BioScore primeiro | Complete BioScore first |
| `dashboard.content.scanToUnlockGamification` | Faça um scan para desbloquear a gamificação | Take a scan to unlock gamification |
| `dashboard.welcome.greetingNamed` | Olá, {name}! | Hello, {name}! |
| `dashboard.welcome.greetingGeneric` | Bem-vindo ao CrewVitals! | Welcome to CrewVitals! |
| `dashboard.welcome.dismiss` | Fechar | Close |
| `dashboard.welcome.descriptionBefore` | Comece fazendo seu primeiro | Start by taking your first |
| `dashboard.welcome.descriptionAfter` | — um scan facial rápido... | — a fast facial scan... |
| `dashboard.researchModal.defaultTrigger` | Research & Validation (NASA / Harvard) | Research & Validation (NASA / Harvard) |
| `dashboard.researchModal.ariaLabel` | Base Científica — Research & Validation (NASA / Harvard) | Scientific Basis — Research & Validation (NASA / Harvard) |
| `dashboard.researchModal.title` | Base Científica e Evidências Operacionais (Research & Validation) | Scientific Basis and Operational Evidence (Research & Validation) |
| `dashboard.researchModal.description` | Fundamentos técnicos, evidências científicas... | Technical foundations, scientific evidence... |
| `dashboard.researchModal.item1Title` | NASA Human Research Program... | NASA Human Research Program... |
| `dashboard.researchModal.item1Text` | O elemento Behavioral Health & Performance... | The Behavioral Health & Performance... |
| `dashboard.researchModal.item2Title` | Blink Rate as a Physiological Measure... | Blink Rate as a Physiological Measure... |
| `dashboard.researchModal.item2Text` | Publicações técnicas da NASA... | NASA technical publications... |
| `dashboard.researchModal.item3Title` | Protocolo Parassimpático 4-7-8... | Parasympathetic 4-7-8 Protocol... |
| `dashboard.researchModal.item3Text` | Baseado na ativação do nervo vago... | Based on vagus nerve activation... |
| `dashboard.researchModal.riskCoverageTitle` | Cobertura dos Riscos de Missão | Mission Risk Coverage |
| `dashboard.researchModal.riskTableAriaLabel` | Tabela de Cobertura dos Riscos de Missão | Mission Risk Coverage Table |
| `dashboard.researchModal.colIndicator` | Indicador | Indicator |
| `dashboard.researchModal.colClassification` | Classificação | Classification |
| `dashboard.researchModal.colSource` | Fonte | Source |
| `dashboard.researchModal.class.measured` | Medido | Measured |
| `dashboard.researchModal.class.partial` | Parcial | Partial |
| `dashboard.researchModal.class.selfReported` | Autorrelatado | Self-reported |
| `dashboard.researchModal.class.notCovered` | Não coberto | Not covered |
| `dashboard.researchModal.risk.1.indicator` | Fadiga cognitiva e sono | Cognitive fatigue and sleep |
| `dashboard.researchModal.risk.1.source` | piscadas/min estimadas por webcam... | webcam-estimated blinks/min... |
| `dashboard.researchModal.risk.2.indicator` | Cardiovascular | Cardiovascular |
| `dashboard.researchModal.risk.2.source` | HRV estimada por webcam... | webcam-estimated HRV... |
| `dashboard.researchModal.risk.3.indicator` | Saúde mental, isolamento e confinamento | Mental health, isolation, and confinement |
| `dashboard.researchModal.risk.3.source` | avaliação de prontidão... | readiness assessment... |
| `dashboard.researchModal.risk.4.indicator` | Perda óssea e muscular | Bone and muscle loss |
| `dashboard.researchModal.risk.4.source` | exercício autorrelatado... | self-reported exercise... |
| `dashboard.researchModal.risk.5.indicator` | Radiação espacial | Space radiation |
| `dashboard.researchModal.risk.5.source` | sem dosímetro... | no dosimeter... |
| `dashboard.researchModal.risk.6.indicator` | Imunológico | Immunological |
| `dashboard.researchModal.risk.6.source` | sintomas | symptoms |
| `dashboard.researchModal.dssDisclaimer` | Apoio à decisão do tripulante... | Crew decision support... |
| `dashboard.researchModal.bioScoreCompTitle` | Composição do BioScore | BioScore Composition |
| `dashboard.researchModal.bioScoreCompText` | O BioScore (0-100) soma estresse... | BioScore (0-100) sums stress... |
| `dashboard.researchModal.ethicalTitle` | Aviso Ético & Operacional: | Ethical & Operational Notice: |
| `dashboard.researchModal.ethicalText` | O CrewVitals atua como Sistema de Suporte... | CrewVitals operates as an operational Decision... |

## O que Ficou Fora
- Rótulos gravados em banco/localStorage por `appendEvent` em `Dashboard.tsx` (`BioScore: ${scanVerdict}${scoreStr}`) mantidos 100% inalterados por serem dados persistidos.
- Textos dos componentes filhos especializados (`BridgeConsole`, `NeuroCoach`, `MissionLog`, `AppSidebar`, etc.) são de escopo exclusivo das fases 33 a 44.

## Saídas Reais das Verificações

### 1. Varredura de Caracteres Acentuados nos Componentes (excluindo testes e locale)
```bash
$ git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]" -- src/App.tsx src/pages/Dashboard.tsx src/components/DashboardContent.tsx src/components/DashboardSkeleton.tsx src/components/ResearchValidationModal.tsx src/components/WelcomeBanner.tsx
# Retorno vazio (código de saída 1 = 0 ocorrências)
```

### 2. ESLint
```bash
$ npx eslint src/App.tsx src/pages/Dashboard.tsx src/pages/Dashboard.test.tsx src/components/DashboardContent.tsx src/components/DashboardSkeleton.tsx src/components/ResearchValidationModal.tsx src/components/WelcomeBanner.tsx src/i18n/locales/dashboard.ts
# Retorno limpo (código de saída 0, 0 erros, 0 warnings)
```

### 3. Testes Unitários
```bash
$ npm test -- --run
Test Files  52 passed (52)
Tests       679 passed (679)
Duration    67.22s
```

### 4. Checagem de Tipagem TypeScript
```bash
$ npx tsc --noEmit
# Retorno limpo (código de saída 0, 0 erros)
```

### 5. Build de Produção
```bash
$ npm run build
✓ 3131 modules transformed.
dist/index.html                                       2.18 kB │ gzip:   0.82 kB
dist/assets/index-DDoDmT39.css                      100.45 kB │ gzip:  16.96 kB
...
✓ built in 15.65s
```

### 6. Diff dos Arquivos Blindados
```bash
$ git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
# Retorno vazio (zero alterações nos arquivos blindados)
```
