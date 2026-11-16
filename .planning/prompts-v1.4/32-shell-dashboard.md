/gsd-quick Fase 32 do marco v1.4 (CrewVitals): casca do app logado: provider global, seletor de idioma e Dashboard. Pode rodar já, em paralelo com as demais fases 32 a 44 (depende só do núcleo i18n da fase 21, que já existe).

## Contexto

Depois do login o app (`/dashboard` e demais telas) segue só em português e não tem seletor de idioma, porque no v1.3 o `LangProvider` cobriu apenas `/`, `/auth` e `/demo`. O v1.4 traduz a área logada para EN e PT. Esta fase cuida de: provider global, seletor EN/PT visível no cabeçalho do Dashboard, títulos das seções, esqueleto de carregamento, conteúdo vazio das abas e modal de validação de pesquisa.

Leia antes: `.planning/prompts-v1.4/RULES.md` (método, testes, verificação e entrega: siga tudo), `.planning/prompts-v1.4/GLOSSARY-APP.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`.

## Arquivos exclusivos

- `src/App.tsx`
- `src/pages/Dashboard.tsx` e `src/pages/Dashboard.test.tsx`
- `src/components/DashboardContent.tsx`
- `src/components/DashboardSkeleton.tsx`
- `src/components/ResearchValidationModal.tsx`
- `src/components/WelcomeBanner.tsx`
- `src/i18n/locales/dashboard.ts`

Namespace do dicionário: `dashboard` (arquivo `src/i18n/locales/dashboard.ts`, chaves `dashboard.*`). Não edite nenhum arquivo fora desta lista; outros terminais cuidam do resto.

## Específico desta fase

1. `src/App.tsx`: troque os três `LangProvider` por roteiro (`/`, `/auth`, `/demo`) por **um único** `<LangProvider>` envolvendo toda a árvore, **acima** de `AuthProvider` (para que `useAuth` possa usar `useI18n`). Remova os wrappers por rota. O idioma passa a persistir entre telas sem remontar.
2. `Dashboard.tsx`: `PAGE_TITLES` e demais textos vão para o dicionário. Inclua `<LanguageToggle />` no cabeçalho, ao lado do `MissionStatusWidget`, visível e sem estourar em 375 px (`flex-wrap`, alvo de 44 px).
3. `DashboardContent.tsx`: textos soltos (por exemplo "Complete o BioScore primeiro") e fallback de carregamento.
4. Rótulos gravados por `appendEvent` em `Dashboard.tsx` (ex.: "BioScore: ...") são dados persistidos: NÃO mude.
5. Os testes existentes de `Dashboard.test.tsx` (27) continuam passando sem provider. Acrescente: dentro de `<LangProvider initialLang="en">` o título da seção ativa e o seletor aparecem em inglês; trocar para PT atualiza o título sem recarregar.
6. Garanta que `/`, `/auth` e `/demo` continuam funcionando com o provider único (rode os testes de Index, Auth e Demo).

## Entrega

`.planning/phases/32-shell-dashboard/PLAN.md` e `SUMMARY.md`. Commit só dos arquivos exclusivos: `feat(app): provider global, seletor de idioma e Dashboard em ingles e portugues`. Sem push.
