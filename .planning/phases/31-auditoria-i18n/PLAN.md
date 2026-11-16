# Plano da Fase 31 — Auditoria Final da Demo Multilíngue (Marco v1.3 CrewVitals)

## Objetivo
Auditoria final de fechamento técnico e documental do Marco v1.3 (Demo Multilíngue EN/PT do CrewVitals) para a submissão bilíngue da NASA Space Apps Challenge, com emissão do relatório oficial `docs/publicacao/UAT-v1.3.md`, sem alterar nenhuma linha de código de produção.

## Escopo
- Arquivos exclusivos a criar/modificar:
  - `docs/publicacao/UAT-v1.3.md`
  - `.planning/REQUIREMENTS.md`
  - `.planning/ROADMAP.md`
  - `.planning/STATE.md`
  - `.planning/phases/31-auditoria-i18n/PLAN.md`
  - `.planning/phases/31-auditoria-i18n/SUMMARY.md`

## Verificações Obrigatórias
1. **Gates de Qualidade**: `npm test -- --run` (52 arquivos / 599 testes), `npx tsc --noEmit`, `npm run build`, `npx eslint`.
2. **Blindagem Lovable**: `git diff 99aee14..HEAD --stat` estritamente vazio nos arquivos protegidos.
3. **Segredos e Privacidade**: `git grep` para tokens/chaves e e-mails pessoais com saída vazia.
4. **Isolamento de Escopo do i18n**: `LangProvider` restrito a `/`, `/auth` e `/demo`; rotas internas (`Dashboard`) 100% em português.
5. **Zero Rede na `/demo`**: `Demo.test.tsx` aprovado para EN e PT sem qualquer chamada Supabase.
6. **Consistência Demo x Deck x Vídeo**: Valores (34/14/5,5; 52/14/5,5; 72/18/5,5), exatamente 7 slides e 7 páginas, hashes idênticos para EN vs sem sufixo, roteiros em 30s.
7. **README e Publicação**: Presença dos parâmetros `?lang=en` e `?lang=pt`, ausência de emojis nos títulos e tabelas sem URLs inventadas.
8. **Responsividade Mobile**: Layout de 375px compatível com `LanguageToggle` sem rolagem horizontal.
9. **Emissão de Documentação e Roteiro de 90s**: Geração do `UAT-v1.3.md` e atualização do tracking do GSD.
