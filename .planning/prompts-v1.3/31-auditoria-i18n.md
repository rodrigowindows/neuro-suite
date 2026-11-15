/gsd-verify-work Fase 31 do marco v1.3 (CrewVitals): auditoria final da demo multilíngue. Rode por último. Modo auditoria: não altere código de produção.

## Contexto

Marco v1.3 entregou EN/PT no módulo `src/i18n/`, na `/demo`, no alerta preditivo, na landing, no login, no deck (PPTX e PDF), no roteiro de vídeo, no README e nos documentos de publicação. Auditorias anteriores erraram ao confiar em relatórios sem rodar os comandos: rode você mesmo cada verificação e só marque PASSOU com evidência. Leia antes: `AGENTS.md`, `.planning/prompts-v1.3/00-LEIA-ME.md`, `.planning/prompts-v1.3/GLOSSARY.md`, os `SUMMARY.md` das fases 21 a 30 e `docs/publicacao/UAT-v1.2.md` (formato PASSOU, FALHOU, NÃO VERIFICADO).

## Pré-condição

`git log --oneline -15` mostra os commits das fases 21 a 29 (e o da 30, se houve correção) e `git status --short` está limpo. Se faltar fase, pare e liste.

## Verificações

1. Gates com saída real: `npm test -- --run`, `npx tsc --noEmit`, `npm run build`, `npx eslint src/i18n src/pages/Demo.tsx src/pages/Index.tsx src/pages/Auth.tsx src/components/PredictiveAlert.tsx src/components/LanguageToggle.tsx src/App.tsx`.
2. Blindados: `git diff 99aee14..HEAD --stat -- src/integrations supabase/migrations package.json package-lock.json bun.lock bun.lockb vite.config.ts` vazio (sem dependência nova).
3. Segredos e dados pessoais: `git grep -n -i -E "AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{10,}|2000171[1]|professor[.]se"` em todo o repositório rastreado: saída vazia.
4. Escopo do idioma: `LangProvider` só envolve `/`, `/auth` e `/demo` em `src/App.tsx`; `/dashboard`, `/profile`, `/admin` e as demais rotas seguem em português e sem provider. Rode `src/pages/Dashboard.test.tsx`.
5. Zero rede em `/demo` nas duas línguas: `Demo.test.tsx` cobre `from`, `auth.getUser` e `functions.invoke` sem chamadas em EN e em PT. O log de rede real no navegador continua NÃO VERIFICADO se o Chrome automatizado não alcançar o `localhost`; tente `npm run preview` uma vez e, se falhar, deixe o passo para o dono.
6. Paridade e catálogo: o teste de paridade de `src/i18n/i18n.test.ts` passa para `common`, `demo`, `predictive`, `landing` e `auth`; nenhuma chave sem tradução; nenhum texto de interface ainda em português dentro de `Demo.tsx` e `PredictiveAlert.tsx` (busque acentos e palavras PT fora dos locales: `git grep -n -P "[áéíóúãõçÁÉÍÓÚÃÕÇ]" -- src/pages/Demo.tsx src/components/PredictiveAlert.tsx`).
7. Consistência demo x deck x vídeo, nas duas línguas: valores do cenário (34/14/5,5, 52/14/5,5, 72/18/5,5) em `CrewVitals-Demo-EN.pptx`, `-PT.pptx`, os PDFs, `VIDEO-SCRIPT-30S.en.md` e `ROTEIRO-VIDEO-30S.md`; 7 slides e 7 páginas em cada; `CrewVitals-Demo.pptx` e `.pdf` idênticos à versão EN (compare os hashes); texto extraído sem caracteres quebrados; páginas 4 e 7 de cada PDF renderizadas e sem corte. Todo botão citado nos roteiros existe em `Demo.tsx` nas respectivas línguas. Roteiros somam no máximo 30 s.
8. README: partes EN e PT presentes, links `?lang=en` e `?lang=pt`, sem emojis nos títulos, sem credenciais. Documentos de publicação: checklist EN e PT, `LINKS.md` bilíngue sem URL inventada, textos de submissão EN e PT.
9. Honestidade: nenhuma alegação nova em nenhuma língua; alerta preditivo rotulado como demonstração em EN e PT; selo "DEMO: simulated data" / "DEMO: dados simulados".
10. Responsividade: o seletor EN | PT cabe em 375 px na demo, landing e login (verifique classes de layout; se houver navegador, confirme sem rolagem horizontal).

## Registro

Crie `docs/publicacao/UAT-v1.3.md` com a tabela de resultados reais por verificação e um roteiro cronometrado de 90 s para o dono em janela anônima (`/demo?lang=en` até o fim, depois alternar para PT e repetir a etapa 1; DevTools, Network, filtro `supabase`, zero requisições). Itens que dependem de publicar no Lovable e hospedar arquivos ficam NÃO VERIFICADO. Atualize `.planning/REQUIREMENTS.md` (I18N-01 a I18N-12), `.planning/ROADMAP.md` e `.planning/STATE.md` só com o que tiver evidência.

## Entrega

Veredito por requisito, lista de FALHOU com arquivo e linha, lista de NÃO VERIFICADO. Se achar defeito, não corrija: descreva e proponha o prompt. Commit só de `docs/publicacao/UAT-v1.3.md` e `.planning/**`: `docs(v1.3): auditoria do marco multilingue`. Sem push.
