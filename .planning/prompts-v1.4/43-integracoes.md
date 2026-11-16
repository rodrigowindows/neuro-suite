/gsd-quick Fase 43 do marco v1.4 (CrewVitals): Integrações (Calendar, check-in de reunião) em EN e PT. Pode rodar já, em paralelo com as demais fases 32 a 44 (depende só do núcleo i18n da fase 21, que já existe).

## Contexto

Depois do login o app (`/dashboard` e demais telas) segue só em português e não tem seletor de idioma, porque no v1.3 o `LangProvider` cobriu apenas `/`, `/auth` e `/demo`. O v1.4 traduz a área logada para EN e PT. Esta fase cuida de: tela de Integrações, cartões de plataformas e check-in de reunião.

Leia antes: `.planning/prompts-v1.4/RULES.md` (método, testes, verificação e entrega: siga tudo), `.planning/prompts-v1.4/GLOSSARY-APP.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`.

## Arquivos exclusivos

- `src/components/IntegrationsDashboard.tsx`
- `src/components/integrations/PlatformCards.tsx`
- `src/components/integrations/MeetingCheckIn.tsx`
- seus testes existentes
- `src/components/integrations/ProductivityInsights.tsx`
- `src/components/integrations/IntegrationMetrics.tsx`
- `src/i18n/locales/integrations.ts`

Namespace do dicionário: `integrations` (arquivo `src/i18n/locales/integrations.ts`, chaves `integrations.*`). Não edite nenhum arquivo fora desta lista; outros terminais cuidam do resto.

## Específico desta fase

1. Cuidado com a lógica de segurança do v1.1: o receptor do OAuth valida `event.origin` e `state`, e `MeetingCheckIn` envia o token da sessão. NÃO altere nada disso; traduza só textos de interface e mensagens de toast.
2. Nomes de produtos (Google Calendar, Zoom, Teams etc.) não se traduzem.
3. Os testes de origem, `state` e sessão ausente continuam passando sem provider.

## Entrega

`.planning/phases/43-integracoes/PLAN.md` e `SUMMARY.md`. Commit só dos arquivos exclusivos: `feat(integracoes): integracoes em ingles e portugues`. Sem push.
