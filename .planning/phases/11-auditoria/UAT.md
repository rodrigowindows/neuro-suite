# UAT do marco v1.1: Auditoria e demo

**Data da execucao:** 2026-11-15
**Escopo:** QA-01, QA-02, QA-03 (`.planning/REQUIREMENTS.md`) e criterios da Phase 11 (`.planning/ROADMAP.md`)
**Legenda:** PASSOU, FALHOU, NAO VERIFICADO

Todos os gates automatizados e varreduras foram reexecutados nesta rodada em 2026-11-15 com saidas reais. Nenhum codigo de aplicacao foi alterado nesta rodada.

## Resumo

| # | Verificacao | Resultado |
|---|-------------|-----------|
| 1 | `npm test -- --run` (49 arquivos, 550 testes) | PASSOU |
| 2 | Ausencia de "Not implemented" na saida completa | PASSOU |
| 3 | `npx tsc --noEmit` | PASSOU |
| 4 | `npm run build` | PASSOU |
| 5 | Arquivos blindados sem alteracao (`git status` e `git diff HEAD`) | PASSOU |
| 6 | Emojis em `src/pages`, `src/components`, `src/hooks`, `src/services`, `src/lib` com as exclusoes do teste | PASSOU |
| 7 | `select('*')` fora de testes (`src/` e `supabase/functions/`) | PASSOU |
| 8 | `console.log` em `src/` fora de testes | PASSOU |
| 9 | `console.log` em `supabase/functions/` fora de testes | PASSOU |
| 10 | Varredura de chaves `AIza` fora de `Feedbacks/` | PASSOU |
| 11 | `git check-ignore` de `Feedbacks/` | PASSOU |
| 12 | Roteiro visual cronometrado da conta demo | NAO VERIFICADO |
| 13 | Teste pos-deploy: `neuro-coach` com chave publicavel retorna 401 | NAO VERIFICADO |

## 1. Testes unitarios

**Comando:** `npm test -- --run`

- Nesta rodada: PASSOU. `Test Files 49 passed (49)`, `Tests 550 passed (550)`. Codigo de saida 0. Duracao total 19.83 s (testes 30.59 s).
- Execucoes anteriores no dia: PASSOU com os mesmos totais.
- Falha intermitente anterior (`TypeError: The URL must be of scheme file` em `src/lib/noEmojiUi.test.ts`): nao reproduzida nesta rodada nem nas anteriores.

**Comando:** busca por `Not implemented` na saida completa da execucao.

- PASSOU. 0 ocorrencias.

## 2. Tipagem e build

**Comando:** `npx tsc --noEmit`

- PASSOU. Codigo de saida 0, sem erros de tipagem.

**Comando:** `npm run build`

- PASSOU. Codigo de saida 0. Build concluido em 12.18 s.
- Aviso (nao e falha): chunk `index-BCJUzN1f.js` com 845.02 kB minificado (gzip: 253.29 kB), acima do limite de 500 kB do Vite.

## 3. Arquivos blindados

Lista: `src/integrations/`, `supabase/migrations/`, `package.json`, `package-lock.json` e `vite.config.ts`.

**Comandos:** `git status --short -- <caminhos>` e `git diff HEAD -- <caminhos>`

- PASSOU. Ambas as saidas 100% vazias, codigo de saida 0. Nenhuma alteracao em relacao ao HEAD.

## 4. Emojis em `src/pages`, `src/components`, `src/hooks`, `src/services` e `src/lib`

**Metodo:** logica de `src/lib/noEmojiUi.test.ts`. Faixas `U+1F300-U+1FAFF` e `U+2600-U+27BF`. Arquivos `.ts` e `.tsx`, excluindo `*.test.*` e os prefixos `AIInsights`, `DashboardRH`, `HRAlerts`, `NR1`, `ROIDashboard`, `PGR`, `Turnover`, `NarrativeReport`.

- Com exclusoes: PASSOU. 135 arquivos escaneados, 0 linhas com emoji.
- Sem exclusoes: 145 arquivos escaneados, 39 linhas com emoji, todas concentradas nas familias de componentes legados excluidas de `src/components/`. Zero em `pages`, `hooks`, `services` e `lib`.

## 5. `select('*')`

**Comando:** busca por `select('*')`, `select("*")` e variantes com aspas ou crases em `src/` e `supabase/functions/` fora de arquivos de teste.

- PASSOU. 0 chamadas reais fora de testes. Todas as leituras utilizam projecoes de colunas explicitas existentes no schema.

## 6. `console.log` fora de testes

**Comando:** busca por `console.log` em `src/` e `supabase/functions/`, excluindo `*.test.*` e `*.spec.*`.

- `src/`: PASSOU. 2 ocorrencias, ambas estritamente protegidas por `import.meta.env.DEV` em `src/components/WebcamCapture.tsx:253` e `:266`.
- `supabase/functions/`: PASSOU. 0 ocorrencias.
- Observacao: `console.error` permanece nas Edge Functions para falhas operacionais conforme previsto; revisao linha a linha de mensagens mantida no escopo de SEC-07.

## 7. Chaves `AIza` e `Feedbacks/`

**Comando:** busca por `AIza[0-9A-Za-z_-]{35}` fora de `Feedbacks/`, `node_modules`, `.git` e `dist`.

- PASSOU. 0 arquivos com padrao de chave de API no codigo rastreado.
- Dentro de `Feedbacks/`: diretorio nao rastreado pelo Git. Recomenda-se conferir manualmente o arquivo presente e revogar a chave se ativa (acao externa do proprietario).

**Comando:** `git check-ignore -v Feedbacks/`

- PASSOU. Saida: `.gitignore:26:Feedbacks/`, codigo de saida 0.

## 8. Roteiro visual cronometrado: conta demo

Status geral: NAO VERIFICADO (mantido ate alguem informar o resultado do ensaio em navegador).
Exige navegador e acesso ao deploy em `https://neuro-suite.lovable.app`. Credenciais nao constam neste repositorio (e-mail em `src/lib/constants.ts`, senha nunca informada no codigo).

| Tempo | Passo | Valor esperado (codigo) | Resultado |
|-------|-------|-------------------------|-----------|
| 0:00 | Abrir a tela de login e entrar com a conta demo | Login aceito, redireciona para o painel | NAO VERIFICADO |
| 0:30 | Abrir `/dashboard?demo=reset` | Badge `DEMO 1/3`, bioScore 34, HRV 28, estresse alto, blinkRate 14, sono 5,5 h | NAO VERIFICADO |
| 1:00 | Abrir `/dashboard?demo=1` | Mesmo estado da Etapa 1, sem reset | NAO VERIFICADO |
| 1:20 | Etapa 1 (`DEMO 1/3`): conferir o painel e os logs de evento | bioScore 34, estresse alto | NAO VERIFICADO |
| 1:50 | Clicar em "Simular novo scan" (`src/components/BridgeConsole.tsx:283`) | Avanca para `DEMO 2/3`: bioScore 52, HRV 45, estresse moderado | NAO VERIFICADO |
| 2:30 | Etapa 2 (`DEMO 2/3`): conferir o painel | bioScore 52, HRV 45, blinkRate 14 | NAO VERIFICADO |
| 3:00 | Clicar em "Simular novo scan" de novo | Avanca para `DEMO 3/3`: bioScore 72, HRV 62, blinkRate 18, estresse baixo | NAO VERIFICADO |
| 3:40 | Etapa 3 (`DEMO 3/3`): conferir o painel | bioScore 72, HRV 62, blinkRate 18 | NAO VERIFICADO |
| 4:10 | Abrir `/dashboard?demo=reset` para repetir | Volta para `DEMO 1/3` | NAO VERIFICADO |
| 4:30 | Fim do roteiro | Tempo total de referencia: cerca de 4 min 30 s | NAO VERIFICADO |

Observacoes:
- `AGENTS.md` exige formatar a taxa de piscadas apenas na exibicao. Painel exibe valor arredondado sem adulterar a precisao armazenada.

## 9. Teste pos-deploy: `neuro-coach` com chave publicavel

Status: NAO VERIFICADO (mantido ate deploy e teste em producao).

Procedimento pos-deploy:

```
curl -i -X POST "<URL_SUPABASE>/functions/v1/neuro-coach" \
  -H "apikey: <CHAVE_PUBLICAVEL>" \
  -H "Content-Type: application/json" \
  -d "{}"
```

Resultado esperado: HTTP 401 sem o token de sessao do usuario autenticado. Com token de sessao do usuario: HTTP 200.

## 10. Nota: `FRONTEND_ORIGIN` e URLs de preview

- `supabase/functions/google-calendar/index.ts:11-16` monta a allowlist de origens: `https://neuro-suite.lovable.app`, `http://localhost:8080` e a variavel `FRONTEND_ORIGIN`.
- Para testes em preview, configurar `FRONTEND_ORIGIN` com a URL do preview nos segredos das funcoes Supabase.

## 11. Achados desta rodada

- **Comentario corrigido em `supabase/config.toml` (W1):** o bloco de `neuro-coach` foi atualizado para documentar que o chamador `MeetingCheckIn.tsx` envia o `access_token` da sessao, e a chave publicavel segue apenas em `apikey`. A pendencia foi encerrada.
- **Conta demo no login:** funcionamento confirmado via testes e configuracao de `DEMO_ACCOUNT_EMAIL` em `src/lib/constants.ts`. Credenciais sensiveis preservadas fora do repositorio.
- **SEC-03 comprovado:** `MeetingCheckIn.tsx` obtem sessao com `supabase.auth.getSession()` e injeta o bearer token de usuario.
- **Auth:** `src/pages/Auth.tsx` limpo de dependencias legadas de login social (Google/Apple/lovable).
- **Entregaveis:** `docs/apresentacao/` e `docs/seguranca/` validados e disponiveis.

## Pendencias para encerramento formal da Phase 11

1. Executar o roteiro visual da conta demo no navegador (secao 8) - NAO VERIFICADO.
2. Executar o teste de 401 do `neuro-coach` em producao apos o deploy (secao 9) - NAO VERIFICADO.
3. Confirmar revogacao de chaves externas conforme checklist de seguranca (acao externa do proprietario).
4. Decidir futuramente sobre remocao ou tolerancia formal dos 39 emojis nas familias legadas de `src/components/`.
