/gsd-quick Fase 15 do marco v1.2 (CrewVitals): checklist de publicação e links públicos para a banca.

## Contexto

A banca exige link público que não peça senha, permissão nem cadastro, para um deck de 7 slides ou um vídeo de até 30 s. O código da demo (`/demo`) e o deck são feitos em outros terminais. Aqui você só escreve a documentação de publicação que o dono executa e a seção de demonstração do README. Repositório remoto: `https://github.com/rodrigowindows/neuro-suite`. URL de produção esperada: `https://neuro-suite.lovable.app/demo`. Leia antes: `AGENTS.md`, `.planning/ROADMAP.md` (seção v1.2), `README.md`, `docs/seguranca/CHECKLIST-MANUAL.md`.

## Arquivos exclusivos

`docs/publicacao/**` (novo) e `README.md`. Não toque em `src/`, `docs/apresentacao/` nem `docs/seguranca/`.

## Requisitos

1. PUB-10: `docs/publicacao/CHECKLIST-PUBLICACAO.md` com passos numerados, dono e critério de pronto em cada um:
   1. Publicar o app no Lovable (Publish) com visibilidade pública e confirmar que a URL final é a esperada; se for outra, anotar para atualizar o deck (`docs/apresentacao/`).
   2. Abrir `<URL>/demo` em janela anônima e em celular fora do Wi-Fi de casa: deve abrir direto no cockpit, sem login, sem pedir cadastro.
   3. Hospedar o deck: PDF e PPTX em local com link "qualquer pessoa com o link" (GitHub no repositório público, Google Drive, OneDrive ou Dropbox). Para cada opção, o passo exato de compartilhamento aberto. Testar em janela anônima.
   4. Alternativa de vídeo (até 30 s): gravar seguindo `docs/apresentacao/ROTEIRO-VIDEO-30S.md`, enviar ao YouTube como "Não listado", conferir em janela anônima.
   5. Revisão de privacidade antes de publicar: nenhum e-mail pessoal, senha ou chave no deck, no vídeo (inclusive barra de abas e URLs) nem no repositório público; conferir `docs/seguranca/CHECKLIST-MANUAL.md` (chaves revogadas, `Feedbacks/` fora do git).
   6. Colar na submissão os links finais e o texto de apoio (inclua um modelo de 3 linhas em português: o que é, link da demo, link do deck/vídeo, aviso "dados simulados, acesso sem login").
   7. Plano B: se o link do app falhar na hora da avaliação, o deck/vídeo sozinho cumpre a demo; deixar ambos prontos.
2. PUB-11: `README.md` ganha a seção "Demonstração" no topo ou logo após a descrição: link `/demo`, "sem login", "dados simulados", link para o checklist. Não remova conteúdo existente; não escreva credenciais.
3. `docs/publicacao/LINKS.md` com tabela vazia a preencher pelo dono (artefato, URL, testado em janela anônima? data) e as linhas: App `/demo`, Deck PDF, Deck PPTX, Vídeo.
4. Português, sem emojis, sem credenciais, sem alegações não sustentadas. Não invente URLs que não existem: use `<PREENCHER>` onde só o dono sabe.

## Verificação (cole o resultado real no SUMMARY)

```bash
git diff --stat -- src supabase package.json package-lock.json vite.config.ts
git status --short
```

Esperado: nenhuma alteração fora de `docs/publicacao/**` e `README.md`. Confirme que `README.md` não contém senha nem e-mail pessoal (busque `@` e `senha`).

## Entrega (fluxo GSD)

`.planning/phases/15-publicacao/PLAN.md` curto antes e `SUMMARY.md` depois. Commit atômico só com `docs/publicacao/**` e `README.md`, mensagem `docs(publicacao): checklist de links publicos sem login`. Sem push.
