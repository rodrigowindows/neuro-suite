# Resumo da Fase 16 — Auditoria e UAT do Marco v1.2

- **Marco:** v1.2 (CrewVitals: Demo Pública sem Login)
- **Fase:** 16 — Auditoria e UAT
- **Data:** 2026-11-15
- **Status:** Concluído com sucesso (Código e Testes 100% Aprovados)

## Resultados da Auditoria

1. **Pré-condição Verificada:**
   - Commits `53ac4b7` (Fase 12), `105c8a0` (Fase 13), `e2810c1` (Fase 14) e `52a0a40` (Fase 15) confirmados em `git log --oneline -5`.

2. **Gates Técnicos:**
   - `npm test -- --run`: 50 arquivos de teste, 561 testes aprovados (100%).
   - `npx tsc --noEmit`: código 0 (sem erros de compilação).
   - `npm run build`: código 0 (build Vite finalizado com sucesso em 15.50s).

3. **Blindagem Lovable:**
   - `git diff HEAD~4..HEAD --stat -- src/integrations supabase/migrations package.json package-lock.json bun.lock bun.lockb vite.config.ts`: estritamente vazio.

4. **Zero Login e Zero Rede:**
   - Rota `/demo` registrada em `src/App.tsx` sem guardas de autenticação.
   - `useGuestReadiness` desacoplado de qualquer chamada de banco ou auth.
   - `src/pages/Demo.test.tsx` verifica 0 chamadas a `from`, `getUser` e `functions.invoke`.

5. **Transparência Científica:**
   - Selo permanente "DEMO: dados simulados" ativo no cabeçalho de `/demo`.
   - Alerta preditivo rotulado como demonstração (não é previsão clínica validada).
   - Piscadas por minuto arredondadas na camada de exibição com `roundBlinkRate()`.
   - Zero emojis nas páginas e componentes (`src/lib/noEmojiUi.test.ts` aprovado).

6. **Artefatos da Banca:**
   - `CrewVitals-Demo.pptx`: exatamente 7 slides confirmados via `python-pptx`.
   - `CrewVitals-Demo.pdf`: exatamente 7 páginas confirmadas via `pypdf`.
   - `ROTEIRO-VIDEO-30S.md`: 5 cenas cronometradas somando exatamente 30 segundos.
   - Zero credenciais, senhas ou e-mails pessoais no deck e na documentação.

7. **Relatório de UAT Entregue:**
   - `docs/publicacao/UAT-v1.2.md` com evidências reais, tabela de resultados e roteiro operacional cronometrado de 60s em janela anônima para o dono.

8. **Governança GSD:**
   - `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md` e `PROJECT.md` sincronizados.
