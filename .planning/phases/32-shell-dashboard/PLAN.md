# Plano de Execução - Fase 32: Casca do App Logado (v1.4)

## Objetivo
Implementar o `LangProvider` global em `src/App.tsx` (acima de `AuthProvider`), integrar o `LanguageToggle` no cabeçalho do `Dashboard.tsx`, internacionalizar os títulos das seções, esqueleto de carregamento, estados vazios e o modal de validação de pesquisa (`ResearchValidationModal.tsx`), mantendo dados persistidos intocados e criando o dicionário `src/i18n/locales/dashboard.ts` com suporte completo EN/PT.

## Arquivos Exclusivos
- `src/App.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Dashboard.test.tsx`
- `src/components/DashboardContent.tsx`
- `src/components/DashboardSkeleton.tsx`
- `src/components/ResearchValidationModal.tsx`
- `src/components/WelcomeBanner.tsx`
- `src/i18n/locales/dashboard.ts`

## Etapas de Implementação
1. **Criar dicionário `src/i18n/locales/dashboard.ts`:**
   - Prefixar todas as chaves com `dashboard.`.
   - Garantir paridade estrita 1:1 entre `en` e `pt`.
   - Preservar texto em português rigorosamente idêntico ao original.
2. **Atualizar `src/App.tsx`:**
   - Envolver a aplicação com um único `<LangProvider>` acima de `<AuthProvider>`.
   - Remover wrappers de `LangProvider` nas rotas individuais (`/`, `/auth`, `/demo`).
3. **Atualizar `src/pages/Dashboard.tsx`:**
   - Traduzir títulos de seções via `PAGE_TITLE_KEYS` e `t(...)`.
   - Inserir `<LanguageToggle />` no cabeçalho ao lado de `MissionStatusWidget` com layout `flex-wrap` e alvo de toque >= 44px.
   - Traduzir textos do rodapé ("Zero-Trust Privacy" e gatilho do modal).
   - Preservar labels do `appendEvent` (dados persistidos inalterados).
4. **Atualizar `src/components/DashboardContent.tsx`:**
   - Adicionar tradução aos textos de estado vazio do `gamification` e ao fallback de carregamento (`LazyFallback`).
5. **Atualizar `src/components/DashboardSkeleton.tsx`:**
   - Adicionar atributos acessíveis de carregamento (`role="status"`, `aria-label={t('dashboard.loading')}`).
6. **Atualizar `src/components/WelcomeBanner.tsx`:**
   - Internacionalizar saudações, texto explicativo e botão de fechar.
7. **Atualizar `src/components/ResearchValidationModal.tsx`:**
   - Internacionalizar gatilho, títulos, itens de evidências científicas, tabela de cobertura de riscos, badges e aviso ético.
8. **Atualizar `src/pages/Dashboard.test.tsx`:**
   - Garantir que os 27 testes existentes continuem passando intactos.
   - Adicionar novo teste AAA: verificar que com `LangProvider initialLang="en"`, o título e o seletor renderizam em inglês e que ao alternar para PT atualiza o título sem recarregar.
9. **Verificação rigorosa dos gates de qualidade:**
   - `git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]"` nos componentes.
   - `npx eslint` nos arquivos editados.
   - `npm test -- --run` em toda a suíte.
   - `npx tsc --noEmit`.
   - `npm run build`.
   - `git diff --stat` nos arquivos blindados (deve ser vazio).
10. **Commit atômico exclusivo:**
    - `feat(app): provider global, seletor de idioma e Dashboard em ingles e portugues`.
