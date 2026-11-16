# Sumário da Fase 33 — Navegação Lateral e Abas de Seção em EN e PT

## Status: Concluída com Sucesso

## 1. Arquivos Exclusivos Entregues
- `src/components/AppSidebar.tsx`
- `src/components/SectionTabs.tsx`
- `src/hooks/useFeatureScores.tsx`
- `src/hooks/useFeatureScores.test.ts`
- `src/i18n/locales/nav.ts`

## 2. O que foi Implementado
1. **Dicionário de Navegação (`src/i18n/locales/nav.ts`)**:
   - Namespace `nav.*` com 27 chaves em cada idioma (`en` e `pt`), paridade 1:1 rigorosa validada por `src/i18n/i18n.test.ts`.
   - Termos da sidebar: Cockpit, Contramedidas (Countermeasures), Histórico de Voo (Flight Log), IA Insights (AI Insights), Alertas Comando (Command Alerts), ROI (ROI), Segurança de Missão (Mission Safety), Relatórios IA (AI Reports), Chatbot Segurança de Missão (Mission Safety Chatbot), Integrações (Integrations), Painel de Comando (Command Panel).
   - Grupos: Sistemas de Cabine (Cabin Systems), Cabine (Cabin), Comando (Command).
   - Rodapé: Meu Perfil (Profile), Admin (Admin), Sair (Sign out).
   - Abas (`SectionTabs`): Painel (Panel), Avaliação de Prontidão (Readiness Assessment), AstroAssist (AstroAssist), Disciplina (Discipline), Métricas de Carga (Workload Metrics).
   - Rótulos de acessibilidade: `nav.aria.sidebar`, `nav.aria.logo`, `nav.aria.cockpitTabs`, `nav.aria.countermeasureTabs`, `nav.aria.commandToggle`.
   - Rótulos de FeatureScores: `nav.score.low` (Baixo / Low), `nav.score.moderate` (Moderado / Moderate), `nav.score.high` (Alto / High), `nav.score.alert` (Alerta / Alert), `nav.score.caution` (Atenção / Caution), `nav.score.ok` (OK / OK).

2. **Barra Lateral (`src/components/AppSidebar.tsx`)**:
   - Chaves internas (`value`) mantidas estritamente inalteradas (`bridge-console`, `neurocoach`, `mission-log`, `ai-insights`, `alerts`, `roi`, `nr1`, `narrative-reports`, `nr1-chatbot`, `integrations`, `dashboard-rh`).
   - Títulos dinamicamente traduzidos via `t(item.titleKey)`.
   - Grupos colapsáveis e botões de rodapé com tradução e `aria-label`s acessíveis.

3. **Abas de Seção (`src/components/SectionTabs.tsx`)**:
   - Gatilhos de abas traduzidos preservando 100% os `value`s originais (`bridge-console`, `checkin`, `neurocoach`, `gamification`, `cognitive-fatigue`).
   - Adicionados atributos `aria-label` nos componentes `Tabs` e `TabsList`.

4. **Hook e Cálculo de Scores (`src/hooks/useFeatureScores.tsx`)**:
   - Suporte a `t` opcional em `computeNeuroscoreLabel` e `computeInsightsFromScans`, mantendo fallback padrão para português via `translate('pt', ...)`.
   - Chamadores de `useFeatureScores`: `src/pages/Dashboard.tsx`, mantendo compatibilidade retroativa total.

5. **Testes Automatizados (`src/hooks/useFeatureScores.test.ts`)**:
   - 27 testes aprovados cobrindo:
     - 21 testes legados de cálculo em português sem quebra.
     - Suporte a `t` com traduções em inglês para `computeNeuroscoreLabel` e `computeInsightsFromScans`.
     - Renderização de `AppSidebar` sob `LangProvider initialLang="pt"` e `initialLang="en"`, garantindo ausência de português no inglês.
     - Renderização de `SectionTabs` sob `LangProvider initialLang="pt"` e `initialLang="en"`, verificando preservação dos valores internos das abas.

## 3. O que Ficou Fora de Escopo
- Toast de logout (gerenciado por `useAuth.tsx` em outra fase).
- Endpoints do Supabase e tabelas de banco (`stress_scans`, `user_progress`, `coach_conversations`).
- Chaves internas de navegação (`bridge-console`, `neurocoach`, etc.), preservadas de acordo com as regras de arquitetura.

## 4. Evidências Reais de Verificação

### 4.1 Busca de Caracteres Acentuados nos Componentes e Hooks
```bash
$ git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]" -- src/components/AppSidebar.tsx src/components/SectionTabs.tsx src/hooks/useFeatureScores.tsx
# Saída vazia (código de saída 1) - 0 ocorrências de texto acentuado nos arquivos de implementação.
```

### 4.2 ESLint
```bash
$ npx eslint src/components/AppSidebar.tsx src/components/SectionTabs.tsx src/hooks/useFeatureScores.tsx src/hooks/useFeatureScores.test.ts src/i18n/locales/nav.ts
# Saída vazia (código de saída 0) - 0 erros, 0 warnings.
```

### 4.3 Testes Vitest (Fase 33 e Paridade i18n)
```bash
$ npx vitest run src/hooks/useFeatureScores.test.ts src/i18n/i18n.test.ts
 RUN  v4.1.12 C:/Projetos/neuro-suite

 ✓ src/i18n/i18n.test.ts (16 tests) 78ms
 ✓ src/hooks/useFeatureScores.test.ts (27 tests) 531ms

 Test Files  2 passed (2)
      Tests  43 passed (43)
```

### 4.4 TypeScript (`tsc --noEmit`)
```bash
$ npx tsc --noEmit
# Saída vazia (código de saída 0).
```

### 4.5 Build de Produção Vite
```bash
$ npm run build
✓ 3131 modules transformed.
rendering chunks...
✓ built in 18.70s
```

### 4.6 Diff dos Arquivos Blindados
```bash
$ git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
# Saída vazia (código de saída 0).
```

### 4.7 Observação de Integração entre Fases Paralelas
O teste `Dashboard.test.tsx` (desenvolvido na fase 32 em paralelo) buscou o botão de sidebar `^Contramedidas$` sob `initialLang="en"`, pois a sidebar ainda não estava traduzida na fase 32. Com a tradução da sidebar na fase 33 para `Countermeasures`, o teste da fase 32 requer atualização para buscar o botão em inglês ou aceitar ambos, o que será consolidado na fase 45 (Auditoria v1.4), sem alteração de escopo nesta fase conforme regra de blindagem entre fases.
