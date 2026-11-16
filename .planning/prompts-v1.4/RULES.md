# Regras comuns dos prompts de tradução do app logado (v1.4)

Todo prompt do v1.4 segue estas regras. Leia antes de começar: `AGENTS.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `.planning/prompts-v1.4/GLOSSARY-APP.md`, `src/i18n/index.tsx`, `src/i18n/locales/demo.ts` (exemplo de dicionário).

## Contrato (já existe, não mude)

`useI18n()` devolve `{ lang, setLang, t }`; fora de `LangProvider` devolve português. Dicionários em `src/i18n/locales/<ns>.ts` exportando `en` e `pt`, chaves prefixadas por `<ns>.`, mesma lista de chaves nas duas línguas (teste de paridade em `src/i18n/i18n.test.ts`). Cada prompt escreve só no seu namespace e nos seus arquivos.

## Método

1. Inventarie todo texto visível dos seus arquivos: texto JSX, `placeholder`, `aria-label`, `title`, `alt`, rótulos de gráficos, toasts, mensagens de erro, textos vazios, textos montados dinamicamente e dados constantes no topo do módulo (arrays de abas, cartões, opções). Vá para o dicionário (`en` e `pt`).
2. O português precisa ficar **idêntico** ao atual (mesma acentuação, pontuação, caixa e interpolações). O inglês segue os dois glossários.
3. Arquivos de `lib`, `hooks` e `services` da sua lista: o português continua como padrão e a API existente continua compatível (parâmetro opcional `lang` ou `t`); liste os chamadores com `git grep` no SUMMARY e não mude lógica, tipos nem valores gravados.
4. Constantes de módulo com texto viram chaves resolvidas dentro do componente (`t(...)` no render) ou funções que recebem `t`. Não transforme módulos de lib em hooks sem necessidade; passe `t` ou `lang` como argumento.
5. Datas e números: use `lang === 'pt' ? 'pt-BR' : 'en-US'` em `toLocaleDateString`, `Intl.*` e formatos. Decimais: PT vírgula, EN ponto, onde o texto atual já formata.
6. Texto que vem do banco, de IA (respostas do coach, relatórios gerados) ou do `localStorage` não se traduz aqui: apenas o que a tela define. Registre no SUMMARY o que ficou fora.
7. Dados persistidos NUNCA mudam: nomes de colunas, chaves de `localStorage`, tipos de evento, rótulos gravados, chaves de aba (`bridge-console`, `neurocoach`, `mission-log` etc.), endpoints, nomes de schema (`AGENTS.md`).
8. Sem emojis, sem alegação nova (nada de "validado", "tempo real", "certificado", "clínico", "NASA"). Mantenha as ressalvas de DSS e de demonstração.

## Testes (AAA)

- Os testes existentes dos seus arquivos continuam passando sem alteração (sem provider, tudo em português).
- Acrescente testes com `<LangProvider initialLang="en">` e `initialLang="pt">` cobrindo os textos principais de cada tela ou componente; no EN, afirme que textos antigos em português não aparecem (`queryByText(...)` nulo).
- Rode o teste de paridade de `src/i18n/i18n.test.ts`.

## Verificação (cole a saída real no SUMMARY)

```bash
git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]" -- <seus arquivos de componente, sem testes>
npx eslint <seus arquivos e seu locale>
npm test -- --run
npx tsc --noEmit
npm run build
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```

O `git grep` só pode restar em comentários, em dados persistidos que você listou no SUMMARY e no próprio dicionário. Esperado: 0 falhas, tsc e build limpos, diff dos blindados vazio. Confira em 375 px que textos EN, geralmente mais curtos, e PT não estouram o layout.

## Entrega

`PLAN.md` curto antes e `SUMMARY.md` depois, em `.planning/phases/<número>-<nome>/`, com a lista de termos novos, o que ficou fora e as saídas reais. Commit só dos arquivos exclusivos (`git add <arquivos>` e `git commit <arquivos> -m "..."`), sem push. Não tocar: `src/integrations/supabase/**`, `supabase/migrations/**`, `package.json`, `package-lock.json`, `bun.lock*`, `vite.config.ts`, `.env*`. Sem dependência nova. Se outro terminal quebrar algo fora do seu escopo, registre sem corrigir.
