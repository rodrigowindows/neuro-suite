# Plano da Fase 44 — Perfil, Admin, Mensagens e Autenticação i18n (v1.4)

## Objetivo
Internacionalizar em EN e PT as telas de Perfil (`Profile.tsx`), Redefinição de Senha (`ResetPassword.tsx`), Painel Administrativo (`AdminPanel.tsx`), Página 404 (`NotFound.tsx`), além dos toasts de autenticação em `useAuth.tsx`, notificações críticas de estresse em `useStressNotifications.ts` e validações em `validations.ts`.

## Arquivos exclusivos
- `src/i18n/locales/account.ts` (dicionário no namespace `account`)
- `src/pages/Profile.tsx`
- `src/pages/ResetPassword.tsx`
- `src/pages/AdminPanel.tsx`
- `src/pages/NotFound.tsx`
- `src/hooks/useAuth.tsx`
- `src/hooks/useStressNotifications.ts`
- `src/lib/validations.ts`
- `src/lib/validations.test.ts`

## Passos de Execução
1. **Dicionário `account.ts`**:
   - Criar `src/i18n/locales/account.ts` com chaves prefixadas por `account.`, garantindo paridade total entre `en` e `pt`.
   - Seguir termos de `GLOSSARY.md` e `GLOSSARY-APP.md` (cockpit, operacional, sem alegações clínicas).
2. **Validações (`src/lib/validations.ts` e `src/lib/validations.test.ts`)**:
   - Adicionar fábricas `getSignupSchema`, `getLoginSchema`, `getCoachMessageSchema`, `getProfileSchema`, `getPasswordSchema` que aceitam `t` com fallback PT.
   - Manter schemas estáticos exportados compatíveis e em PT por padrão.
   - Expandir `validations.test.ts` com asserções das mensagens em PT e EN.
3. **Hook `src/hooks/useAuth.tsx`**:
   - Consumir `useI18n()` dentro de `AuthProvider` para traduzir títulos e descrições dos toasts (`signUp`, `signIn`, `signOut` e recuperação).
   - Manter mensagens de erro nativas do Supabase (`error.message`) inalteradas.
4. **Hook `src/hooks/useStressNotifications.ts`**:
   - Consumir `useI18n()` para traduzir o toast e a notificação de navegador sobre estresse alto prolongado.
5. **Páginas**:
   - `Profile.tsx`: conectar ao `useI18n()`, utilizar schemas traduzidos para feedback de validação e traduzir cards de info pessoal, segurança e botão de logout.
   - `ResetPassword.tsx`: traduzir mensagens de erro locais, toasts, cabeçalhos, formulário e tela de link expirado.
   - `AdminPanel.tsx`: traduzir cabeçalho, cartões de contagem, tabela de colaboradores e toasts de atualização de papel.
   - `NotFound.tsx`: traduzir mensagem de rota não encontrada e link de retorno ao início.
6. **Verificação rigorosa**:
   - Executar `git grep` para caracteres acentuados fora do locale/comentários.
   - Executar `npx eslint` nos arquivos exclusivos.
   - Executar `npm test -- --run` para garantir 0 regressões e paridade de catálogo.
   - Executar `npx tsc --noEmit` e `npm run build`.
   - Checar diff dos arquivos blindados.
7. **Documentação e Commit**:
   - Gerar `SUMMARY.md` com saídas reais dos comandos.
   - Commit atômico exclusivo conforme solicitado.
