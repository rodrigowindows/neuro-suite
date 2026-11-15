/gsd-quick Fase 29 do marco v1.3 (CrewVitals): documentos de publicação em inglês e português. Não depende de nenhuma outra fase (pode rodar já).

## Contexto

`docs/publicacao/CHECKLIST-PUBLICACAO.md` e `LINKS.md` estão em português e sem acentos em vários trechos. A submissão à banca é em inglês e os links da demo agora têm idioma (`?lang=en` e `?lang=pt`). Leia antes: `AGENTS.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `docs/publicacao/CHECKLIST-PUBLICACAO.md`, `docs/publicacao/LINKS.md`, `docs/seguranca/CHECKLIST-MANUAL.md`.

## Arquivos exclusivos

`docs/publicacao/**`, exceto `UAT-v1.2.md` (não editar). Não toque em `README.md` (fase 28), `docs/apresentacao/` nem `src/`.

## O que fazer

1. Crie `docs/publicacao/PUBLISHING-CHECKLIST.en.md`: tradução fiel do checklist (mesmos passos, dono e critério de pronto), com acentuação irrelevante em EN, e estes acréscimos:
   - Testar `/demo?lang=en` **e** `/demo?lang=pt` em janela anônima e no celular (4G/5G). Verificar que o seletor EN | PT troca o idioma sem recarregar.
   - Testar com o navegador configurado em inglês e depois em português, sem `?lang=`: deve abrir em EN e PT respectivamente.
   - Hospedar `CrewVitals-Demo-EN.pdf`/`.pptx` (principal) e `CrewVitals-Demo-PT.pdf`/`.pptx`; vídeo em inglês como principal.
2. Atualize `CHECKLIST-PUBLICACAO.md` (português) com os mesmos acréscimos, corrigindo a acentuação onde faltar, sem remover passos.
3. Atualize `LINKS.md` para tabela bilíngue com colunas (artefato, idioma, URL, testado em janela anônima?, data): App `/demo?lang=en`, App `/demo?lang=pt`, Deck EN (PDF), Deck EN (PPTX), Deck PT (PDF), Deck PT (PPTX), Vídeo EN, Vídeo PT. URLs desconhecidas ficam `<FILL IN>`; não invente links.
4. Crie `docs/publicacao/SUBMISSION-TEXT.en.md` e `docs/publicacao/TEXTO-SUBMISSAO.pt.md`: texto curto de submissão (3 a 5 linhas): o que é o CrewVitals (DSS de prontidão de tripulação), link da demo, link do deck, aviso "simulated data, no login required", sem alegações novas, sem credenciais.
5. Sem emojis, sem e-mail pessoal, sem senhas, sem chaves.

## Verificação (cole a saída real no SUMMARY)

```bash
git grep -n -i -E "AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{10,}|2000171[1]|professor[.]se" -- docs/publicacao
ls docs/publicacao
git status --short
git diff --stat -- src supabase package.json package-lock.json vite.config.ts
```

Esperado: grep sem saída, 5 arquivos novos ou atualizados no escopo e nada fora de `docs/publicacao/`.

## Entrega

`.planning/phases/29-publicacao-en/PLAN.md` e `SUMMARY.md`. Commit só de `docs/publicacao/**` (sem `UAT-v1.2.md`): `docs(publicacao): checklist, links e texto de submissao em ingles e portugues`. Sem push.
