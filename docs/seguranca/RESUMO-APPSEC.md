# Resumo AppSec: estado de PCS-001 a PCS-006

Base: relatório AppSec V2 (sem chaves nem trechos sensíveis copiados). Verificação do código feita com `git grep` e leitura de arquivos no commit `main` atual. "Plataforma" = painel Supabase, Vercel, Lovable ou Google Cloud, que não é verificável pelo repositório.

Dono: "Dono do projeto" = quem tem acesso ao console da plataforma e aprova mudanças de produção. "Dev" = quem altera o código.

| ID | Achado | Sev. | Estado no código | Estado na plataforma / produção | Risco residual | Dono da ação |
|---|---|---|---|---|---|---|
| PCS-001 | Chaves Gemini expostas (`.env` versionado e bundle público) | Crítica | Nenhuma referência a `VITE_GEMINI_KEY` ou ao endpoint Gemini em `src/` e `supabase/`. O `.env` continua rastreado pelo Git, então a chave está no histórico. | Chaves ainda válidas até revogação. Variável na Vercel a remover. | Alto até a revogação. Chave no histórico Git. | Dono do projeto (console Google, Vercel). Ver CHECKLIST-MANUAL passos 1 e 2. |
| PCS-002 | `neuro-coach` sem validação de usuário e `verify_jwt` divergente | Alta | `neuro-coach` valida `Authorization` manualmente e responde 401 sem cabeçalho. `supabase/config.toml` ainda define `verify_jwt = false`. Plano de fechamento em `.planning/phases/05-edge-functions/AUDIT.md`. | Não verificado. Pode diferir do repositório. | Médio: a validação manual cobre, mas o drift precisa ser fechado. | Dev (código e config). Dono do projeto (deploy). Ver CHECKLIST-MANUAL passo 6. |
| PCS-003 | Criação de conta com confirmação automática e sem CAPTCHA | Alta | `src/hooks/useAuth.tsx` usa `emailRedirectTo`. Não há código de CAPTCHA (`captchaToken`). | Não verificado no painel. Teste do relatório indica autoconfirm ativo. | Alto até a configuração na plataforma. | Dono do projeto (painel Supabase/Lovable). Dev só após a configuração. Ver CHECKLIST-MANUAL passo 3. |
| PCS-004 | Divergência do callback OAuth do Google Calendar (postMessage, origem) | Média | `supabase/functions/google-calendar/index.ts` serializa `targetOrigin` com `JSON.stringify`, em vez de usar `'*'`. Falta confirmar a validação de `state` e de origem. | Relatório apontou drift em produção. Não verificado nesta tarefa. | Médio até comparar produção e repositório. | Dev (validação de `state`). Dono do projeto (redeploy). Ver CHECKLIST-MANUAL passo 7. |
| PCS-005 | Sem CHECK de faixa fisiológica em `stress_scans`; `select('*')` | Média | `select('*')` não aparece em `src/` (só em testes, que checam colunas explícitas). Migrations não têm CHECK em `blink_rate` nem em `hrv_value`. | Não aplicado. Script em `docs/seguranca/check-fisiologico.sql`. | Médio: valores fora da faixa ainda entram no banco. | Dono do projeto (aprovação da migração). Dev (aplicação do script). |
| PCS-006 | Sem `X-Frame-Options` / CSP (clickjacking) e logs de biometria no console | Média | Não existe `vercel.json` no repositório. Logs de biometria: verificar com `git grep -n "console.log"` em `src/components/NeuroScore.tsx`. | Headers ausentes no relatório. Hospedagem atual é Lovable (`neuro-suite.lovable.app`). | Médio, se a Lovable não permitir configurar headers. | Dono do projeto (plataforma). Ver CHECKLIST-MANUAL passo 4. |

## Pendências em ordem de prioridade

1. Revogar as duas chaves Gemini (PCS-001). Depois apagar ou mascarar o PDF em `Feedbacks/`.
2. Ativar confirmação de e-mail e CAPTCHA (PCS-003). Só depois planejar o `captchaToken`.
3. Fechar drift de `verify_jwt` no `neuro-coach` e conferir produção (PCS-002).
4. Aprovar e aplicar `check-fisiologico.sql` (PCS-005).
5. Conferir headers na Lovable e registrar o risco residual (PCS-006).
6. Confirmar a validação de `state` no callback do Google (PCS-004).

## Histórico de verificação

- Repositório: `.env` rastreado pelo Git (`git ls-files`). Por isso não foi adicionado ao `.gitignore`.
- `Feedbacks/` adicionado ao `.gitignore`.
- Nenhuma alteração em `supabase/migrations`.
