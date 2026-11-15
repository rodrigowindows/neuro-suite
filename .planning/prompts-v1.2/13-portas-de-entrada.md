/gsd-quick Fase 13 do marco v1.2 (CrewVitals): portas de entrada para a demo sem login.

## Contexto

A banca exige demo sem login. Outro terminal cria a rota pública `/demo` (`src/pages/Demo.tsx`). Você só liga a landing e a tela de login a esse caminho fixo; não depende do código dele. Leia antes: `AGENTS.md`, `.planning/ROADMAP.md` (seção v1.2), `src/pages/Index.tsx`, `src/pages/Auth.tsx` e seus testes (`Index.test.tsx`, `Auth.test.tsx`).

## Arquivos exclusivos (só estes)

- `src/pages/Index.tsx`, `src/pages/Index.test.tsx`
- `src/pages/Auth.tsx`, `src/pages/Auth.test.tsx`

Não toque em `src/App.tsx`, `src/pages/Demo.tsx`, `src/hooks/**` nem `docs/`.

## Requisitos

1. PUB-05: na landing, um botão ou link com o texto exato "Ver demonstração (sem login)" navegando para `/demo` (use `Link`/`useNavigate` do `react-router-dom`, como o arquivo já faz). Deve ser a ação mais visível da primeira dobra, sem remover o acesso atual ao login.
2. PUB-06: em `Auth.tsx`, um link secundário "Ver demonstração sem login" para `/demo`, abaixo do formulário. O formulário, os textos da fase 04 ("Terminal de Telemetria de Saúde da Tripulação", "Autenticar", "Autenticando...") e o redirecionamento `?demo=1` pós-login permanecem iguais.
3. Texto honesto: sem emojis, sem "100% Offline", sem "0 Dados Vazados", sem depoimentos, sem linguagem de RH. A frase de apoio deve dizer que os dados da demonstração são simulados.
4. Acessibilidade: alvo de toque de pelo menos 44 px (`min-h-[44px]`), rótulo claro, foco visível.
5. Não renomear chaves de navegação, endpoints nem nomes de schema.

## Testes (AAA)

- `Index.test.tsx`: renderiza a landing; assert que existe link/botão "Ver demonstração (sem login)" com destino `/demo`.
- `Auth.test.tsx`: assert que o link "Ver demonstração sem login" existe com destino `/demo` e que o botão "Autenticar" continua presente.
- Os testes existentes dessas telas continuam passando.

## Verificação (cole o resultado real no SUMMARY)

```bash
npx vitest run src/pages/Index.test.tsx src/pages/Auth.test.tsx src/lib/noEmojiUi.test.ts
npx tsc --noEmit
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```

Rode também `npm test -- --run` e `npm run build`; se outro terminal estiver editando e causar falha alheia ao seu escopo, registre qual teste falhou e de qual arquivo, sem corrigi-lo.

## Entrega (fluxo GSD)

`.planning/phases/13-portas-de-entrada/PLAN.md` curto antes e `SUMMARY.md` depois. Commit atômico só com os 4 arquivos, mensagem `feat(landing): atalho para demonstracao sem login`. Sem push.
