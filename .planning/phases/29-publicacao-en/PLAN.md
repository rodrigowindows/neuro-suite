# Plano de Fase 29 — Publicação e Documentação Bilíngue para a Banca (v1.3)

## Objetivo
Publicar documentação de submissão, checklist de testes e links da banca examinadora em inglês e português, suportando os fluxos `/demo?lang=en` e `?lang=pt` com acesso irrestrito sem autenticação.

## Requisitos
- **I18N-11:** Documentos de publicação em inglês e português:
  - `docs/publicacao/PUBLISHING-CHECKLIST.en.md`: Checklist operacional em inglês com testes de rota bilíngue, seletor de idioma, detecção automática do navegador, hospedagem de decks e vídeos, sanitização e contingência.
  - `docs/publicacao/CHECKLIST-PUBLICACAO.md`: Checklist em português atualizado com os testes de rota bilíngue e correção completa de acentuação.
  - `docs/publicacao/LINKS.md`: Tabela bilíngue de controle de artefatos da banca (App EN/PT, Decks EN/PT, Vídeos EN/PT) com marcadores `<FILL IN>`.
  - `docs/publicacao/SUBMISSION-TEXT.en.md`: Resumo oficial de 5 linhas em inglês para submissão à banca internacional.
  - `docs/publicacao/TEXTO-SUBMISSAO.pt.md`: Resumo oficial de 5 linhas em português para submissão local.

## Arquivos Exclusivos
- `docs/publicacao/PUBLISHING-CHECKLIST.en.md`
- `docs/publicacao/CHECKLIST-PUBLICACAO.md`
- `docs/publicacao/LINKS.md`
- `docs/publicacao/SUBMISSION-TEXT.en.md`
- `docs/publicacao/TEXTO-SUBMISSAO.pt.md`
(Nota: `docs/publicacao/UAT-v1.2.md` permanece intacto e não editado).

## Critérios de Blindagem e Verificação
- Zero alterações em `src/`, `supabase/`, `package.json`, `package-lock.json`, `vite.config.ts`, `README.md`, `docs/apresentacao/`.
- Zero emojis nos documentos operacionais.
- Nenhuma exposição de credenciais, chaves `AIza`, senhas ou e-mails pessoais.
- Verificação via regex e diffs estritos.
- Commit atômico exclusivo em `docs/publicacao/`.
