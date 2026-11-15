# Plano de Fase 13 — Portas de Entrada para a Demo sem Login (Marco v1.2)

## Objetivo
Adicionar pontos de acesso diretos e visíveis na Landing Page (`Index.tsx`) e na tela de login (`Auth.tsx`) para a rota pública `/demo`, atendendo à exigência da banca de avaliação sem exigir autenticação, mantendo integridade visual, acessibilidade e a navegação existente.

## Requisitos
- **PUB-05:** Na Landing Page (`Index.tsx`), adicionar botão ou link com o texto exato "Ver demonstração (sem login)" navegando para `/demo` via `Link` / `useNavigate`. Destaque visual prioritário na primeira dobra (Hero), sem remover acesso ao login ("Iniciar Missão" / "Acessar Painel do Astronauta").
- **PUB-06:** Na tela de autenticação (`Auth.tsx`), adicionar link secundário "Ver demonstração sem login" apontando para `/demo`, posicionado abaixo do formulário de autenticação.
- **Honestidade e Estilo:** Sem emojis, sem alegações inverificáveis ("100% Offline", "0 Dados Vazados"), sem depoimentos, sem jargão de RH. Frase de apoio informando que os dados da demonstração são simulados.
- **Acessibilidade:** Alvo de toque de pelo menos 44px (`min-h-[44px]`), foco visível e contraste adequado.
- **Blindagem:** Não alterar rotas protegidas, schemas, endpoints nem dependências.

## Arquivos Exclusivos
- `src/pages/Index.tsx`
- `src/pages/Index.test.tsx`
- `src/pages/Auth.tsx`
- `src/pages/Auth.test.tsx`

## Critérios de Verificação
- `npx vitest run src/pages/Index.test.tsx src/pages/Auth.test.tsx src/lib/noEmojiUi.test.ts`
- `npx tsc --noEmit`
- `git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts` (vazio)
- Commit atômico exclusivo:
  `git add src/pages/Index.tsx src/pages/Index.test.tsx src/pages/Auth.tsx src/pages/Auth.test.tsx`
  `git commit -m "feat(landing): atalho para demonstracao sem login"`
