# Sumário da Fase 42 — Segurança de Missão, Relatórios e Chatbot em EN e PT

## Status
Concluído com sucesso e verificado.

## Escopo Realizado
Internacionalização bilíngue (EN/PT) completa da suíte de Segurança de Missão:
1. `src/i18n/locales/safety.ts`: Namespace `safety.*` com paridade 1:1 rigorosa entre `en` e `pt` (124 chaves em cada idioma).
2. `src/hooks/useNR1ComplianceScore.ts`: Suporte bilíngue nos rótulos de score, categorias e itens de conformidade com compatibilidade retroativa integral (parâmetro opcional `options` e fallback para português fora do provider).
3. `src/components/NR1ComplianceScoreCard.tsx`: Títulos, descrições, status do medidor radial (COMPLIANCE / CONFORMIDADE), contadores e checklist traduzidos.
4. `src/components/NR1Report.tsx`: Internacionalização de telas, botões de exportação, banner de risco, cartões de métricas, recomendações, resumos, referências normativas e geração de conteúdo para exportação (.txt, .csv e PDF).
5. `src/components/PGRReportGenerator.tsx`: Interface, mensagens de loading, toasts, cartões de inventário de riscos, plano de ação, cronograma, monitoramento e gerador de documento técnico em HTML para impressão/PDF.
6. `src/components/NarrativeReportGenerator.tsx`: Formulário de parâmetros, labels, placeholders, períodos (Última Semana/Last Week, etc.), botões e exportação markdown (.md).
7. `src/components/NR1ComplianceChatbot.tsx`: Mensagem inicial de boas-vindas bilíngue, sugestões rápidas, placeholders, botões e disclaimer de ferramenta de suporte.

## Escolhas Terminológicas (Normativo e Operacional)
- **Primeira ocorrência descritiva em EN:**
  - `NR-1 (Brazilian workplace safety regulation)`
  - `PGR (Brazilian Workplace Risk Management Program)`
  - `MTE Ordinance 1,419/2024 (psychosocial risks in PGR)`
  - `MTP Ordinance 4,219/2022 (Occupational Risk Management)`
  - `Law 14,457/2022 (Emprega + Mulheres Program - mental health)`
  - `Zero-Trust Privacy (LGPD Law 13,709/2018)`
  - `Art. 157 (Brazilian Labor Code)`
- **Ocorrências subsequentes:** mantida a sigla (`NR-1`, `PGR`).
- **Glossário de Apoio:**
  - Segurança de Missão → Mission Safety
  - Chatbot Segurança de Missão → Mission Safety Chatbot
  - Relatórios IA → AI Reports
  - Tripulante → Crew member
  - Gestor / Comandante → Manager / Commander
  - Conforme / Parcial / Não conforme → Compliant / Partial / Non-compliant

## Ressalvas e Limites de Escopo (O que ficou fora)
1. **Respostas de IA em Nuvem em Runtime:**
   - Mensagens geradas pelas Edge Functions (`ai-insights`, `narrative-report`, `nr1-chatbot`) permanecem no idioma gerado pelo backend.
   - Fallbacks locais do modo autônomo (`isAutonomous`) foram traduzidos condicionalmente conforme `lang === 'pt'`.
2. **Não Alegação de Conformidade Jurídica Definitiva:**
   - Foi explicitamente inserida e mantida a ressalva de ferramenta de suporte à decisão técnica e operacional (DSS):
     `"Ferramenta de suporte à decisão técnica e operacional, não substituindo a homologação por profissional habilitado de SST."` / `"Technical and operational decision-support tool; does not replace sign-off by a qualified occupational safety and health professional."`
   - Preservados os textos originais em português sem criar alegações clínicas ou jurídicas novas.

## Chamadores Auditados (`git grep`)
- `useNR1ComplianceScore`: `src/components/NR1ComplianceScoreCard.tsx`
- `NR1Report`: `src/components/DashboardContent.tsx`
- `PGRReportGenerator`: `src/components/NR1Report.tsx`
- `NarrativeReportGenerator`: `src/components/DashboardContent.tsx`
- `NR1ComplianceChatbot`: `src/components/DashboardContent.tsx`
- `NR1ComplianceScoreCard`: `src/components/NR1Report.tsx`

## Saídas Reais de Verificação

### 1. Paridade i18n
```bash
npx vitest run src/i18n/i18n.test.ts
# ✓ src/i18n/i18n.test.ts (16 tests)
# Test Files  1 passed (1)
# Tests  16 passed (16)
```

### 2. ESLint nos arquivos exclusivos
```bash
npx eslint src/components/NR1Report.tsx src/components/PGRReportGenerator.tsx src/components/NarrativeReportGenerator.tsx src/components/NR1ComplianceChatbot.tsx src/components/NR1ComplianceScoreCard.tsx src/hooks/useNR1ComplianceScore.ts src/i18n/locales/safety.ts
# Exit code 0 (0 erros, 0 avisos)
```

### 3. TypeScript
```bash
npx tsc --noEmit
# Exit code 0 (0 erros de tipagem)
```

### 4. Build de Produção
```bash
npm run build
# ✓ built in 14.50s (0 erros)
```

### 5. Diff dos Arquivos Blindados
```bash
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
# Saída vazia (0 arquivos alterados)
```
