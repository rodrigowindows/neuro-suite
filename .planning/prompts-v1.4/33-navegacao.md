/gsd-quick Fase 33 do marco v1.4 (CrewVitals): navegação lateral e abas de seção em EN e PT. Pode rodar já, em paralelo com as demais fases 32 a 44 (depende só do núcleo i18n da fase 21, que já existe).

## Contexto

Depois do login o app (`/dashboard` e demais telas) segue só em português e não tem seletor de idioma, porque no v1.3 o `LangProvider` cobriu apenas `/`, `/auth` e `/demo`. O v1.4 traduz a área logada para EN e PT. Esta fase cuida de: barra lateral (itens, grupos, logout, rótulos de acessibilidade) e abas de seção do cockpit.

Leia antes: `.planning/prompts-v1.4/RULES.md` (método, testes, verificação e entrega: siga tudo), `.planning/prompts-v1.4/GLOSSARY-APP.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`.

## Arquivos exclusivos

- `src/components/AppSidebar.tsx` (e seu teste, se existir)
- `src/components/SectionTabs.tsx` (e seu teste, se existir)
- `src/hooks/useFeatureScores.tsx` e `src/hooks/useFeatureScores.test.ts` (rótulos dos scores da barra lateral; PT continua como padrão)
- `src/i18n/locales/nav.ts`

Namespace do dicionário: `nav` (arquivo `src/i18n/locales/nav.ts`, chaves `nav.*`). Não edite nenhum arquivo fora desta lista; outros terminais cuidam do resto.

## Específico desta fase

1. `employeeItems` e `managerItems` têm `title` em português e `value` (chave interna da aba): traduza só o `title`, nunca o `value`. Mova os títulos para chaves e resolva com `t` no render.
2. Itens: Cockpit, Contramedidas (Countermeasures), Histórico de Voo (Flight Log), IA Insights, Alertas Comando, ROI, Segurança de Missão, Relatórios IA, Chatbot, Integrações, Painel de Comando, Perfil, Admin, Sair (Sign out). Rótulos de grupos e `aria-label` incluídos.
3. O toast de logout vem de `useAuth.tsx` (outra fase): não mexa.
4. Teste: sidebar e `SectionTabs` em EN e PT, sem texto em português no EN, `value`s das abas inalterados.

## Entrega

`.planning/phases/33-navegacao/PLAN.md` e `SUMMARY.md`. Commit só dos arquivos exclusivos: `feat(nav): barra lateral e abas em ingles e portugues`. Sem push.
