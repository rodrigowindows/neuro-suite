/gsd-quick Fase 35 do marco v1.4 (CrewVitals): Contramedidas (NeuroCoach) em EN e PT. Pode rodar já, em paralelo com as demais fases 32 a 44 (depende só do núcleo i18n da fase 21, que já existe).

## Contexto

Depois do login o app (`/dashboard` e demais telas) segue só em português e não tem seletor de idioma, porque no v1.3 o `LangProvider` cobriu apenas `/`, `/auth` e `/demo`. O v1.4 traduz a área logada para EN e PT. Esta fase cuida de: tela de Contramedidas: chat, seletor de tom, protocolo de respiração 4-7-8, mensagens iniciais e erros.

Leia antes: `.planning/prompts-v1.4/RULES.md` (método, testes, verificação e entrega: siga tudo), `.planning/prompts-v1.4/GLOSSARY-APP.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`.

## Arquivos exclusivos

- `src/components/features/NeuroCoach/index.tsx`
- `src/components/features/NeuroCoach/ChatInput.tsx`
- `src/components/features/NeuroCoach/ChatMessages.tsx`
- `src/components/features/NeuroCoach/ToneSelector.tsx`
- `src/components/features/NeuroCoach/NeuroCoach.test.tsx` e `ToneSelector.test.tsx`
- `src/services/coachService.ts` e `src/services/coachService.test.ts`
- `src/hooks/useStreamingChat.ts` e `src/hooks/useStreamingChat.test.ts`
- `src/i18n/locales/coach.ts`

Namespace do dicionário: `coach` (arquivo `src/i18n/locales/coach.ts`, chaves `coach.*`). Não edite nenhum arquivo fora desta lista; outros terminais cuidam do resto.

## Específico desta fase

1. Traduza tudo o que a tela define: título, subtítulos, botões, placeholders, nomes dos tons, passos e legendas do protocolo de respiração, mensagem de boas-vindas, estados de carregamento e erro.
2. As respostas geradas pela IA (edge function `neuro-coach`) e o `systemPrompt`/tom enviados ao backend NÃO mudam nesta fase: o idioma das respostas da IA continua português. Registre isso no SUMMARY como pendência de marco futuro (passar `lang` à função).
3. `coachService.ts` e `useStreamingChat.ts`: traduza só mensagens de erro e fallback que aparecem na tela. O prompt de sistema e os parâmetros enviados à edge função NÃO mudam.
4. `autoStartBreathing` e o fluxo de `onStartProtocol` não mudam.

## Entrega

`.planning/phases/35-neurocoach/PLAN.md` e `SUMMARY.md`. Commit só dos arquivos exclusivos: `feat(coach): contramedidas em ingles e portugues`. Sem push.
