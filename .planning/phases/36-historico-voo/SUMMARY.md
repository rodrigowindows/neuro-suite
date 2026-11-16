# Resumo da Fase 36 — Histórico de Voo (MissionLog) em EN e PT (Marco v1.4 CrewVitals)

## Objetivo Concluído
A tela de Histórico de Voo (`MissionLog.tsx`) foi traduzida para Inglês e Português sob o namespace exclusivo `missionlog` (`src/i18n/locales/missionlog.ts`), preservando a compatibilidade total com os testes legados, a persistência inalterada em `localStorage` e a paridade de chaves no i18n core.

## Arquivos Exclusivos Afetados
- `src/i18n/locales/missionlog.ts` (novo dicionário com paridade exata EN/PT)
- `src/components/MissionLog.tsx` (integração i18n, formatação localizada de datas/horas, mapeamento do veredito do cockpit e timeline de eventos com derivação em EN)
- `src/components/MissionLog.test.tsx` (36 testes aprovados, incluindo suíte bilíngue sob `LangProvider` e testes de formatação)

## O que foi implementado
1. **Dicionário `missionlog`**: 61 chaves idênticas em EN e PT com prefixo `missionlog.`.
2. **Preservação de Dados Persistidos**: `src/lib/missionEvents.ts` permaneceu intocado. Ao gravar eventos locais via `appendEvent`, os textos são gravados em português como dados persistidos estáveis.
3. **Derivação Dinâmica de Eventos na Timeline em EN**:
   - `scan`: derivado de `metadata.score` (BioScore) e `metadata.hrv`, ou veredito mapeado, ou alertas pré-definidos (`predictiveAlert`).
   - `protocol`: derivado de contramedidas e ciclos de respiração (`countermeasureAction`, `countermeasureLocal`, etc.).
   - `assessment`: derivado de turno operacional ou `metadata.verdict`.
   - `perceived_fatigue`: derivado de `metadata.fadiga` (nível 1-5 traduzido) ou `metadata.horasSono`.
   - `symptoms_logged`: lista de sintomas traduzida dinamicamente via `SYMPTOM_KEY_MAP`.
   - Fallback: para qualquer tipo desconhecido ou ausência de metadados, utiliza o `label` original gravado. Em PT, preserva 100% o `label` persistido.
4. **Formatação Localizada de Datas e Horas**: Função pura `formatLocalizedEventDate` que gera:
   - PT: `Hoje, HH:mm`, `Ontem, HH:mm`, `DD/MM, HH:mm`
   - EN: `Today, HH:mm`, `Yesterday, HH:mm`, `MM/DD, HH:mm`
5. **Mapeamento do `cockpitVerdict`**: Mapeamento para exibição em inglês sem mutação do prop original recebido do Dashboard (`ATENÇÃO` -> `CAUTION - WATCH` / `CAUTION`, `GO` -> `GO - FIT FOR SHIFT` / `GO`, `NO-GO` -> `NO-GO - FATIGUE (NOT FIT)` / `NO-GO`, `AGUARDANDO SCAN` -> `AWAITING SCAN`, `SEM DADOS` -> `NO DATA`).
6. **Linha de Base Pessoal**: Formatação de delta localizada (`−22% vs. sua linha de base` em PT / `−22% vs. your baseline` em EN).
7. **Downlink**: Rótulos e estados bilíngues respeitando os modos online e autônomo.
8. **Apoio à Decisão e Sintomas**: Chips traduzidos na UI com preservação estrita do enum no estado interno para compatibilidade com o schema e o avaliador clínico.

## Termos Novos no Glossário
| PT | EN |
|---|---|
| Linha do Tempo da Missão | Mission Event Timeline |
| Veredito do Cockpit | Cockpit Verdict |
| Exercício Realizado Hoje | Exercise Completed Today |
| Nível de Fadiga Percebida (1-5) | Perceived Fatigue Level (1-5) |
| Salvar Registro | Save Entry |
| Linha de base em construção | Baseline under construction |
| vs. sua linha de base | vs. your baseline |
| Último Registro Salvo | Last Saved Entry |
| Nenhum registro ainda | No entries yet |
| Pacote de Downlink | Downlink Package |
| Gerar Pacote de Downlink | Generate Downlink Package |
| Pacote gerado | Package generated |
| Pacote salvo localmente | Package saved locally |
| Nenhum evento registrado ainda | No events recorded yet |
| Nenhum evento para o filtro selecionado | No events for the selected filter |

## O que ficou fora
- Textos de relatórios gerados por IA em backend/edge functions.
- Dados brutos gravados em banco Supabase e histórico prévio de localStorage (mantidos em português para compatibilidade e integridade).

## Saídas Reais de Verificação

### 1. Verificação de Caracteres Específicos em Português
```bash
git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]" -- src/components/MissionLog.tsx
```
Saída:
```
src/components/MissionLog.tsx:98:  cockpitVerdict?: 'GO' | 'NO-GO' | 'ATENÇÃO' | 'SEM DADOS' | string;
src/components/MissionLog.tsx:107:  'dor de cabeça': 'missionlog.symptom.headache',
src/components/MissionLog.tsx:108:  'náusea': 'missionlog.symptom.nausea',
src/components/MissionLog.tsx:110:  'dor musculoesquelética': 'missionlog.symptom.musculoskeletal',
src/components/MissionLog.tsx:128:    clean === 'ATENÇÃO' ||
src/components/MissionLog.tsx:130:    clean.startsWith('ATENÇÃO -') ||
src/components/MissionLog.tsx:216:      if (event.label?.includes('Status atualizado: Estável')) {
src/components/MissionLog.tsx:222:      if (event.label?.includes('3 ciclos de respiração 4-7-8')) {
src/components/MissionLog.tsx:225:      if (event.label?.includes('Respiração 4-7-8') || event.label?.includes('4-7-8')) {
```
*Apenas tipos e strings de dados persistidos/enum documentados.*

### 2. ESLint
```bash
npx eslint src/components/MissionLog.tsx src/components/MissionLog.test.tsx src/i18n/locales/missionlog.ts
```
Saída:
```
C:\Projetos\neuro-suite\src\components\MissionLog.tsx
  366:6  warning  React Hook useEffect has a missing dependency: 'user'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  398:6  warning  React Hook useEffect has a missing dependency: 'user'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

✖ 2 problems (0 errors, 2 warnings)
```
*Zero erros.*

### 3. Testes Unitários e Paridade
```bash
npm test -- src/components/MissionLog.test.tsx src/i18n/i18n.test.ts --run
```
Saída:
```
 ✓ src/components/MissionLog.test.tsx (36 tests)
 ✓ src/i18n/i18n.test.ts (16 tests)
Test Files  2 passed (2)
Tests  52 passed (52)
```

### 4. TypeScript (`tsc`)
```bash
npx tsc --noEmit
```
Saída:
*(saída vazia, exit code 0)*

### 5. Build de Produção
```bash
npm run build
```
Saída:
```
✓ 3131 modules transformed.
dist/assets/MissionLog-EZgSwgHM.js                   34.66 kB │ gzip:  10.26 kB
✓ built in 15.75s
```

### 6. Arquivos Blindados
```bash
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```
Saída:
*(saída vazia, zero arquivos alterados)*
