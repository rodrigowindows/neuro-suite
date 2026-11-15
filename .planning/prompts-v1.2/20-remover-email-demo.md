/gsd-quick Fase 20 (correção do v1.2, CrewVitals): tirar o e-mail da conta demo do bundle público.

## Defeito encontrado na reauditoria

`src/lib/constants.ts:5` exporta `DEMO_ACCOUNT_EMAIL = '20001711@professor.se.df.gov.br'`, um e-mail funcional de domínio de governo, que vai para o bundle JavaScript público e para o repositório público. No v1.1 a conta compartilhada servia ao login da demo. No v1.2 os juízes usam `/demo` (sem conta), então a constante não é mais necessária para a banca. O comentário do próprio arquivo já diz: "Vazio = recurso de conta demo inerte".

## Arquivos exclusivos

`src/lib/constants.ts`, `src/hooks/useReadiness.test.ts`, `src/pages/Dashboard.test.tsx` (somente os trechos que dependem da constante). Não toque em `useReadiness.ts` nem em outros arquivos. Leia antes: `AGENTS.md`, `src/hooks/useReadiness.ts` (uso de `DEMO_ACCOUNT_EMAIL`), os dois testes acima.

## O que fazer

1. Defina `DEMO_ACCOUNT_EMAIL = ''` em `constants.ts`, com o comentário atualizado: conta demo desativada, a demo pública fica em `/demo`.
2. Os testes que exercitam "conta demo força o cenário" (casos do v1.1) não podem depender de um e-mail real: faça-os mockar `@/lib/constants` com um e-mail fictício (por exemplo `demo@example.test`) via `vi.mock`, mantendo as asserções. Comportamento de `useReadiness` com constante vazia: usuário comum, nada muda (dados reais vencem).
3. Sem valor real da conta em nenhum arquivo de `src`, `docs`, `README.md`.
4. Não altere `src/integrations/**`, `package.json`, `vite.config.ts`. O fluxo normal de login continua igual.

## Verificação (cole a saída real no SUMMARY)

```bash
git grep -n -i -E "20001711|professor\.se" -- src docs README.md
npm test -- --run
npx tsc --noEmit
npm run build
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```

Esperado: `git grep` sem saída, 0 falhas, tsc e build limpos, diff dos blindados vazio.

## Ação do dono (fora do código)

O e-mail continua no histórico do git. Se a conta existir, troque a senha dela (`docs/seguranca/CHECKLIST-MANUAL.md`, seção 5) e avalie desativá-la, já que a banca não precisa mais dela.

## Entrega

`.planning/phases/20-remover-email-demo/PLAN.md` e `SUMMARY.md`. Commit só dos arquivos tocados: `fix(demo): remover e-mail da conta demo do bundle publico`. Sem push.
