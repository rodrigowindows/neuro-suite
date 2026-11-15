# Plano de Fase 15 — Checklist de Publicação e Links Públicos para a Banca (v1.2)

## Objetivo
Criar documentação e checklist de publicação externa exigida pelo edital para entrega de demo pública, deck e vídeo sem requisitos de login, garantindo acessibilidade pública direta para os avaliadores.

## Requisitos
- **PUB-10:** `docs/publicacao/CHECKLIST-PUBLICACAO.md` com 7 passos numerados, dono e critério de pronto por passo (deploy Lovable, testes anônimos/4G, hospedagem deck, vídeo YouTube, revisão de privacidade/AppSec, template de submissão NASA Space Apps, plano de contingência).
- **PUB-11:** `README.md` atualizado com seção de Demonstração Pública no topo (link `/demo`, instrução de acesso sem login, nota de dados simulados, link para checklist).
- `docs/publicacao/LINKS.md`: Tabela estruturada para preenchimento dos links oficiais com validação de teste em janela anônima.

## Arquivos Exclusivos
- `docs/publicacao/CHECKLIST-PUBLICACAO.md`
- `docs/publicacao/LINKS.md`
- `README.md`

## Critérios de Blindagem e Verificação
- Zero alterações em `src/`, `supabase/`, `package.json`, `package-lock.json`, `vite.config.ts`.
- Zero emojis nos documentos operacionais (`docs/publicacao/**`).
- Nenhuma exposição de credenciais, chaves ou e-mails pessoais.
- Commit atômico exclusivo: `git add docs/publicacao/ README.md` e mensagem `docs(publicacao): checklist de links publicos sem login`.
