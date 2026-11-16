/gsd-quick Fase 44 do marco v1.4 (CrewVitals): perfil, redefinição de senha, admin, 404 e mensagens de autenticação em EN e PT. Pode rodar já, em paralelo com as demais fases 32 a 44 (depende só do núcleo i18n da fase 21, que já existe).

## Contexto

Depois do login o app (`/dashboard` e demais telas) segue só em português e não tem seletor de idioma, porque no v1.3 o `LangProvider` cobriu apenas `/`, `/auth` e `/demo`. O v1.4 traduz a área logada para EN e PT. Esta fase cuida de: páginas de Perfil, Redefinir senha, Admin e 404, e as mensagens (toasts) de autenticação e de notificação de estresse.

Leia antes: `.planning/prompts-v1.4/RULES.md` (método, testes, verificação e entrega: siga tudo), `.planning/prompts-v1.4/GLOSSARY-APP.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`.

## Arquivos exclusivos

- `src/pages/Profile.tsx`
- `src/pages/ResetPassword.tsx`
- `src/pages/AdminPanel.tsx`
- `src/pages/NotFound.tsx`
- `src/hooks/useAuth.tsx` e seu teste, se existir
- `src/hooks/useStressNotifications.ts`
- `src/lib/validations.ts` e `src/lib/validations.test.ts` (mensagens de validação dos formulários; PT continua como padrão)
- `src/i18n/locales/account.ts`

Namespace do dicionário: `account` (arquivo `src/i18n/locales/account.ts`, chaves `account.*`). Não edite nenhum arquivo fora desta lista; outros terminais cuidam do resto.

## Específico desta fase

1. `useAuth.tsx`: com o `LangProvider` global acima do `AuthProvider` (fase 32), o hook pode usar `useI18n`. Se o provider ainda não estiver no lugar quando você rodar, o fallback é português e nada quebra. Traduza os toasts ("Erro no login", "Cadastro realizado!", "Logout realizado" etc.); mensagens de erro vindas do Supabase (`error.message`) continuam como chegam.
2. Não altere a lógica de autenticação, `signUp` (`emailRedirectTo`), `signIn`, `signOut` nem a leitura de sessão.
3. `Profile.tsx` e `AdminPanel.tsx` têm erros de eslint antigos (`no-explicit-any`) que não são desta fase: não os corrija, apenas não piore.
4. Sem e-mail institucional nem credenciais em nenhum texto.

## Entrega

`.planning/phases/44-conta-mensagens/PLAN.md` e `SUMMARY.md`. Commit só dos arquivos exclusivos: `feat(conta): perfil, admin e mensagens de autenticacao em ingles e portugues`. Sem push.
