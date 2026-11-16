/gsd-quick Fase 37 do marco v1.4 (CrewVitals): BioScore, scan por webcam e cartão de bem-estar em EN e PT. Pode rodar já, em paralelo com as demais fases 32 a 44 (depende só do núcleo i18n da fase 21, que já existe).

## Contexto

Depois do login o app (`/dashboard` e demais telas) segue só em português e não tem seletor de idioma, porque no v1.3 o `LangProvider` cobriu apenas `/`, `/auth` e `/demo`. O v1.4 traduz a área logada para EN e PT. Esta fase cuida de: fluxo do BioScore: captura por webcam, progresso do scan, resultado e cartão de pontuação.

Leia antes: `.planning/prompts-v1.4/RULES.md` (método, testes, verificação e entrega: siga tudo), `.planning/prompts-v1.4/GLOSSARY-APP.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`.

## Arquivos exclusivos

- `src/components/features/NeuroScore/index.tsx`, `ScanProgress.tsx`, `ScanResult.tsx` e seus testes
- `src/components/NeuroScore.tsx`
- `src/components/WebcamCapture.tsx`
- `src/components/WellnessScoreCard.tsx`
- `src/components/PostScanActionPlan.tsx`
- `src/services/stressCalculator.ts` e `src/services/stressCalculator.test.ts` (textos exibidos; a lógica de cálculo não muda)
- `src/hooks/useWellnessScore.ts` e `src/hooks/useWellnessScore.test.ts` (rótulos exibidos)
- `src/i18n/locales/bioscore.ts`

Namespace do dicionário: `bioscore` (arquivo `src/i18n/locales/bioscore.ts`, chaves `bioscore.*`). Não edite nenhum arquivo fora desta lista; outros terminais cuidam do resto.

## Específico desta fase

1. Inclua mensagens de permissão de câmera, instruções de posicionamento, estados do scan, rótulos de HRV e piscadas (sempre como estimativa por webcam, nunca "medição"), classificações de estresse e textos do resultado.
2. Valores de estresse gravados no banco (`low`, `moderate`, `high`) e a lógica de pontuação não mudam; traduza só o que é exibido.
3. `WebcamCapture.tsx` tem `console.log` protegido por `import.meta.env.DEV`: não altere.
4. Piscadas continuam formatadas só na exibição (`roundBlinkRate`) e valores armazenados e limiares não mudam (`AGENTS.md`).

## Entrega

`.planning/phases/37-bioscore/PLAN.md` e `SUMMARY.md`. Commit só dos arquivos exclusivos: `feat(bioscore): bioscore e scan por webcam em ingles e portugues`. Sem push.
