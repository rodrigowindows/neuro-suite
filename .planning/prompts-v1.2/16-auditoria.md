/gsd-verify-work Fase 16 do marco v1.2 (CrewVitals): auditoria e UAT da demo sem login. Rode SOMENTE depois que as fases 12, 13, 14 e 15 estiverem commitadas.

## Contexto

Marco v1.2: a banca exige demo sem login. Leia antes: `AGENTS.md`, `.planning/ROADMAP.md` e `.planning/REQUIREMENTS.md` (seções v1.2), os `SUMMARY.md` de `.planning/phases/12-*` a `15-*` e `.planning/phases/11-auditoria/UAT.md` (formato PASSOU / FALHOU / NÃO VERIFICADO).

## Pré-condição

```bash
git log --oneline -8
git status --short
```

Devem existir 4 commits novos (fases 12 a 15) e árvore limpa. Se faltar algum, pare e liste o que falta.

## Tarefas

1. Gates, com saída real: `npm test -- --run`, `npx tsc --noEmit`, `npm run build`.
2. Blindados: `git diff <commit-antes-da-fase-12>..HEAD --stat -- src/integrations supabase/migrations package.json package-lock.json bun.lock bun.lockb vite.config.ts` deve ser vazio. Também sem nova dependência.
3. Prova de zero login e zero rede (PUB-01, PUB-02): leia `src/pages/Demo.tsx`, `src/hooks/useReadiness.ts` e `src/App.tsx`; confirme que `/demo` não está atrás de guarda de autenticação, que o teste `Demo.test.tsx` mocka o Supabase e verifica ausência de `from`, `getUser` e `functions.invoke`, e que o teste realmente falharia se alguém reintroduzisse uma chamada (mutação mental ou temporária, revertida em seguida). Se houver `auth.getSession` do `AuthProvider`, registre que é leitura local de sessão.
4. Navegador real (se houver Chrome automatizável; senão marque NÃO VERIFICADO): `npm run dev` ou `npm run preview`, abrir `/demo` em perfil sem sessão e sem localStorage, ler o log de rede e confirmar zero requisições para o domínio do Supabase. Percorrer as 3 etapas e o reinício. Em 375 px de largura confirmar sem rolagem horizontal.
5. Honestidade (AGENTS.md): selo "DEMO: dados simulados" presente; alerta preditivo rotulado como demonstração; piscadas formatadas só na exibição; sem emojis em `src/pages` e `src/components`; sem "100% Offline", "0 Dados Vazados" nem depoimentos.
6. Entradas: landing e `/auth` apontam para `/demo`; login com conta compartilhada e `?demo=1` seguem funcionando (testes das fases 04 e 08 verdes).
7. Deck e vídeo: `len(Presentation('docs/apresentacao/CrewVitals-Demo.pptx').slides) == 7`; PDF com 7 páginas; busca por senha, e-mail pessoal ou "fazer login" como passo (somente menções negativas aceitas); `ROTEIRO-VIDEO-30S.md` soma no máximo 30 s.
8. Publicação: `docs/publicacao/CHECKLIST-PUBLICACAO.md` e `LINKS.md` existem; `README.md` com seção "Demonstração"; nenhuma credencial em lugar algum (`git grep -n -i -E "senha|password|AIza|sk-" -- docs README.md`).
9. UAT: crie `docs/publicacao/UAT-v1.2.md` com roteiro cronometrado de 60 s para o dono (janela anônima, abrir link, 3 etapas) e a tabela de resultados por passo. Tudo que depende do deploy e dos links públicos fica NÃO VERIFICADO com a instrução do que o dono deve fazer.

## Atualizar GSD

Marque em `.planning/REQUIREMENTS.md` apenas o que tiver evidência (PUB-01 a PUB-12), atualize a tabela de progresso de `.planning/ROADMAP.md` e `.planning/STATE.md` com contagens reais de testes. Não declare "100%" sem evidência; itens de produção ficam pendentes.

## Entrega

Relatório curto com: tabela de gates, lista de achados (FALHOU com arquivo e linha), lista de NÃO VERIFICADO. Se achar defeito, não corrija código de outra fase: descreva e proponha o prompt de correção. Commit só de `.planning/**` e `docs/publicacao/UAT-v1.2.md`, mensagem `docs(v1.2): auditoria e UAT da demo sem login`. Sem push.
