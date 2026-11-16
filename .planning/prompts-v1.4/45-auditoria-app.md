/gsd-verify-work Fase 45 do marco v1.4 (CrewVitals): auditoria do app logado em EN e PT. Rode por último, depois das fases 32 a 44 commitadas. Modo auditoria: não altere código de produção. Rode você mesmo cada comando; só marque PASSOU com evidência.

## Pré-condição

`git log --oneline -30` mostra os commits das fases 32 a 44 e `git status --short` está limpo. Se faltar fase, pare e liste.

## Verificações

1. Gates com saída real: `npm test -- --run`, `npx tsc --noEmit`, `npm run build`, `npx eslint src/i18n src/App.tsx src/pages/Dashboard.tsx src/components/AppSidebar.tsx src/components/BridgeConsole.tsx` (os erros antigos de `no-explicit-any` em `Dashboard.test.tsx` e `Profile.tsx` não contam, mas registre se aumentarem). Rode a suíte completa duas vezes: já houve falha intermitente no teste 10 do `Dashboard.test.tsx` sob carga.
2. Blindados: `git diff 99aee14..HEAD --stat -- src/integrations supabase/migrations package.json package-lock.json bun.lock bun.lockb vite.config.ts` vazio, sem dependência nova.
3. Segredos e dados pessoais: `git grep -n -i -E "AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{10,}|2000171[1]|professor[.]se"` vazio.
4. Provider único: `src/App.tsx` tem um só `LangProvider`, acima do `AuthProvider`, envolvendo todas as rotas; sem wrappers por rota. `/`, `/auth` e `/demo` seguem funcionando.
5. Seletor logado: `<LanguageToggle />` presente no cabeçalho de `Dashboard.tsx`; trocar o idioma atualiza títulos, barra lateral e cockpit sem recarregar (testes).
6. Cobertura de texto: `git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]" -- src/pages src/components src/hooks src/services src/lib ':!*.test.*' ':!src/components/ui' ':!src/i18n'` e classifique cada ocorrência restante: comentário, dado persistido, texto que ficou fora de propósito (IA, banco) ou defeito. Defeito = FALHOU com arquivo e linha. Confira em especial `src/lib/readiness.ts`, `demoScenario.ts` e `missionEvents.ts` (devem permanecer em português como dado) e que a tela os mapeia por idioma.
7. Paridade: o teste de `src/i18n/i18n.test.ts` passa com os namespaces `common`, `demo`, `predictive`, `landing`, `auth`, `dashboard`, `nav`, `cockpit`, `coach`, `missionlog`, `bioscore`, `checkin`, `wellness`, `insights`, `command`, `safety`, `integrations` e `account`; nenhum namespace repetido ou chave duplicada entre arquivos (`Object.assign` sobrescreve em silêncio: escreva uma checagem rápida que liste chaves duplicadas entre locales).
8. PT preservado: para 3 componentes grandes (`BridgeConsole`, `MissionLog`, `DailyCheckin`), compare o texto PT dos dicionários com o texto original (`git show 99aee14:<arquivo>`). Diferença não intencional é FALHOU.
9. Honestidade: nenhuma alegação nova em EN ou PT ("validated", "real-time", "certified", "clinical", "NASA"); ressalvas de DSS e de demonstração presentes. Alertas de rotatividade, conformidade legal (NR-1) e previsões continuam rotulados como demonstração ou estimativa.
10. Segurança preservada: os testes de origem e `state` do OAuth (`IntegrationsDashboard`) e de sessão ausente (`MeetingCheckIn`) passam; `useAuth` não mudou de lógica (`git diff` limitado a textos).
11. Dados persistidos: `git diff 99aee14..HEAD -- src/lib/missionEvents.ts src/integrations` sem mudança de chaves, tipos ou colunas; chaves de aba iguais (7 do `AGENTS.md`).
12. Responsividade: seletor e cabeçalho do Dashboard em 375 px (classes `flex-wrap`, alvo de 44 px); se houver navegador alcançável, confirme sem rolagem horizontal; senão NÃO VERIFICADO.
13. Fluxo real logado: o Chrome automatizado não alcançou `localhost` nas auditorias anteriores. Tente uma vez e, se falhar, deixe NÃO VERIFICADO e escreva o roteiro do dono: entrar com uma conta, alternar EN e PT no Dashboard, percorrer Cockpit, Contramedidas e Histórico de Voo nas duas línguas, conferir que nada de português sobrou em EN.

## Registro

Crie `docs/publicacao/UAT-v1.4.md` com a tabela de resultados reais, a lista de FALHOU (arquivo e linha), a lista do que ficou fora de propósito (IA, banco, `index.html`) e o roteiro de 3 minutos para o dono. Atualize `.planning/REQUIREMENTS.md`, `ROADMAP.md` e `STATE.md` só com o que tiver evidência.

## Entrega

Veredito por requisito I18N-13 a I18N-19 (PASSOU, FALHOU, NÃO VERIFICADO). Se achar defeito, não corrija: descreva e proponha o prompt cirúrgico. Commit só de `docs/publicacao/UAT-v1.4.md` e `.planning/**`: `docs(v1.4): auditoria do app logado em ingles e portugues`. Sem push.
