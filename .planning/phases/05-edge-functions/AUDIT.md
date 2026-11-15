# Auditoria de Edge Functions - Validação de usuário e chamadores

Escopo: `supabase/functions/*/index.ts`. Chamadores verificados por grep em `src/`.
Regra usada: `supabase.functions.invoke` envia o token de sessão do usuário (comportamento padrão do supabase-js quando há sessão). `fetch` com `VITE_SUPABASE_PUBLISHABLE_KEY` como Bearer NÃO envia a sessão.

| Função | Valida usuário | Chamador(es) em src/ | Envia sessão do usuário? | verify_jwt (config.toml) | Recomendação / estado |
|---|---|---|---|---|---|
| neuro-coach | Sim: getClaims + `isAuthenticatedClaims` (`index.ts:33`) | `integrations/MeetingCheckIn.tsx:50-56` (fetch) | Não: ainda envia publishable key como Bearer (`MeetingCheckIn.tsx:56`) | true | PENDENTE: trocar MeetingCheckIn para o `access_token` da sessão. Até lá a chamada recebe 401 |
| nr1-chatbot | Sim: `requireAuthenticatedUser` (`index.ts`, guarda compartilhada) | `NR1ComplianceChatbot.tsx:29,36` e hook `src/hooks/useStreamingChat.ts` (fetch) | Sim: hook envia `access_token` da sessão; publishable key só em `apikey`. Sem sessão não chama a função | true | Concluído |
| ai-insights | Sim: `requireAuthenticatedUser` | `AIInsightsDashboard.tsx:144`, `NR1Report.tsx:347`, `PGRReportGenerator.tsx:127`, `PostScanActionPlan.tsx:81`, `TurnoverPrediction.tsx:128` (invoke) | Sim | true | Concluído. Role de gestor não verificada |
| cognitive-fatigue | Sim: `requireAuthenticatedUser` | `CognitiveFatigueAnalyzer.tsx:77` (invoke) | Sim | true | Concluído |
| daily-checkin | Sim: `requireAuthenticatedUser` | `DailyCheckin.tsx:182` (invoke) | Sim | true | Concluído |
| narrative-report | Sim: `requireAuthenticatedUser` | `NarrativeReportGenerator.tsx:43` (invoke) | Sim | true | Concluído |
| proactive-alerts | Sim: getUser + checagem de papel gestor/admin | `HRAlerts.tsx:73` (invoke) | Sim | true | Já valida; não alterado nesta tarefa |
| sentiment-analysis | Sim: `requireAuthenticatedUser` | `DailyCheckin.tsx:117` (invoke) | Sim | true | Concluído |
| smart-breaks | Sim: `requireAuthenticatedUser` | `SmartBreakAssistant.tsx:94` (invoke) | Sim | true | Concluído |
| google-calendar | Não aplicável: `action=events` usa token do Google | `IntegrationsDashboard.tsx:56,100` (fetch) | Não | false | Mantido. Callback do Google e `action=events` não usam JWT do Supabase |

## Observações

- `requireAuthenticatedUser` (`supabase/functions/_shared/requireAuth.ts`) exige Bearer, `getClaims` sem erro e `isAuthenticatedClaims` (`_shared/claims.ts`): `role === 'authenticated'` e `sub` não vazio.
- `verify_jwt = true` no gateway continua valendo: usuário sem sessão recebe 401 antes de chegar à função.
- Pendente bloqueante: `MeetingCheckIn.tsx:56` envia a publishable key. Com `neuro-coach` em `verify_jwt = true`, esse fluxo falha até ser corrigido. O arquivo não está no escopo desta tarefa.
- `IntegrationsDashboard.tsx:100` chama `action=auth` sem `origin`. Com a mudança em `google-calendar`, essa chamada retorna 400 até o frontend enviar `origin=window.location.origin`.
- `neuro-coach` ainda tem validação inline (não usa `requireAuthenticatedUser`), porque estava fora da lista de arquivos desta tarefa. Pode migrar para a guarda compartilhada em tarefa futura.
