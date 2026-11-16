# Fase 42 — Segurança de Missão, Relatórios e Chatbot em EN e PT

## Objetivo
Internacionalizar a área de Segurança de Missão (relatórios NR-1, gerador de relatório técnico PGR, relatórios narrativos executivos, chatbot de conformidade NR-1 e scorecard de conformidade) para suporte bilíngue (EN/PT) com paridade estrita com o `GLOSSARY.md` e `GLOSSARY-APP.md`, preservando 100% o comportamento padrão em português sem provider e sem alterar dados gravados, endpoints nem regras de cálculo de score.

## Arquivos Exclusivos
- `src/i18n/locales/safety.ts`
- `src/hooks/useNR1ComplianceScore.ts`
- `src/components/NR1ComplianceScoreCard.tsx`
- `src/components/NR1Report.tsx`
- `src/components/PGRReportGenerator.tsx`
- `src/components/NarrativeReportGenerator.tsx`
- `src/components/NR1ComplianceChatbot.tsx`

## Regras Específicas
1. **Termos normativos em EN descritivos:**
   - Na primeira ocorrência em EN: `"NR-1 (Brazilian workplace safety regulation)"`, `"PGR (Risk Management Program under Brazilian NR-1)"`, `"MTE Ordinance 1,419/2024 (psychosocial risks in PGR)"`, `"MTP Ordinance 4,219/2022 (Occupational Risk Management)"`, `"Law 14,457/2022 (mental health in the workplace)"`, `"Zero-Trust Privacy (Brazilian General Data Protection Law - LGPD, Law 13,709/2018)"`.
2. **Relatórios gerados na tela:**
   - Textos montados em tela, exportações TXT, CSV, HTML de impressão e PDF adaptam-se ao idioma ativo (`lang === 'pt' ? 'pt-BR' : 'en-US'`).
   - Respostas de IA em nuvem em runtime (Edge Functions `ai-insights`, `narrative-report`, `nr1-chatbot`) permanecem como vierem do backend.
3. **Ressalva de suporte à decisão (sem alegação de conformidade legal definitiva):**
   - Manter explícito o caráter de ferramenta de suporte técnico e operacional à decisão (DSS), sem certificar nem homologar conformidade jurídica definitiva.
4. **Paridade estrita de chaves:**
   - Todas as chaves no namespace `safety.` em `src/i18n/locales/safety.ts`, validadas pelo teste `src/i18n/i18n.test.ts`.

## Plano de Execução
1. Criar `src/i18n/locales/safety.ts` com todas as chaves em `en` e `pt`.
2. Adaptar `src/hooks/useNR1ComplianceScore.ts` para internacionalização dos rótulos e itens de conformidade preservando compatibilidade de API e fallback em PT.
3. Adaptar `src/components/NR1ComplianceScoreCard.tsx` para consumir o dicionário `safety.*`.
4. Adaptar `src/components/NR1Report.tsx` para suporte bilíngue na interface, exports (.txt, .csv, PDF) e recomendações.
5. Adaptar `src/components/PGRReportGenerator.tsx` para suporte bilíngue na interface, export HTML de impressão e dados mock locais autônomos.
6. Adaptar `src/components/NarrativeReportGenerator.tsx` para formulário, botões, opções de período e exportação markdown.
7. Adaptar `src/components/NR1ComplianceChatbot.tsx` para mensagem de boas-vindas, sugestões, placeholders, botões e avisos de suporte.
8. Executar bateria de verificação (i18n test, tsc, eslint, build e diff).
9. Criar `SUMMARY.md` e realizar o commit atômico dos 7 arquivos exclusivos.
