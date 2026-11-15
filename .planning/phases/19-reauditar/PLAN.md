# Plano de Fase 19 — Reauditoria Formal do Marco v1.2 (Pós-Fases 17 e 18)

## Objetivo
Reauditoria técnica independente e formal do marco v1.2 (CrewVitals: Demo Pública sem Login) após as correções aplicadas nas Fases 17 e 18, validando a conformidade estrita dos números entre deck, vídeo e demo, a integridade dos acentos UTF-8, o desacoplamento de hooks no ESLint, a higienização de segredos e o título do README.

## Pré-condições
- Fases 17 (`c5c69bf`) e 18 (`9c70ed3`) commitadas no repositório.
- Árvore de trabalho limpa para arquivos de código.

## Tarefas
1. Executar gates técnicos reais: `npm test -- --run` (562 testes), `npx tsc --noEmit` (0 erros), `npm run build` (0 erros), `npx eslint src/hooks/useReadiness.ts src/pages/Demo.tsx` (0 erros).
2. Verificar blindagem: `git diff 99aee14..HEAD --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts` (rigorosamente vazio).
3. Consistência deck x demo: conferir BioScore, piscadas/min e sono de `demoScenario.ts` contra slides 3 e 4 (PPTX e PDF) e `ROTEIRO-VIDEO-30S.md`; validar existência real de todos os botões citados.
4. Integridade de acentos: validar renderização UTF-8 sem mojibake ou supressão artificial no PPTX e PDF.
5. Higiene e segredos: `git grep -n -i -E "AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{10,}|2000171[1]|professor[.]se" -- docs README.md src` e análise transparente das ocorrências de `senha|password`.
6. Higiene de títulos: remoção de emoji residual no título de demonstração em `README.md`.
7. Atualizar `docs/publicacao/UAT-v1.2.md` com resultados reais ehonestos de cada item.
8. Atualizar governança GSD (`REQUIREMENTS.md` e `STATE.md`).

## Critérios de Pronto
- Gates 100% aprovados.
- Relatório de UAT reauditado e commit atômico exclusivo das pastas `.planning/`, `docs/publicacao/UAT-v1.2.md` e `README.md`.
