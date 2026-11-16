/gsd-quick Fase 34 do marco v1.4 (CrewVitals): cockpit (BridgeConsole) e widgets de status em EN e PT. Pode rodar já, em paralelo com as demais fases 32 a 44 (depende só do núcleo i18n da fase 21, que já existe).

## Contexto

Depois do login o app (`/dashboard` e demais telas) segue só em português e não tem seletor de idioma, porque no v1.3 o `LangProvider` cobriu apenas `/`, `/auth` e `/demo`. O v1.4 traduz a área logada para EN e PT. Esta fase cuida de: semáforo de prontidão, três números, ação primária, log de eventos recentes, status da missão, conexão (Uplink Terra / Modo Autônomo) e banner de estresse.

Leia antes: `.planning/prompts-v1.4/RULES.md` (método, testes, verificação e entrega: siga tudo), `.planning/prompts-v1.4/GLOSSARY-APP.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`.

## Arquivos exclusivos

- `src/components/BridgeConsole.tsx` e `src/components/BridgeConsole.test.tsx`
- `src/components/MissionStatusWidget.tsx`
- `src/components/ConnectionStatusWidget.tsx` e `src/components/ConnectionStatusWidget.test.tsx`
- `src/components/StressAlertBanner.tsx`
- `src/lib/downlink.ts` e `src/lib/downlink.test.ts` (textos do outbox e da conexão; PT continua como padrão)
- `src/i18n/locales/cockpit.ts`

Namespace do dicionário: `cockpit` (arquivo `src/i18n/locales/cockpit.ts`, chaves `cockpit.*`). Não edite nenhum arquivo fora desta lista; outros terminais cuidam do resto.

## Específico desta fase

1. Não altere `src/lib/readiness.ts` nem `useReadiness.ts`: eles devolvem rótulos em português. Mapeie `readiness.state` (`go`, `caution`, `nogo`, `unknown`) para chaves do seu dicionário, com PT idêntico ao que a tela mostra hoje e EN do glossário (`GO - FIT FOR SHIFT`, `CAUTION - WATCH`, `NO-GO - FATIGUE (NOT FIT)`, `AWAITING SCAN`). Se a tela exibir `readiness.headline`, mapeie por estado também.
2. Ações primárias: "Iniciar Turno", "Iniciar Protocolo 4-7-8", "Reavaliar com BioScore", "Realizar BioScore", "Simular novo scan" (modo demo) em EN conforme glossário.
3. Log de eventos: os rótulos gravados em `localStorage` são dados persistidos e continuam como foram gravados. Traduza apenas o que a tela define (título, selo DEMO, tempo relativo, mensagem vazia) e as mensagens do cenário demo por `id` (`demo-log-1..3`, como em `Demo.tsx` e `locales/demo.ts`; reutilize os textos, mas nas suas próprias chaves).
4. `ConnectionStatusWidget`: textos, toasts do `sonner` (disparo único continua), formatação de horário por idioma.
5. `PredictiveAlert` já está traduzido (fase 23); não mexa.
6. Os 712 linhas de testes de `BridgeConsole.test.tsx` continuam passando sem provider.

## Entrega

`.planning/phases/34-cockpit/PLAN.md` e `SUMMARY.md`. Commit só dos arquivos exclusivos: `feat(cockpit): cockpit e widgets de status em ingles e portugues`. Sem push.
