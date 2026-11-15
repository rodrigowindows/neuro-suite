/gsd-verify-work Fase 19 (reauditoria do v1.2, CrewVitals). Rode SOMENTE depois das fases 17 e 18 commitadas.

## Contexto

A auditoria anterior (`docs/publicacao/UAT-v1.2.md`, commit ee90361) marcou tudo como PASSOU. Uma verificação independente achou:
- números do deck e do vídeo divergentes da demo (corrigidos na fase 17);
- hook condicional que reprova no eslint (corrigido na fase 18);
- item 17 do UAT afirmando que `senha|password|AIza|sk-` em `docs README.md` deu "zero ocorrências", mas `docs/publicacao/CHECKLIST-PUBLICACAO.md` (linhas 128 e 130) e `docs/seguranca/` contêm essas palavras em instruções (não são segredos); o UAT deve descrever o resultado real do comando;
- título do README com emoji.

## Arquivos exclusivos

`docs/publicacao/UAT-v1.2.md`, `README.md` (somente tirar o emoji do título "Demonstração Pública"), `.planning/**`.

## Tarefas

1. Rode você mesmo, com saída real: `npm test -- --run`, `npx tsc --noEmit`, `npm run build`, `npx eslint src/hooks/useReadiness.ts src/pages/Demo.tsx`, e `git diff 99aee14..HEAD --stat -- src/integrations supabase/migrations package.json package-lock.json bun.lock bun.lockb vite.config.ts` (deve ser vazio).
2. Consistência deck x demo: para cada etapa, compare BioScore, piscadas/min e sono de `getDemoScenarioData` com os slides 3 e 4 (`python-pptx`), o PDF e `ROTEIRO-VIDEO-30S.md`. Qualquer divergência é FALHOU com arquivo e linha. Confirme que todo botão citado no vídeo existe em `src/pages/Demo.tsx`.
3. Acentuação: texto extraído do PPTX e do PDF com acentos corretos.
4. Segredos: `git grep -n -i -E "AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{10,}|20001711|professor\.se" -- docs README.md src` sem valor de segredo nem e-mail pessoal. Palavras como "senha" em instruções são aceitáveis; registre no UAT o resultado real de cada grep.
5. Navegador real: o Chrome automatizado não alcançou `localhost` na auditoria independente (página de erro de quadro), então o log de rede em `/demo` ficou NÃO VERIFICADO. Tente `npm run preview` e abra o endereço. Se persistir, mantenha NÃO VERIFICADO e deixe o passo no roteiro do dono: DevTools, aba Network, filtro `supabase`, esperado zero requisições ao abrir `/demo`.
6. Corrija `UAT-v1.2.md` com os resultados reais (troque os PASSOU que estavam errados), tire o emoji do título no README, e atualize `.planning/REQUIREMENTS.md` (PUB-07, PUB-08 e PUB-09 só marcados se a consistência passar) e `.planning/STATE.md`.

## Entrega

Veredito final por requisito PUB-01 a PUB-12 (PASSOU, FALHOU, NÃO VERIFICADO). Commit só de `docs/publicacao/UAT-v1.2.md`, `README.md` e `.planning/**`: `docs(v1.2): reauditoria apos correcoes`. Sem push.
