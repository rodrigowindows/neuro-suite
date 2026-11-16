/gsd-quick Fase 36 do marco v1.4 (CrewVitals): Histórico de Voo (MissionLog) em EN e PT. Pode rodar já, em paralelo com as demais fases 32 a 44 (depende só do núcleo i18n da fase 21, que já existe).

## Contexto

Depois do login o app (`/dashboard` e demais telas) segue só em português e não tem seletor de idioma, porque no v1.3 o `LangProvider` cobriu apenas `/`, `/auth` e `/demo`. O v1.4 traduz a área logada para EN e PT. Esta fase cuida de: tela de Histórico de Voo: linha do tempo de eventos, filtros, veredito do cockpit, estados vazios, datas.

Leia antes: `.planning/prompts-v1.4/RULES.md` (método, testes, verificação e entrega: siga tudo), `.planning/prompts-v1.4/GLOSSARY-APP.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `src/i18n/index.tsx`.

## Arquivos exclusivos

- `src/components/MissionLog.tsx` e `src/components/MissionLog.test.tsx`
- `src/i18n/locales/missionlog.ts`

Namespace do dicionário: `missionlog` (arquivo `src/i18n/locales/missionlog.ts`, chaves `missionlog.*`). Não edite nenhum arquivo fora desta lista; outros terminais cuidam do resto.

## Específico desta fase

1. Não altere `src/lib/missionEvents.ts`. Os eventos têm `type` (`scan`, `protocol`, `assessment`, `perceived_fatigue`), `label` e `metadata`. O `label` gravado é dado persistido e não muda. Para exibir em EN, derive o texto de `type` + `metadata` quando houver informação suficiente (veredito, BioScore, estresse, HRV) e use o `label` gravado como fallback para qualquer evento que você não consiga reconstruir. Documente no SUMMARY quais tipos foram traduzidos.
2. Datas e horas por idioma (`pt-BR` ou `en-US`); não use `formatEventDate` de `missionEvents.ts` se ele fixar o idioma: formate localmente por `lang`.
3. O prop `cockpitVerdict` chega do Dashboard como rótulo em português (`GO`, `ATENÇÃO`, `NO-GO`, `AGUARDANDO SCAN`): mapeie para o inglês de exibição sem alterar o prop.
4. Os 731 linhas de testes existentes continuam passando sem provider.

## Entrega

`.planning/phases/36-historico-voo/PLAN.md` e `SUMMARY.md`. Commit só dos arquivos exclusivos: `feat(missionlog): historico de voo em ingles e portugues`. Sem push.
