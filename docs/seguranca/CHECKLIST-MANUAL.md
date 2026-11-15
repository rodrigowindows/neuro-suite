# Checklist manual de segurança (AppSec PCS-001 a PCS-006)

Passos que não podem ser feitos pelo repositório. Cada passo tem como verificar.

Convenções:
- `<CHAVE_PUBLICAVEL>`: chave publicável (anon) do Supabase. Não colar valor real em documentos.
- `<TOKEN>`: access token da sessão de um usuário. Não colar valor real em documentos.
- `<URL_SUPABASE>`: URL do projeto Supabase.
- **Só com autorização do dono**: comando que cria conta de teste ou chama a IA (custo e cota).

Aviso: o arquivo `.env` está rastreado no Git. Mesmo que o valor atual seja removido, a chave continua no histórico. Por isso a revogação (passo 1) é obrigatória.

---

## 1. Revogar as chaves Gemini expostas (PCS-001)

1. Abrir o console do Google AI Studio / Google Cloud, no projeto ao qual as chaves pertencem.
2. Em "Credentials" (ou "API keys"), localizar as duas chaves citadas no relatório AppSec (a chave do `.env` versionado e a chave que foi compilada no bundle público).
3. Excluir ou revogar cada chave. Não criar substituta até o passo 2 estar pronto.
   - Verificação: a lista de chaves não mostra mais as duas. Uma chamada de teste com a chave antiga retorna erro de autenticação ou de chave inválida.
4. Apagar ou mascarar o PDF do relatório em `Feedbacks/`. O PDF contém as chaves. Depois, conferir que o diretório segue fora do Git:
   - Comando: `git check-ignore -v "Feedbacks/Rodada domingo de tarde/"`
   - Verificação: a saída mostra a regra `Feedbacks/` no `.gitignore`.
5. Confirmar que nenhuma das chaves aparece no código atual (a busca não deve retornar nada):
   - Comando: `git grep -l "AIza" -- . ":!Feedbacks"` (lista só os arquivos, sem imprimir o valor)
   - Verificação: sem resultados. O `.env` segue no histórico Git, o que a revogação resolve.

## 2. Remover VITE_GEMINI_KEY da Vercel e desativar o deploy, se não for usado (PCS-001 / PCS-006)

1. Painel da Vercel > projeto > Settings > Environment Variables: remover `VITE_GEMINI_KEY`, em todos os ambientes.
   - Verificação: a variável não aparece mais na lista.
2. Verificar se o deploy da Vercel ainda é usado. A aplicação principal aparece em `neuro-suite.lovable.app`.
   - Se não for mais usado: Settings > General > pausar o projeto ou excluí-lo. Esta ação é destrutiva; confirmar com o dono antes.
   - Verificação: `curl -sI https://neuro-suite-project.vercel.app/` deixa de retornar 200 (ou o projeto some).
3. Se o deploy da Vercel seguir ativo, redeployar sem a variável e conferir que o bundle não contém mais a chave:
   - Verificação: baixar o bundle `assets/index-*.js` e buscar `AIza`. Não deve haver resultado.

## 3. Ativar confirmação de e-mail e CAPTCHA na autenticação (PCS-003)

1. Abrir o painel do Supabase (ou Lovable Cloud, se a autenticação estiver lá).
2. Authentication > Sign In / Providers > Email: ativar "Confirm email".
   - Verificação: a opção aparece marcada. Em `<URL_SUPABASE>/auth/v1/settings`, o campo `mailer_autoconfirm` deve ser `false`.
3. Authentication > Attack Protection (ou Bot protection): ativar CAPTCHA (Cloudflare Turnstile ou hCaptcha) e salvar a chave secreta no painel.
   - Verificação: a opção aparece ativa e a chave secreta está configurada.
4. Teste de regressão (só com autorização do dono, cria conta de teste):
   - Comando: `curl -i -X POST <URL_SUPABASE>/auth/v1/signup -H "apikey: <CHAVE_PUBLICAVEL>" -H "Content-Type: application/json" -d '{"email":"teste.<NUMERO>@exemplo.com","password":"<SENHA_FORTE>"}'`
   - Verificação: a resposta não traz `email_confirmed_at` preenchido, e sem `captchaToken` a criação é recusada.
5. Só depois dos passos 2 e 3 planejar a inclusão do `captchaToken` no código (`src/hooks/useAuth.tsx`, em `signUp`). Não implementar antes.

## 4. Conferir headers de hospedagem e registrar risco residual (PCS-006)

1. Rodar:
   - Comando: `curl -sI https://neuro-suite.lovable.app/`
   - Verificação: anotar a presença de `X-Frame-Options`, `Content-Security-Policy` e `Permissions-Policy`.
2. Se a Lovable não permitir configurar os headers (X-Frame-Options, CSP), registrar como risco residual na seção de estado do `RESUMO-APPSEC.md`, com a data da verificação.
3. Se houver configuração disponível, aplicar e repetir o `curl`. O resultado esperado é `X-Frame-Options: DENY` ou `frame-ancestors 'none'` na CSP.

## 5. Trocar a senha da conta demo (credencial de demonstração)

1. Após a gravação da demo, trocar a senha da conta compartilhada no painel de autenticação.
   - Verificação: login com a senha antiga falha; login com a nova funciona.
2. Nunca guardar a senha no repositório, em `.env`, em `docs/` ou em scripts. Usar gerenciador de senhas.
   - Verificação: `git grep -n -i "senha\|password" -- docs supabase src` não retorna credenciais.

## 6. Verificação pós-deploy da Edge Function neuro-coach (PCS-002)

Estes testes chamam a função. O teste com sessão de usuário chama a IA. **Só com autorização do dono.**

1. Sem autenticação, com a chave publicável (esperado: 401):
   - Comando: `curl -i -X POST <URL_SUPABASE>/functions/v1/neuro-coach -H "apikey: <CHAVE_PUBLICAVEL>" -H "Authorization: Bearer <CHAVE_PUBLICAVEL>" -H "Content-Type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"content\":\"teste\"}]}"`
   - Verificação: status `401`. Se o resultado for `200`, o `verify_jwt` e a validação manual não estão funcionando como esperado: parar e reportar.
2. Com sessão de um usuário válido (esperado: 200). **Só com autorização do dono, pois consome cota de IA.**
   - Comando: `curl -i -X POST <URL_SUPABASE>/functions/v1/neuro-coach -H "apikey: <CHAVE_PUBLICAVEL>" -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"content\":\"teste\"}]}"`
   - Verificação: status `200`.
3. Conferir o drift de `verify_jwt`: `supabase/config.toml` define `verify_jwt = false` para `neuro-coach`. Comparar com o valor em produção (painel do Supabase > Edge Functions > neuro-coach). Os dois devem bater, ou o drift deve estar registrado.

## 7. Verificação do PCS-004 (callback do Google Calendar)

1. Comando: `curl -s "<URL_SUPABASE>/functions/v1/google-calendar?action=callback&error=teste"`
   - Verificação: o HTML retornado não contém `postMessage(` com `'*'` como origem. A origem deve aparecer serializada e validada.
2. Comparar com `supabase/functions/google-calendar/index.ts`. Se houver diferença, é drift de deploy: redeployar a versão do repositório após aprovação do dono.

## 8. Itens que não são decididos aqui

- Migração `check-fisiologico.sql`: não aplicar sem aprovação do dono (ver cabeçalho do arquivo).
- Remoção do `.env` do índice Git (`git rm --cached .env`): não feito, porque o Lovable gerencia o arquivo. Decidir com o dono.
