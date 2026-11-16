/gsd-quick Fase 38 do marco v1.4 (CrewVitals): check-in diário, histórico, relatório e meditação em EN e PT. Pode rodar já, em paralelo com as demais fases 32 a 44 (depende só do núcleo i18n da fase 21, que já existe).

## Contexto

Depois do login o app (`/dashboard` e demais telas) segue só em português e não tem seletor de idioma, porque no v1.3 o `LangProvider` cobriu apenas `/`, `/auth` e `/demo`. O v1.4 traduz a área logada para EN e PT. Esta fase cuida de: avaliação de prontidão (check-in diário), histórico de check-ins, relatório em PDF, mini meditação e as bibliotecas de rótulos de sintomas e fadiga percebida.

Leia antes: `.planning/prompts-v1.4/RULES.md` (método, testes, verificação e entrega: siga tudo), `.planning/prompts-v1.4/GLOSSARY-APP.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`.

## Arquivos exclusivos

- `src/components/DailyCheckin.tsx` e `src/components/DailyCheckin.test.tsx`
- `src/components/CheckinHistory.tsx`
- `src/components/WellnessReportPDF.tsx` e `src/components/WellnessReportPDF.test.tsx`
- `src/components/MiniMeditation.tsx`
- `src/lib/symptoms.ts` e `src/lib/symptoms.test.ts`
- `src/lib/perceivedFatigue.ts` e `src/lib/perceivedFatigue.test.ts`
- `src/i18n/locales/checkin.ts`

Namespace do dicionário: `checkin` (arquivo `src/i18n/locales/checkin.ts`, chaves `checkin.*`). Não edite nenhum arquivo fora desta lista; outros terminais cuidam do resto.

## Específico desta fase

1. Em `symptoms.ts` e `perceivedFatigue.ts` os rótulos em português vêm de constantes. Mantenha as exportações e os valores PT atuais como padrão e acrescente forma de obter o rótulo por idioma (por exemplo uma função que recebe `lang` ou `t`), sem quebrar quem já importa (use `git grep` para listar os chamadores e registre no SUMMARY). Chaves e IDs de sintomas gravados no banco não mudam.
2. `WellnessReportPDF`: o texto do documento gerado segue o idioma ativo; nome do arquivo e formato de data por idioma. Nenhuma alegação clínica nova; mantenha a ressalva de apoio à decisão.
3. `MiniMeditation`: instruções guiadas e temporizadores em EN e PT.
4. Escalas, rótulos de humor e opções do formulário: traduza o texto exibido; valores enviados ao banco não mudam.

## Entrega

`.planning/phases/38-checkin/PLAN.md` e `SUMMARY.md`. Commit só dos arquivos exclusivos: `feat(checkin): check-in, historico, relatorio e meditacao em ingles e portugues`. Sem push.
