# Marco v1.2: Demo Pública sem Login

Requisito da banca: o link da demo não pode exigir senha, permissão nem cadastro.
Decisão: rota pública `/demo`, sem sessão e sem rede, 100% simulada e rotulada.

## Como executar

Abra um terminal por prompt, na raiz `C:\Projetos\neuro-suite`, e rode:

```bash
claude "$(cat .planning/prompts-v1.2/12-demo-publica.md)"
```

(ou cole o conteúdo do arquivo). Troque o nome do arquivo para cada terminal.

| Terminal | Prompt | Depende de | Arquivos exclusivos |
|----------|--------|------------|---------------------|
| A | `12-demo-publica.md` | nada | `src/pages/Demo.tsx`, `src/App.tsx`, `src/hooks/useReadiness.ts`, `src/hooks/useAuth.tsx` (somente se preciso), testes novos |
| B | `13-portas-de-entrada.md` | nada (usa só o caminho `/demo`) | `src/pages/Index.tsx`, `src/pages/Auth.tsx`, seus testes |
| C | `14-deck-7-slides.md` | nada (usa só a URL) | `docs/apresentacao/**` |
| D | `15-publicacao.md` | nada | `docs/publicacao/**`, `README.md` |
| E | `16-auditoria.md` | A, B, C e D concluídas | `.planning/**`, `docs/publicacao/UAT-v1.2.md` |

A, B, C e D rodam ao mesmo tempo. E roda por último.

## Contrato compartilhado (não mude)

- Rota: `/demo`. URL pública: `https://neuro-suite.lovable.app/demo`.
- `/demo` não chama o Supabase em nenhum caso.
- Roteiro: etapa 1 NO-GO (BioScore 34), etapa 2 ATENÇÃO (52), etapa 3 GO (72), via `src/lib/demoScenario.ts`.
- Fluxo existente de login e `?demo=1` com conta compartilhada continuam funcionando (plano B).

## Regras de commit (Lovable continua funcionando)

- Nunca tocar: `src/integrations/supabase/**`, `supabase/migrations/**`, `package.json`, `package-lock.json`, `bun.lock`, `bun.lockb`, `vite.config.ts`, `.env*`.
- Nenhuma dependência nova. Nenhum push.
- Commit só dos arquivos exclusivos do seu prompt: `git add <arquivos>` e `git commit <arquivos> -m "..."` (o pathspec evita levar arquivos que outro terminal deixou no stage).
- Antes de commitar: `git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts` precisa estar vazio.
- Conferir `git status` ao final: só os seus arquivos mudam.

## Rodada de correção (após auditoria independente)

Rodar 17 e 18 em paralelo (exclusivos: `docs/apresentacao/**`; `src/hooks/useReadiness*` e `src/pages/Demo*`) e depois 19.

## Ações do dono (não são código)

Listadas em `docs/publicacao/CHECKLIST-PUBLICACAO.md` (gerado pelo prompt 15): publicar no Lovable com acesso público, hospedar deck e vídeo com link aberto, abrir tudo em janela anônima.
