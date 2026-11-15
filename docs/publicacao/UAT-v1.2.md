# UAT do Marco v1.2: Reauditoria Formal da Demo Pública sem Login (Pós-Fases 17 e 18)

**Data da execução:** 2026-11-15  
**Escopo:** Requisitos PUB-01 a PUB-12 (`.planning/REQUIREMENTS.md`) e Reauditoria da Fase 19  
**Repositório:** `https://github.com/rodrigowindows/neuro-suite`  
**URL de Produção Esperada:** `https://neuro-suite.lovable.app/demo`  
**Legenda:** PASSOU, FALHOU, NÃO VERIFICADO  

Este relatório consolida a reauditoria técnica formal e independente após a aplicação das rodadas de correção das Fases 17 (correção de métricas, botões e acentuação no deck e vídeo) e 18 (desacoplamento de hook de convidado `useGuestDemoReadiness`, eliminação de violações de rules-of-hooks no ESLint e acréscimo de teste de consistência).

---

## Resumo Executivo da Reauditoria

| # | Verificação | Evidência / Comando | Resultado |
|---|-------------|---------------------|-----------|
| 1 | Pré-condição: Commits das fases 12 a 15, 17 e 18 | `git log --oneline -7` | PASSOU |
| 2 | Gates: Suíte Completa de Testes Unitários e Integração | `npm test -- --run` (50 arquivos, 562 testes) | PASSOU |
| 3 | Gates: Checagem de Tipagem Estática TypeScript | `npx tsc --noEmit` (código de saída 0, 0 erros) | PASSOU |
| 4 | Gates: Compilação de Produção | `npm run build` (código de saída 0, 17.56s) | PASSOU |
| 5 | Gates: Análise Estática de Código (ESLint) | `npx eslint src/hooks/useReadiness.ts src/pages/Demo.tsx` (0 erros) | PASSOU |
| 6 | Blindagem Lovable (zero alteração em arquivos protegidos desde a base de domingo) | `git diff 99aee14..HEAD --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts` (saída estritamente vazia) | PASSOU |
| 7 | Prova de Zero Login: `/demo` acessível sem sessão | `src/App.tsx` e `src/pages/Demo.tsx` (fora de ProtectedRoute) | PASSOU |
| 8 | Prova de Zero Rede: ausência total de chamadas Supabase | `Demo.test.tsx` (0 `from`, 0 `getUser`, 0 `functions.invoke`) | PASSOU |
| 9 | Transparência: Selo "DEMO: dados simulados" permanente | `src/pages/Demo.tsx:60` (`data-testid="demo-fixed-seal"`) | PASSOU |
| 10 | Transparência: Alerta preditivo rotulado como demonstração | `PredictiveAlert.tsx` com badge "Demonstração" e disclaimer DSS | PASSOU |
| 11 | Precisão Numérica: Piscadas/min formatadas só na exibição | `roundBlinkRate(readiness.blinkRate)` na camada de exibição (`src/lib/biometricDisplay.ts`) | PASSOU |
| 12 | Consistência de Dados Deck x Demo | Comparação `src/lib/demoScenario.ts` vs slides 3 e 4 (PPTX e PDF) e `ROTEIRO-VIDEO-30S.md` | PASSOU |
| 13 | Botões Reais da Demo no Roteiro de Vídeo | Confirmação dos botões em `src/pages/Demo.tsx` (`Iniciar Protocolo 4-7-8`, `Simular novo scan`, `Iniciar Turno`, `Reiniciar demonstração`) | PASSOU |
| 14 | Integridade de Acentos UTF-8 no Material da Banca | Extração de texto de `CrewVitals-Demo.pptx`, `CrewVitals-Demo.pdf` e `ROTEIRO-VIDEO-30S.md` com acentuação correta | PASSOU |
| 15 | Deck da Banca: Exatamente 7 slides sem credenciais | `python-pptx` confirmou `len(prs.slides) == 7` em `CrewVitals-Demo.pptx` | PASSOU |
| 16 | PDF da Banca: Exatamente 7 páginas | `fitz`/`pymupdf` confirmou `len(doc) == 7` em `CrewVitals-Demo.pdf` | PASSOU |
| 17 | Roteiro de Vídeo: Duração rigorosamente <= 30 segundos | `docs/apresentacao/ROTEIRO-VIDEO-30S.md` soma 30s (5s + 7s + 7s + 8s + 3s) | PASSOU |
| 18 | Higiene e Segredos: Ausência de tokens/chaves reais e e-mails pessoais | `git grep -n -i -E "AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{10,}|20001711|professor\.se" -- docs README.md src` | FALHOU (e-mail da conta demo em `src/lib/constants.ts:5`; ver 6.1 e fase 20) |
| 19 | Higiene e Segredos: Análise real de termos "senha/password" em documentação | `git grep -n -i -E "senha|password|AIza|sk-" -- docs README.md` (10 ocorrências puramente informativas/instrucionais) | PASSOU |
| 20 | Remoção de Emoji Residual no Título do README.md | `## Demonstração Pública (Acesso sem Login)` (sem emoji de foguete) | PASSOU |
| 21 | Roteiro de Publicação e Links Públicos | `docs/publicacao/CHECKLIST-PUBLICACAO.md` e `LINKS.md` estruturados | PASSOU |
| 22 | Captura de Rede do Navegador Automatizado (Zero Requisições Supabase em `/demo`) | No ambiente CI/sandbox, o navegador headless não alcançou o host local; mantido como verificação do dono | NÃO VERIFICADO |
| 23 | Ensaio Visual Real em Janela Anônima em Produção | Depende de deploy no Lovable e execução pelo dono | NÃO VERIFICADO |
| 24 | Validação dos Links Definitivos na Submissão da Banca | Depende do upload dos arquivos pelo dono e preenchimento de `LINKS.md` | NÃO VERIFICADO |

---

## 1. Pré-condição dos Commits do Marco v1.2 e Correções

**Comando:** `git log --oneline -7`

```
9c70ed3 fix(demo): hook de convidado separado, sem hook condicional
c5c69bf fix(apresentacao): numeros reais da demo, botoes reais e acentuacao
ee90361 docs(v1.2): auditoria e UAT da demo sem login
53ac4b7 feat(demo): rota publica /demo sem login e sem rede
105c8a0 feat(landing): atalho para demonstracao sem login
e2810c1 docs(apresentacao): deck de 7 slides e roteiro de video 30s sem login
52a0a40 docs(publicacao): checklist de links publicos sem login
```

- **Fase 12 (`53ac4b7`):** Rota pública `/demo` sem login e sem rede.
- **Fase 13 (`105c8a0`):** Portas de entrada na Landing Page (`Index.tsx`) e login (`Auth.tsx`).
- **Fase 14 (`e2810c1`):** Deck de 7 slides e roteiro de vídeo inicial.
- **Fase 15 (`52a0a40`):** Checklist de publicação e tabela de links.
- **Fase 16 (`ee90361`):** Primeira auditoria e documentação UAT v1.2.
- **Fase 17 (`c5c69bf`):** Correção do deck (`CrewVitals-Demo.pptx`, `.pdf`), gerador Python e roteiro de vídeo: números reais alinhados a `demoScenario.ts`, botões reais de tela, remoção de métricas não exibidas (HRV na tela da demo) e restauração integral da acentuação UTF-8.
- **Fase 18 (`9c70ed3`):** Desacoplamento do hook de convidado `useGuestDemoReadiness`, remoção do hook condicional em `useReadiness`, ajuste de testes unitários e acréscimo de teste AAA de consistência das 3 etapas em `Demo.test.tsx`.
- **Resultado:** PASSOU.

---

## 2. Gates Técnicos de Qualidade

### 2.1 Testes Automatizados (Vitest)
**Comando:** `npm test -- --run`

```
 Test Files  50 passed (50)
      Tests  562 passed (562)
   Start at  18:26:25
   Duration  22.58s (transform 8.02s, setup 42.40s, import 80.36s, tests 30.30s, environment 203.88s)
```
- **Resultado:** PASSOU. 50 arquivos de teste aprovados, 562 testes aprovados (1 teste a mais que a fase 16, correspondente à validação AAA das 3 etapas de `Demo.test.tsx`). Zero falhas.

### 2.2 Verificação de Tipos TypeScript
**Comando:** `npx tsc --noEmit`

- **Resultado:** PASSOU. Código de saída 0, zero erros de compilação.

### 2.3 Compilação de Produção (Vite)
**Comando:** `npm run build`

```
vite v5.4.19 building for production...
✓ 3111 modules transformed.
dist/index.html                                     2.18 kB │ gzip:   0.82 kB
dist/assets/index-DchgkCoD.css                    100.13 kB │ gzip:  16.90 kB
dist/assets/index-R934KXu7.js                     858.05 kB │ gzip: 256.67 kB
✓ built in 17.56s
```
- **Resultado:** PASSOU. Código de saída 0, bundle gerado com sucesso em 17.56s.

### 2.4 Análise Estática de Código (ESLint)
**Comando:** `npx eslint src/hooks/useReadiness.ts src/pages/Demo.tsx`

- **Resultado:** PASSOU. Código de saída 0, zero erros e zero warnings. As violações de `react-hooks/rules-of-hooks` decorrentes do antigo branching condicional foram resolvidas pela separação explícita de `useGuestDemoReadiness` (usado por `Demo.tsx`) e `useReadiness` (usado pelo cockpit padrão).

---

## 3. Integridade dos Arquivos Blindados Lovable

**Comando:**
```bash
git diff 99aee14..HEAD --stat -- src/integrations supabase/migrations package.json package-lock.json bun.lock bun.lockb vite.config.ts
```

- **Resultado:** PASSOU. Saída estritamente vazia (código de saída 0).
- Nenhuma dependência externa adicionada em `package.json` ou `package-lock.json`.
- Nenhum schema, migration ou cliente Supabase gerado foi tocado desde a base de domingo (`99aee14`).

---

## 4. Consistência Deck x Roteiro x Código (PUB-03, PUB-04, PUB-07, PUB-08, PUB-09)

### 4.1 Tabela de Verdade por Etapa

| Etapa | Estado | BioScore | Piscadas/min (tela) | Sono (tela) | HRV (bastidores) | Ação Primária / Botão Real |
|---|---|---|---|---|---|---|
| **Etapa 1: Abertura** | NO-GO | 34 | 14 | 5,5 h | 28 ms | Botão primário vermelho: `'Iniciar Protocolo 4-7-8'` |
| **Etapa 2: Recuperação** | ATENÇÃO | 52 | 14 | 5,5 h | 45 ms | Botão primário âmbar: `'Simular novo scan'` |
| **Etapa 3: Estabilização** | GO | 72 | 18 | 5,5 h | 62 ms | Botão primário verde: `'Iniciar Turno'` |

- **Header Fixo:** Contém os botões auxiliares `'Simular novo scan'` e `'Reiniciar demonstração'`.
- **Validação de Código (`src/lib/demoScenario.ts`):**
  - Etapa 1: `bioScore: 34`, `blinkRate: 14`, `horasSono: 5.5`, `hrvValue: 28`, `stressLevel: 'high'` (NO-GO).
  - Etapa 2: `bioScore: 52`, `blinkRate: 14`, `horasSono: 5.5`, `hrvValue: 45`, `stressLevel: 'moderate'` (ATENÇÃO).
  - Etapa 3: `bioScore: 72`, `blinkRate: 18`, `horasSono: 5.5`, `hrvValue: 62`, `stressLevel: 'low'` (GO).
- **Validação de Exibição (`src/pages/Demo.tsx`):**
  - Exibe exclusivamente os 3 números da interface: BioScore, Piscadas/min (inteiras via `roundBlinkRate`) e Horas de Sono (`${horasSono}h`).
  - O HRV não é renderizado na tela de `/demo` (atua exclusivamente no cálculo fisiológico dos bastidores), eliminando qualquer divergência entre o que o deck promete e o que a tela mostra.
- **Validação de Botões:**
  - `src/pages/Demo.tsx:81`: `'Simular novo scan'` (header)
  - `src/pages/Demo.tsx:91`: `'Reiniciar demonstração'` (header)
  - `src/pages/Demo.tsx:212`: `'Iniciar Turno'` (ação primária GO)
  - `src/pages/Demo.tsx:220`: `'Simular novo scan'` (ação primária ATENÇÃO)
  - `src/pages/Demo.tsx:229`: `'Iniciar Protocolo 4-7-8'` (ação primária NO-GO)
  - Nenhum botão fictício como "Registrar Execucao de Contramedidas" é citado no roteiro.
- **Validação no Deck (`CrewVitals-Demo.pptx` e `CrewVitals-Demo.pdf`):**
  - Slide 3 descreve os 3 números essenciais (BioScore, taxa de piscadas e sono) com nota explícita: "O HRV atua nos bastidores do cálculo".
  - Slide 4 apresenta a tabela exata com os valores 34/14/5,5, 52/14/5,5 e 72/18/5,5, referenciando os botões reais correspondentes.
- **Validação no Roteiro de Vídeo (`docs/apresentacao/ROTEIRO-VIDEO-30S.md`):**
  - Cenas 2 a 4 narram rigorosamente os valores e botões reais. Cronometragem totaliza 30 segundos (5 + 7 + 7 + 8 + 3s).
- **Resultado:** PASSOU.

---

## 5. Integridade de Acentuação UTF-8

A verificação automatizada via `python-pptx` e `fitz`/`pymupdf` confirmou a integridade dos acentos em todos os materiais:
- Termos auditados no PPTX e PDF: `"Saúde"`, `"Tripulação"`, `"Decisão"`, `"missões"`, `"duração"`, `"Condições"`, `"vigilância"`, `"reação"`, `"Semáforo"`, `"ATENÇÃO"`, `"respiratório"`, `"rápida"`, `"Demonstração"`, `"estabilização"`, `"Padrão"`, `"Privacidade"`, `"Segurança"`.
- Zero ocorrências de caracteres corrompidos (mojibake) ou supressão artificial de acentos ("Saude", "Tripulacao").
- **Resultado:** PASSOU.

---

## 6. Higiene e Varredura de Segredos

### 6.1 Varredura de Tokens Reais e E-mails Pessoais
**Comando:**
```bash
git grep -n -i -E "AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{10,}|20001711|professor\.se" -- docs README.md src
```
- **Resultado Real:**
  - `src/lib/constants.ts:5:export const DEMO_ACCOUNT_EMAIL = '20001711@professor.se.df.gov.br';`
  - Zero ocorrências em `docs/` e `README.md`.
  - A ocorrência em `src/` é o e-mail funcional da conta compartilhada do v1.1 (domínio de governo), presente no bundle público e no repositório. No v1.2 a banca usa `/demo` e não precisa dessa conta. Resultado do critério "sem e-mails pessoais": FALHOU. Correção: `.planning/prompts-v1.2/20-remover-email-demo.md`. Troca de senha da conta: `docs/seguranca/CHECKLIST-MANUAL.md`, seção 5.
  - Zero chaves `AIza` ou tokens `sk-` encontrados em todo o repositório rastreado.

### 6.2 Análise Transparente de Ocorrências de "senha" e "password"
**Comando:**
```bash
git grep -n -i -E "senha|password|AIza|sk-" -- docs README.md
```
- **Resultado Real (10 linhas retornadas):**
  1. `README.md:19`: Afirmação negativa: "Demonstração operacional imediata sem exigência de login, senha, cadastro..."
  2. `docs/publicacao/CHECKLIST-PUBLICACAO.md:5`: Afirmação negativa: "zero login, zero senha, zero solicitação de cadastro..."
  3. `docs/publicacao/CHECKLIST-PUBLICACAO.md:111`: Critério de pronto: "Nenhuma chave de API, senha, e-mail pessoal..."
  4. `docs/publicacao/CHECKLIST-PUBLICACAO.md:120`: Instrução de gravação: "...nenhuma aba visível com e-mail pessoal, dashboards corporativos ou senhas."
  5. `docs/publicacao/CHECKLIST-PUBLICACAO.md:128`: Instrução técnica de checagem: "Confirme a ausência de chaves AIza e senhas..."
  6. `docs/publicacao/CHECKLIST-PUBLICACAO.md:130`: Comando documentado: `git grep -n -i "AIza"`
  7. `docs/publicacao/CHECKLIST-PUBLICACAO.md:131`: Comando documentado: `git grep -n -i "password\s*=\|senha\s*="`
  8. `docs/publicacao/CHECKLIST-PUBLICACAO.md:133`: Critério: "A busca deve retornar zero chaves ou senhas em texto puro."
  9. `docs/publicacao/LINKS.md:25`: Afirmação negativa: "não exige login, cadastro, senha..."
  10. `docs/publicacao/UAT-v1.2.md`: Registro da própria tabela e comandos de auditoria.
- **Conclusão:** Todas as ocorrências são estritamente instrucionais ou menções de negação de requisito ("sem senha"). Zero credenciais ou segredos em texto claro.
- **Resultado:** PASSOU.

---

## 7. Higiene Visual e Títulos (PUB-04, PUB-11)

1. **Remoção de Emojis no Título do README.md:**
   - O título foi limpo de `## 🚀 Demonstração Pública (Acesso sem Login)` para `## Demonstração Pública (Acesso sem Login)`.
2. **Varredura de Emojis na Interface:**
   - O teste `src/lib/noEmojiUi.test.ts` foi executado e aprovado com sucesso, garantindo ausência de emojis nos componentes de `/demo`, `/`, `/auth` e cabine operacional.
- **Resultado:** PASSOU.

---

## 8. Prova de Zero Login e Zero Rede (PUB-01 e PUB-02)

1. **Rota Desprotegida:** `src/App.tsx` registra `<Route path="/demo" element={<Demo />} />` de forma aberta, sem wrapper `<ProtectedRoute>`.
2. **Hook Desacoplado:** `src/pages/Demo.tsx` utiliza `useGuestDemoReadiness()` exportado por `src/hooks/useReadiness.ts`, eliminando chamadas a `useAuth()`, `useWellnessScore()`, `supabase.from()` e `supabase.functions.invoke()`.
3. **Verificação Automatizada em `src/pages/Demo.test.tsx`:**
   - 5 casos de teste cobrem renderização sem autenticação, transições de estado, avanço para GO, reset e conformidade estrita dos 3 números.
   - As asserções `expect(supabase.from).not.toHaveBeenCalled()`, `expect(supabase.auth.getUser).not.toHaveBeenCalled()` e `expect(supabase.functions.invoke).not.toHaveBeenCalled()` passam em 100% dos fluxos.
4. **Log de Rede do Navegador Automatizado:**
   - Na tentativa de captura headless automatizada via Chrome local, o ambiente de execução sandbox/CI não roteou tráfego para a porta local do servidor (erro de quadro de conexão).
   - Conforme instrução expressa da Fase 19, o item foi classificado honestamente como **NÃO VERIFICADO** pelo agente, sendo preservado o passo obrigatório no roteiro de publicação do dono (DevTools -> Network -> filtro `supabase` -> 0 requisições).
- **Resultado Técnico:** PASSOU (código e testes unitários/integração). Inspeção de rede em navegador real: NÃO VERIFICADO (atribuído ao dono).

---

## 9. Veredito Final por Requisito (PUB-01 a PUB-12)

| Requisito | Descrição | Status | Evidência Principal |
|---|---|---|---|
| **PUB-01** | Acesso a `/demo` sem sessão e sem redirecionamento para `/auth` | **PASSOU** | `App.tsx:64`, `Demo.tsx`, `Demo.test.tsx` (sem auth guard) |
| **PUB-02** | Zero chamadas ao Supabase em `/demo` (auth, tabelas, functions) | **PASSOU (teste); rede real NÃO VERIFICADO** | `useGuestDemoReadiness`, `Demo.test.tsx` (mocks com 0 chamadas) |
| **PUB-03** | Roteiro de 3 etapas com "Simular novo scan" e reinício sem recarregar | **PASSOU** | `Demo.tsx`, `demoScenario.ts`, `Demo.test.tsx` (teste AAA 3 etapas) |
| **PUB-04** | Selo permanente "DEMO", alerta rotulado, piscadas inteiras | **PASSOU** | `Demo.tsx:60`, `PredictiveAlert.tsx`, `biometricDisplay.ts` |
| **PUB-05** | Botão "Ver demonstração (sem login)" na Landing Page | **PASSOU** | `Index.tsx:106`, `Index.test.tsx` (9 testes passando) |
| **PUB-06** | Atalho na tela de login mantendo fluxo existente intacto | **PASSOU** | `Auth.tsx:162`, `Auth.test.tsx` (6 testes passando) |
| **PUB-07** | Deck PPTX com exatamente 7 slides, sem credenciais, citando link | **PASSOU** | `python-pptx` (7 slides), dados reais 34/14/5,5, acentos íntegros |
| **PUB-08** | PDF idêntico ao PPTX com exatamente 7 páginas | **PASSOU** | `fitz`/`pymupdf` (7 páginas), dados reais 34/14/5,5, acentos íntegros |
| **PUB-09** | Roteiro de vídeo <= 30s cronometrado com tempos por cena e botões reais | **PASSOU** | `ROTEIRO-VIDEO-30S.md` (30s exatos: 5+7+7+8+3s), botões reais |
| **PUB-10** | Checklist operacional do dono para publicação e links públicos | **PASSOU** | `docs/publicacao/CHECKLIST-PUBLICACAO.md`, `LINKS.md` |
| **PUB-11** | README com seção de demonstração apontando para `/demo` | **PASSOU** | `README.md:14`, título sem emoji residual |
| **PUB-12** | Gates verdes, blindados intactos, prova automatizada, UAT consolidado | **PARCIAL: gates PASSOU; higiene de e-mail FALHOU; UAT do dono NÃO VERIFICADO** | Vitest (562/562), TSC (0 erros), Build (0 erros), ESLint (0 erros), Diff blindados vazio |

---

## 10. Pendências Externas Atribuídas ao Dono do Produto (Produção)

Os seguintes itens estão documentados em `docs/publicacao/CHECKLIST-PUBLICACAO.md` e aguardam execução pelo Dono do Produto:

1. **Deploy no Lovable:** Publicar o projeto com visibilidade pública em `https://neuro-suite.lovable.app/demo`.
2. **Inspeção de Rede no Navegador Real:** Abrir Janela Anônima, carregar `/demo`, abrir DevTools (F12) -> aba Network, filtrar por `supabase` e confirmar zero requisições HTTP disparadas.
3. **Upload de Deck e Vídeo:** Hospedar `CrewVitals-Demo.pptx`, `CrewVitals-Demo.pdf` e o vídeo gravado de 30s em armazenamento público compartilhado ("qualquer pessoa com o link") e preencher a tabela em `docs/publicacao/LINKS.md`.
4. **Submissão à Banca:** Enviar a URL pública da demo e os links do material conforme as instruções oficiais.
