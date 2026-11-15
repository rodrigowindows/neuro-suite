# Plano de Fase 16 — Auditoria e UAT do Marco v1.2

## Objetivo
Auditoria técnica completa e elaboração do relatório de UAT para o marco v1.2 (CrewVitals: Demo Pública sem Login), validando o cumprimento dos requisitos PUB-01 a PUB-12, os gates de build/testes, o isolamento dos arquivos blindados e os artefatos de apresentação.

## Pré-condições
- Commits das fases 12, 13, 14 e 15 presentes em `git log --oneline -5`.
- Árvore de trabalho limpa de arquivos de código de outras fases.

## Tarefas
1. Executar e registrar gates técnicos: `npm test -- --run`, `npx tsc --noEmit` e `npm run build`.
2. Verificar blindagem: `git diff HEAD~4..HEAD --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts` (deve ser estritamente vazio).
3. Prova de zero login e zero rede: confirmar `/demo` fora de `ProtectedRoute`, desacoplamento de `useGuestReadiness` e ausência de chamadas Supabase em `Demo.test.tsx`.
4. Honestidade e transparência: selo DEMO visível, alerta preditivo rotulado como demonstração, piscadas/min com `roundBlinkRate`, 0 emojis na UI.
5. Material da banca: deck com exatamente 7 slides e 0 credenciais; roteiro de vídeo <= 30s.
6. Publicação: `CHECKLIST-PUBLICACAO.md`, `LINKS.md`, `README.md` sem segredos.
7. Elaborar relatório `docs/publicacao/UAT-v1.2.md` com evidências reais e roteiro cronometrado de 60s em janela anônima.
8. Atualizar governança GSD (`REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, `PROJECT.md`).

## Critérios de Pronto
- Gates 100% verdes (561 testes passando).
- `docs/publicacao/UAT-v1.2.md` gerado.
- Commit atômico final das pastas `.planning/` e `docs/publicacao/UAT-v1.2.md`.
