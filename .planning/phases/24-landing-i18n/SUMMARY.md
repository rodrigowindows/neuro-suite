# Fase 24 — Landing Page EN/PT (CrewVitals)

## Status: Concluída com sucesso

### Arquivos Modificados / Criados
- `src/i18n/locales/landing.ts`: catálogo bilíngue EN/PT com 48 chaves (`landing.*`), paridade total 1:1.
- `src/pages/Index.tsx`: landing internacionalizada via `useI18n()`, integração do `<LanguageToggle />` no cabeçalho nav e link principal direcionado para `/demo`.
- `src/pages/Index.test.tsx`: testes atualizados com cenários em PT e EN, validação de transição dinâmica via `LanguageToggle`, ausência de emojis e de alegações proibidas.

### Termos Novos (não listados diretamente no GLOSSARY.md)
| PT | EN | Justificativa |
|---|---|---|
| Recursos | Features | Navegação concisa |
| Sistemas | Systems | Navegação de bordo |
| Contexto | Context | Navegação de bordo |
| Acessar Painel do Astronauta | Access Astronaut Dashboard | Chamada de ação operacional |
| Missões de Longa Duração — NASA | Long-Duration Missions — NASA | Contextualização de missão |
| Monitoramento de Saúde Contínuo em Missões Espaciais | Continuous Health Monitoring in Space Missions | Título hero descritivo |
| Iniciar Missão | Start Mission | Ação primária |
| Ver Recursos | View Features | Ação secundária |
| Modo Autônomo | Autonomous Mode | Telemetria simulada |
| Isolamento de dados por usuário | User data isolation | Descritivo de segurança RLS |
| Simulado nesta versão | Simulated in this version | Alinhamento com regra de simulação |
| Estimativas, não diagnóstico | Estimates, not diagnosis | Alinhamento com termo DSS |
| Apoio à decisão | Decision support | Alinhamento com DSS |
| Análise de Fadiga | Fatigue Analysis | Card de recurso |
| AstroAssist Espacial | Space AstroAssist | Card de recurso |
| Disciplina de Missão | Mission Discipline | Card de recurso / módulo |
| Painel de Comando | Command Deck | Visão consolidada |
| Sistemas Integrados de Bordo | Integrated Onboard Systems | Seção de módulos |
| Avaliação de Prontidão | Readiness Assessment | Módulo de prontidão operacional |
| Registro de Sono | Sleep Log | Módulo de sono |
| Log de Exercícios | Exercise Log | Módulo de atividade física |
| IA Insights | AI Insights | Módulo analítico |
| Alertas Proativos | Proactive Alerts | Módulo de notificação de fadiga |
| Apoio ao Comando | Command Support | Módulo decisório |
| Explorar Todos os Sistemas | Explore All Systems | Ação de sistemas |
| Contexto da missão | Mission Context | Seção factual |
| Latência de comunicação com a Terra | Communication latency with Earth | Fato da missão espacial |
| Isolamento e confinamento | Isolation and confinement | Fato da missão espacial |
| Microgravidade | Microgravity | Fato da missão espacial |
| Pronto para a Decolagem? | Ready for Liftoff? | Chamada final |
| Como Funciona em 3 Passos | How It Works in 3 Steps | Passo a passo operacional |
| Análise Facial | Facial Analysis | Passo 01 |
| IA Processa Localmente | AI Processes Locally | Passo 02 |
| Ação Imediata | Immediate Action | Passo 03 |
| Contato | Contact | Rodapé |

---

### Resultados das Validações

#### 1. ESLint
```bash
npx eslint src/pages/Index.tsx src/pages/Index.test.tsx src/i18n/locales/landing.ts
```
Saída: 0 erros, 0 avisos (código de saída 0).

#### 2. Vitest
```bash
npm test -- --run
```
Saída real:
```text
Test Files  52 passed (52)
     Tests  599 passed (599)
  Duration  53.16s
```
- Paridade de chaves validada em `src/i18n/i18n.test.ts`.
- 12 testes passando em `src/pages/Index.test.tsx` (incluindo renderização EN/PT, switch de idioma, links para `/demo`, ausência de emojis e ausência de alegações proibidas).

#### 3. TypeScript
```bash
npx tsc --noEmit
```
Saída: 0 erros (código de saída 0).

#### 4. Build de Produção
```bash
npm run build
```
Saída:
```text
✓ 3118 modules transformed.
✓ built in 19.08s
```

#### 5. Arquivos Blindados
```bash
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```
Saída: Vazio (0 alterações).
