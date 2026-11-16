# Fase 40 — IA Insights, Alertas Comando e ROI em EN e PT (CrewVitals)

## Contexto
No v1.4, as telas de gestão (IA Insights, Alertas Comando e Calculadora de ROI) passam a oferecer suporte completo a inglês e português, integrando com o núcleo `useI18n()` da Fase 21 e preservando o fallback em português quando fora de provider ou sem idioma selecionado.

## Escopo de Arquivos Exclusivos
- `src/i18n/locales/insights.ts` (novo dicionário com namespace `insights.*`)
- `src/components/AIInsightsDashboard.tsx`
- `src/components/HRAlerts.tsx`
- `src/components/ROIDashboard.tsx`
- `src/services/alertGenerator.ts`
- `src/services/alertGenerator.test.ts`
- `src/services/roiCalculator.ts`
- `src/services/roiCalculator.test.ts`

## Objetivos de Implementação
1. **Dicionário `insights.ts`**:
   - Chaves com prefixo `insights.*` cobrindo todos os textos de interface das 3 telas (títulos, subtítulos, botões, estados vazios, labels, badges, status e toasts).
   - Paridade 100% entre `en` e `pt`. O português permanece idêntico ao original. O inglês segue os glossários v1.3 e v1.4 (`GLOSSARY-APP.md`).
2. **`alertGenerator.ts`**:
   - Manter padrão PT e adicionar parâmetro opcional `lang: 'en' | 'pt' = 'pt'`.
   - Gerar títulos e descrições dos alertas em inglês quando `lang === 'en'`, sem alterar tipos, severidades, IDs nem lógica.
   - Atualizar `alertGenerator.test.ts` com testes cobrindo geração em EN e PT.
3. **`ROIDashboard.tsx` e `roiCalculator.ts`**:
   - Atualizar `formatCurrency(value, lang = 'pt')` para formatar números de acordo com a localidade (`pt-BR` ou `en-US`), mantendo a moeda em BRL (R$).
   - Atualizar `ROIDashboard.tsx` para passar `lang` para `formatCurrency` e formatar números/porcentagens por idioma.
   - Atualizar `roiCalculator.test.ts` para testar `formatCurrency` com `lang = 'en'`.
4. **`HRAlerts.tsx` e `AIInsightsDashboard.tsx`**:
   - Migrar todos os textos de interface para `t('insights.*')`.
   - Passar `lang` para `generateAlerts` no `HRAlerts`.
   - Textos de IA gerados em tempo real (incluindo fallbacks locais em modo autônomo) e payloads para edge function permanecem inalterados.
5. **Verificações e Testes**:
   - `git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]"` nos componentes.
   - `npx eslint` nos arquivos exclusivos.
   - `npm test -- --run` (verificando testes existentes, testes novos e paridade i18n).
   - `npx tsc --noEmit`.
   - `npm run build`.
   - `git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts`.
6. **Entrega**:
   - `SUMMARY.md` com saídas reais.
   - Commit atômico exclusivo dos 8 arquivos.
