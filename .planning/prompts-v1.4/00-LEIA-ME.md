# Marco v1.4: App logado em EN e PT

Problema: depois do login (`/dashboard` e demais telas) não há seletor de idioma e tudo continua em português. No v1.3 o `LangProvider` ficou só em `/`, `/auth` e `/demo` (decisão de escopo). Pôr só o botão seria enganoso (nada mudaria), então o v1.4 traduz a área logada e liga um provider global.

Dependência única: o núcleo i18n da fase 21 (já commitado). Nenhuma das fases 32 a 44 depende de outra: todas podem rodar ao mesmo tempo, cada uma com arquivos exclusivos e seu próprio dicionário `src/i18n/locales/<ns>.ts`. Sem provider (testes existentes) tudo continua em português.

## Terminais (abra quantos quiser; todos em paralelo)

| Fase | Prompt | Área | Namespace | Prioridade |
|---|---|---|---|---|
| 32 | `32-shell-dashboard.md` | Provider global, botão EN/PT no Dashboard, títulos, `DashboardContent`, modal, banner | `dashboard` | Alta |
| 33 | `33-navegacao.md` | Barra lateral e abas | `nav` | Alta |
| 34 | `34-cockpit.md` | Cockpit, status, conexão, banner de estresse, downlink | `cockpit` | Alta |
| 35 | `35-neurocoach.md` | Contramedidas (chat, tom, respiração) | `coach` | Alta |
| 36 | `36-historico-voo.md` | Histórico de Voo | `missionlog` | Alta |
| 37 | `37-bioscore.md` | BioScore, webcam, resultado, plano pós-scan | `bioscore` | Alta |
| 38 | `38-checkin.md` | Check-in, histórico, PDF, meditação, sintomas | `checkin` | Alta |
| 39 | `39-bem-estar.md` | Disciplina, pausas, carga, liderança | `wellness` | Média |
| 40 | `40-insights-alertas.md` | IA Insights, alertas, ROI | `insights` | Média |
| 41 | `41-painel-comando.md` | Painel de Comando e indicadores | `command` | Média |
| 42 | `42-seguranca-relatorios.md` | Segurança de Missão, relatórios, chatbot | `safety` | Média |
| 43 | `43-integracoes.md` | Integrações | `integrations` | Média |
| 44 | `44-conta-mensagens.md` | Perfil, senha, admin, 404, toasts de autenticação, validações | `account` | Alta |
| 45 | `45-auditoria-app.md` | Auditoria final (só depois de 32 a 44) | n/a | Última |

Se quiser o mínimo para o fluxo que um revisor vê logado: 32, 33, 34, 35, 36, 37, 38 e 44. As demais (39 a 43) são telas de gestão e secundárias, mas sem elas o app fica com idiomas misturados nessas telas. Não publique no Lovable com fases pela metade.

## Mapa de arquivos exclusivos

Cada fase lista seus arquivos no próprio prompt (seção "Arquivos exclusivos"). Nenhum arquivo aparece em duas fases: `App.tsx` é só da 32; `useAuth.tsx` e `validations.ts` só da 44; `coachService.ts` e `useStreamingChat.ts` só da 35; `downlink.ts` só da 34; `useFeatureScores.tsx` só da 33.

Fora do escopo do v1.4 (registrar como pendência): respostas da IA (coach, chatbot, relatórios gerados), prompts de sistema enviados às edge functions, textos que vêm do banco, e `index.html` (título e descrição ainda em português; arquivo fora das listas).

## Regras comuns

Estão em `RULES.md` (método, testes, verificação, commit). Glossário complementar em `GLOSSARY-APP.md`. Blindados do Lovable intactos, sem dependência nova, sem push, commit só dos arquivos exclusivos.
