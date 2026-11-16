# Resumo da Fase 44 — Perfil, Admin, Mensagens e Autenticação i18n (v1.4)

## Status: Concluída com sucesso

## O que foi implementado
1. **Dicionário `account` (`src/i18n/locales/account.ts`)**:
   - Criação do catálogo i18n em inglês e português com 100% de paridade de chaves sob o namespace `account.*`.
   - Textos fiéis aos glossários (`GLOSSARY.md` e `GLOSSARY-APP.md`) em tom operacional cockpit, sem floreios, sem emojis e sem falsas alegações.
2. **Hook de Autenticação (`src/hooks/useAuth.tsx`)**:
   - Consumo de `useI18n()` dentro de `AuthProvider` para tradução de toasts (`signUp`, `signIn`, `signOut`, `resetPassword`).
   - Mensagens de erro de infraestrutura do Supabase (`error.message`) continuam como chegam.
   - Preservadas integralmente todas as chamadas e regras de negócio de autenticação.
3. **Notificações de Estresse (`src/hooks/useStressNotifications.ts`)**:
   - Tradução dos avisos em toast e notificações nativas do navegador para dias consecutivos com estresse crítico.
4. **Validações (`src/lib/validations.ts` e `src/lib/validations.test.ts`)**:
   - Introdução de fábricas com injeção de função de tradução: `getSignupSchema`, `getLoginSchema`, `getProfileSchema`, `getPasswordSchema` e `getCoachMessageSchema`.
   - Schemas padrão mantidos com fallback para português.
   - Adicionados testes unitários validando erros em PT e EN.
5. **Páginas de Perfil, Redefinição de Senha, Admin e 404**:
   - `Profile.tsx`: cards de Informações Pessoais, Segurança e Acesso traduzidos em PT e EN via `useI18n()`, além de schemas traduzidos para feedback instantâneo de formulário.
   - `ResetPassword.tsx`: formulário de redefinição, feedbacks de validação de senha, tela de link expirado e estado de redirecionamento traduzidos.
   - `AdminPanel.tsx`: cabeçalho, cartões de métricas (Total Usuários, Gestores, Admins), cabeçalhos de tabela e toasts de atualização de papel traduzidos.
   - `NotFound.tsx`: mensagem de rota inexistente e link de retorno internacionalizados.

## Termos novos e mapeamento

| Chave | PT | EN |
|---|---|---|
| `account.auth.signUpErrorTitle` | Erro no cadastro | Sign up error |
| `account.auth.signUpSuccessTitle` | Cadastro realizado! | Account created! |
| `account.auth.signUpSuccessDescription` | Você já pode fazer login. | You can now sign in. |
| `account.auth.signInErrorTitle` | Erro no login | Sign in error |
| `account.auth.signOutTitle` | Logout realizado | Signed out |
| `account.auth.signOutDescription` | Até logo. | See you soon. |
| `account.auth.resetPasswordErrorTitle` | Erro na recuperação de senha | Password recovery error |
| `account.auth.resetPasswordSuccessTitle` | Email enviado! | Email sent! |
| `account.auth.resetPasswordSuccessDescription` | Enviamos um link de recuperação para seu email. | We sent a recovery link to your email. |
| `account.stressNotification.toast` | Estresse crítico detectado: {days} dias consecutivos com estresse alto. Considere fazer uma pausa ou falar com seu gestor. | Critical stress detected: {days} consecutive days with high stress. Consider taking a break or talking to your manager. |
| `account.stressNotification.notificationTitle` | CrewVitals — Alerta de Estresse | CrewVitals — Stress Alert |
| `account.stressNotification.notificationBody` | Você está com estresse alto há {days} dias consecutivos. Cuide-se! | You have had high stress for {days} consecutive days. Take care! |
| `account.profile.title` | Meu Perfil | My Profile |
| `account.profile.subtitle` | Gerencie suas informações pessoais | Manage your personal information |
| `account.profile.personalInfoTitle` | Informações Pessoais | Personal Information |
| `account.profile.personalInfoDescription` | Atualize seu nome e como deseja ser chamado pelo AstroAssist | Update your name and how you want to be called by AstroAssist |
| `account.profile.saveChanges` | Salvar Alterações | Save Changes |
| `account.profile.securityTitle` | Segurança | Security |
| `account.profile.changePassword` | Alterar Senha | Change Password |
| `account.profile.logout` | Sair da conta | Sign out of account |
| `account.resetPassword.title` | Redefinir Senha | Reset Password |
| `account.resetPassword.subtitle` | Escolha uma nova senha segura | Choose a secure new password |
| `account.resetPassword.invalidLink` | Link de recuperação inválido ou expirado. | Invalid or expired recovery link. |
| `account.resetPassword.backToLogin` | Voltar ao Login | Back to Login |
| `account.admin.title` | Painel Admin | Admin Panel |
| `account.admin.statsTotalUsers` | Total Usuários | Total Users |
| `account.admin.statsManagers` | Gestores | Managers |
| `account.admin.statsAdmins` | Admins | Admins |
| `account.notFound.message` | Ops! Página não encontrada | Oops! Page not found |
| `account.notFound.returnHome` | Voltar ao início | Return to Home |

## O que permaneceu inalterado (fora de escopo / regra de negócio)
- Regras de negócio de auth (`signUp`, `signIn`, `signOut`, `onAuthStateChange`).
- Nomes de colunas do Supabase e payload de tabelas (`profiles`, `user_roles`).
- Chaves estáveis de papéis (`admin`, `manager`, `user`).
- Erros nativos do Supabase (`error.message`).

## Saídas reais dos comandos de validação

### 1. Verificação de caracteres acentuados nos arquivos editados (sem testes nem locale)
```bash
$ git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]" -- src/pages/Profile.tsx src/pages/ResetPassword.tsx src/pages/AdminPanel.tsx src/pages/NotFound.tsx src/hooks/useAuth.tsx src/hooks/useStressNotifications.ts src/lib/validations.ts
(saída vazia - 0 ocorrências de texto não extraído)
```

### 2. ESLint
```bash
$ npx eslint src/pages/Profile.tsx src/pages/ResetPassword.tsx src/pages/AdminPanel.tsx src/pages/NotFound.tsx src/hooks/useAuth.tsx src/hooks/useStressNotifications.ts src/lib/validations.ts src/lib/validations.test.ts src/i18n/locales/account.ts
C:\Projetos\neuro-suite\src\hooks\useAuth.tsx
  11:108  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  12:65   error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Projetos\neuro-suite\src\pages\AdminPanel.tsx
  41:6  warning  React Hook useEffect has a missing dependency: 'loadUsers'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\Projetos\neuro-suite\src\pages\Profile.tsx
   82:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  107:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

✖ 5 problems (4 errors, 1 warning)
(apenas erros pré-existentes identificados no prompt da fase, sem nenhum novo erro inserido)
```

### 3. Testes Vitest
```bash
$ npm test -- --run
Test Files  52 passed (52)
Tests       657 passed (657)
Duration    32.39s
```

### 4. Verificação de Tipos TypeScript
```bash
$ npx tsc --noEmit
(saída vazia - 0 erros de tipo)
```

### 5. Build Vite
```bash
$ npm run build
✓ 3131 modules transformed.
rendering chunks...
✓ built in 17.45s
```

### 6. Diff de Arquivos Blindados
```bash
$ git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
(saída vazia — nenhum arquivo protegido alterado)
```

## Arquivos entregues no commit atômico exclusivo
- `src/pages/Profile.tsx`
- `src/pages/ResetPassword.tsx`
- `src/pages/AdminPanel.tsx`
- `src/pages/NotFound.tsx`
- `src/hooks/useAuth.tsx`
- `src/hooks/useStressNotifications.ts`
- `src/lib/validations.ts`
- `src/lib/validations.test.ts`
- `src/i18n/locales/account.ts`
