# UAT do Marco v1.2: Auditoria e Validação da Demo Pública sem Login

**Data da execução:** 2026-11-15  
**Escopo:** Requisitos PUB-01 a PUB-12 (`.planning/REQUIREMENTS.md`) e Phase 16 (`.planning/ROADMAP.md`)  
**Repositório:** `https://github.com/rodrigowindows/neuro-suite`  
**URL de Produção Esperada:** `https://neuro-suite.lovable.app/demo`  
**Legenda:** PASSOU, FALHOU, NÃO VERIFICADO  

Este relatório consolida a auditoria técnica automatizada, a conferência de integridade dos arquivos blindados e o roteiro cronometrado de homologação para o marco v1.2 do CrewVitals.

---

## Resumo Executivo

| # | Verificação | Evidência / Comando | Resultado |
|---|-------------|---------------------|-----------|
| 1 | Pré-condição: 4 commits das fases 12, 13, 14 e 15 | `git log --oneline -5` | PASSOU |
| 2 | Gates: Suíte Completa de Testes Unitários e Integração | `npm test -- --run` (50 arquivos, 561 testes) | PASSOU |
| 3 | Gates: Checagem de Tipagem Estática TypeScript | `npx tsc --noEmit` (código de saída 0) | PASSOU |
| 4 | Gates: Compilação de Produção | `npm run build` (código de saída 0, 15.50s) | PASSOU |
| 5 | Blindagem Lovable (zero alteração em arquivos protegidos) | `git diff HEAD~4..HEAD --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts` | PASSOU |
| 6 | Prova de Zero Login: `/demo` acessível sem sessão | `src/App.tsx` e `src/pages/Demo.tsx` (fora de ProtectedRoute) | PASSOU |
| 7 | Prova de Zero Rede: ausência total de chamadas Supabase | `Demo.test.tsx` (0 `from`, 0 `getUser`, 0 `functions.invoke`) | PASSOU |
| 8 | Transparência: Selo "DEMO: dados simulados" permanente | `src/pages/Demo.tsx:61` (`data-testid="demo-fixed-seal"`) | PASSOU |
| 9 | Transparência: Alerta preditivo rotulado como demonstração | `PredictiveAlert.tsx` com badge "Demonstração" e disclaimer DSS | PASSOU |
| 10 | Precisão Numérica: Piscadas/min formatadas só na exibição | `roundBlinkRate(readiness.blinkRate)` na camada de exibição | PASSOU |
| 11 | Higiene Visual: Ausência total de emojis na interface | `src/lib/noEmojiUi.test.ts` (135 arquivos escaneados, 0 emojis) | PASSOU |
| 12 | Portas de Entrada: Landing Page aponta para `/demo` | `src/pages/Index.tsx` botão "Ver demonstração (sem login)" | PASSOU |
| 13 | Portas de Entrada: Tela de Login aponta para `/demo` | `src/pages/Auth.tsx` link "Ver demonstração sem login" | PASSOU |
| 14 | Deck da Banca: Exatamente 7 slides sem credenciais | `python-pptx` confirmou `len(prs.slides) == 7` em `CrewVitals-Demo.pptx` | PASSOU |
| 15 | PDF da Banca: Exatamente 7 páginas | `pypdf` confirmou `len(reader.pages) == 7` em `CrewVitals-Demo.pdf` | PASSOU |
| 16 | Roteiro de Vídeo: Duração rigorosamente <= 30 segundos | `docs/apresentacao/ROTEIRO-VIDEO-30S.md` soma 30s (5+7+8+7+3s) | PASSOU |
| 17 | Sanitização de Segredos: Zero credenciais ou chaves | `git grep -n -i -E "senha|password|AIza|sk-" -- docs README.md` | PASSOU |
| 18 | Roteiro de Publicação e Links Públicos | `docs/publicacao/CHECKLIST-PUBLICACAO.md` e `LINKS.md` criados | PASSOU |
| 19 | Ensaio Visual Real em Janela Anônima em Produção | Depende de deploy no Lovable e execução pelo dono | NÃO VERIFICADO |
| 20 | Validação dos Links Definitivos na Submissão da Banca | Depende do upload dos arquivos pelo dono | NÃO VERIFICADO |

---

## 1. Pré-condição dos Commits do Marco v1.2

**Comando:** `git log --oneline -5`

```
53ac4b7 feat(demo): rota publica /demo sem login e sem rede
105c8a0 feat(landing): atalho para demonstracao sem login
e2810c1 docs(apresentacao): deck de 7 slides e roteiro de video 30s sem login
52a0a40 docs(publicacao): checklist de links publicos sem login
99aee14 Atualização tarde de domingo
```

- **Fase 12 (Commit `53ac4b7`):** Rota pública `/demo` sem login e sem rede, com hook `useGuestReadiness`.
- **Fase 13 (Commit `105c8a0`):** Portas de entrada na Landing Page (`Index.tsx`) e tela de autenticação (`Auth.tsx`).
- **Fase 14 (Commit `e2810c1`):** Deck de exatamente 7 slides (`CrewVitals-Demo.pptx` e `.pdf`) e roteiro de vídeo de 30s.
- **Fase 15 (Commit `52a0a40`):** Checklist de publicação, tabela de links públicos e seção "Demonstração" no README.
- **Resultado:** PASSOU. Todos os 4 commits estão presentes na ordem correta imediatamente acima da base de domingo (`99aee14`).

---

## 2. Gates Técnicos de Qualidade

### 2.1 Testes Automatizados (Vitest)
**Comando:** `npm test -- --run`

```
 Test Files  50 passed (50)
      Tests  561 passed (561)
   Duration  19.41s
```
- **Resultado:** PASSOU. 50 arquivos de teste aprovados, 561 testes aprovados (11 testes a mais que a Phase 11, cobrindo `Demo.test.tsx`, `useReadiness.test.ts`, `Index.test.tsx` e `Auth.test.tsx`). Zero testes falhando ou ignorados.

### 2.2 Verificação de Tipos TypeScript
**Comando:** `npx tsc --noEmit`

- **Resultado:** PASSOU. Código de saída 0, zero erros de compilação ou inconsistências de interface.

### 2.3 Build de Produção (Vite)
**Comando:** `npm run build`

```
✓ 3111 modules transformed.
dist/index.html                                     2.18 kB │ gzip:   0.81 kB
dist/assets/index-DchgkCoD.css                    100.13 kB │ gzip:  16.90 kB
dist/assets/index-DP8SftDT.js                     858.11 kB │ gzip: 256.70 kB
✓ built in 15.50s
```
- **Resultado:** PASSOU. Código de saída 0, bundle gerado com sucesso em 15.50s.

---

## 3. Integridade dos Arquivos Blindados Lovable

**Comando:**
```bash
git diff HEAD~4..HEAD --stat -- src/integrations supabase/migrations package.json package-lock.json bun.lock bun.lockb vite.config.ts
```

- **Resultado:** PASSOU. Saída estritamente vazia (código de saída 0).
- Nenhuma dependência externa adicionada em `package.json`.
- Nenhum schema, migration ou cliente gerado foi modificado durante todo o marco v1.2.

---

## 4. Prova de Zero Login e Zero Rede (PUB-01 e PUB-02)

1. **Ausência de Guarda de Autenticação (`src/App.tsx`):**
   - A rota `/demo` é registrada diretamente: `<Route path="/demo" element={<Demo />} />` logo acima do catch-all `*`.
   - Não está envolvida por `<ProtectedRoute>` nem condicionada ao estado de `user`.
2. **Desacoplamento Completo de Rede (`src/hooks/useReadiness.ts`):**
   - A opção `{ guestDemo: true }` aciona a função `useGuestReadiness`, que não executa `useAuth()`, `useWellnessScore()`, `supabase.auth.getUser()`, nem nenhuma consulta a tabelas (`from`) ou Edge Functions (`functions.invoke`).
   - Dados fisiológicos e de prontidão são alimentados puramente pelo cenário demonstrativo local `src/lib/demoScenario.ts`.
3. **Verificação Automatizada em Teste (`src/pages/Demo.test.tsx`):**
   - O mock de `@/integrations/supabase/client` monitora todas as chamadas.
   - Em todos os 4 casos de teste (renderização inicial, simular scan, reset e fluxo completo com contramedida), as seguintes asserções passam:
     ```typescript
     expect(supabase.from).not.toHaveBeenCalled();
     expect(supabase.auth.getUser).not.toHaveBeenCalled();
     expect(supabase.functions.invoke).not.toHaveBeenCalled();
     ```
   - *Nota técnica sobre sessão:* A chamada a `supabase.auth.getSession()` registrada pelo `AuthProvider` no mount é estritamente síncrona/local (`localStorage`), não gerando tráfego HTTP/rede quando o visitante não possui token ativo.
- **Resultado:** PASSOU.

---

## 5. Transparência Científica e Honestidade da Interface (PUB-03 e PUB-04)

1. **Selo Permanente:** Elemento fixo `<span data-testid="demo-fixed-seal">DEMO: dados simulados</span>` visível no cabeçalho em todas as etapas da rota `/demo`.
2. **Alerta Preditivo:** O componente `PredictiveAlert` exibe explicitamente o badge "Demonstração" e a legenda obrigatória "Variações circadianas e fadiga acumulada podem degradar o tempo de reação em turnos prolongados. Demonstração, não é uma previsão clínica validada."
3. **Piscadas por Minuto:** Formatadas exclusivamente no boundary de exibição através de `roundBlinkRate()`, mantendo inteiros na interface (`14`, `18`, `26`) sem alterar os valores armazenados ou limiares de classificação.
4. **Sem Emojis:** `src/lib/noEmojiUi.test.ts` e varredura com regex confirmaram zero emojis em `src/pages/Demo.tsx`, `Index.tsx`, `Auth.tsx` e componentes do cockpit.
- **Resultado:** PASSOU.

---

## 6. Portas de Entrada na Landing e Login (PUB-05 e PUB-06)

1. **Landing Page (`src/pages/Index.tsx`):**
   - Botão primário na primeira dobra (Hero) com o texto exato `"Ver demonstração (sem login)"` direcionando para `/demo`.
   - Alvo de toque acessível (`min-h-[44px]`).
   - Botões originais de autenticação (`"Iniciar Missão"` e `"Acessar Painel do Astronauta"`) preservados.
2. **Tela de Autenticação (`src/pages/Auth.tsx`):**
   - Link secundário `"Ver demonstração sem login"` posicionado abaixo do formulário de credenciais apontando para `/demo`.
   - Subtítulo técnico `"Terminal de Telemetria de Saúde da Tripulação"`, botão `"Autenticar"` e fluxo retroativo `?demo=1` intactos.
3. **Testes Unitários:** `src/pages/Index.test.tsx` (9 testes) e `src/pages/Auth.test.tsx` (6 testes) aprovados com 100% de sucesso.
- **Resultado:** PASSOU.

---

## 7. Material da Banca: Deck de 7 Slides e Vídeo de 30s (PUB-07 a PUB-09)

1. **Contagem Rigorosa de Slides e Páginas:**
   - `python-pptx` confirmou: `len(Presentation('docs/apresentacao/CrewVitals-Demo.pptx').slides) == 7`.
   - `pypdf` confirmou: `len(PdfReader('docs/apresentacao/CrewVitals-Demo.pdf').pages) == 7`.
   - Estrutura entregue:
     1. Título (CrewVitals — Terminal de Telemetria de Saúde da Tripulação).
     2. O problema (fadiga cognitiva e sobrecarga contínua em voos espaciais).
     3. Solução (cockpit operacional de 3 níveis: semáforo, 3 números, ação primária).
     4. Demonstração operacional (roteiro de 3 etapas: NO-GO 34 -> ATENÇÃO 52 -> GO 72).
     5. Transparência científica (tabela Medido vs Simulado, disclaimer de apoio à decisão).
     6. Privacidade e segurança (execução local sem rede/sessão, RLS e funções protegidas).
     7. Fechamento (link público direto `https://neuro-suite.lovable.app/demo` sem login).
2. **Roteiro de Vídeo Cronometrado (`docs/apresentacao/ROTEIRO-VIDEO-30S.md`):**
   - Duração total: exatamente 30 segundos (5s + 7s + 8s + 7s + 3s).
   - Locução sóbria e técnica em português, sem credenciais e sem emojis.
   - Instruções de gravação em janela anônima a 1280x720 / 1920x1080.
- **Resultado:** PASSOU.

---

## 8. Documentos de Publicação e Sanitização de Segredos (PUB-10 e PUB-11)

1. **Documentos de Suporte Operacional:**
   - `docs/publicacao/CHECKLIST-PUBLICACAO.md`: Guia de 7 passos com Dono e Critério de Pronto.
   - `docs/publicacao/LINKS.md`: Tabela de controle para os links finais da banca.
   - `README.md`: Seção "Demonstração Pública (Acesso sem Login)" inserida no topo.
2. **Varredura Completa de Segredos:**
   - `git grep -n -i -E "senha|password|AIza|sk-" -- docs README.md` confirmou:
     - Zero senhas, API keys ou credenciais vazadas em texto claro.
     - Únicas ocorrências correspondem a instruções de verificação e menções negativas ("sem login", "sem senha").
- **Resultado:** PASSOU.

---

## 9. Roteiro Cronometrado de 60 Segundos em Janela Anônima (UAT Operacional)

Este teste deve ser realizado pelo Dono do Produto logo após acionar o botão de publicação no Lovable.

**Ambiente:** Navegador em Janela Anônima (Google Chrome, Edge ou Safari), sem extensões ativas, sem cache e sem login prévio.  
**URL de Teste:** `https://neuro-suite.lovable.app/demo`  
**Tempo Total de Execução:** 60 segundos.  

| Tempo | Ação Operacional | Elementos a Observar na Interface | Veredito Esperado | Status |
|---|---|---|---|---|
| **00:00 - 00:05** (5 s) | Abrir janela anônima e colar `https://neuro-suite.lovable.app/demo` | A rota `/demo` carrega diretamente o Cockpit Operacional. | Zero redirecionamento para `/auth`, nenhum modal de login ou bloqueio de permissão. | [ ] |
| **00:05 - 00:20** (15 s) | Conferir os componentes do Cockpit Inicial (Etapa 1: NO-GO) | 1. Selo permanente `DEMO: dados simulados` no topo.<br>2. Badge `DEMO 1/3` ao lado do selo.<br>3. Semáforo vermelho: `NO-GO - FADIGA (NÃO APTO)`.<br>4. 3 Números: BioScore `34`, Piscadas/min `14`, Sono `5.5h`.<br>5. Alerta Preditivo com badge `Demonstração` e disclaimer.<br>6. Botão vermelho: `Iniciar Protocolo 4-7-8`.<br>7. Log de Eventos com mensagens da missão. | Interface estável, sem rolagem horizontal em 375px e sem emojis. | [ ] |
| **00:20 - 00:35** (15 s) | Clicar em `Iniciar Protocolo 4-7-8` | 1. Mensagem de confirmação de contramedida local executada.<br>2. Transição para o semáforo amarelo `ATENÇÃO - VIGILÂNCIA`.<br>3. Badge atualiza para `DEMO 2/3`.<br>4. BioScore atualiza para `52`.<br>5. Novo evento de protocolo adicionado ao Log. | Transição fluida sem recarregar a página e sem requisição de rede. | [ ] |
| **00:35 - 00:50** (15 s) | Clicar no botão `Simular novo scan` | 1. Semáforo atualiza para verde `GO - APTO PARA O TURNO`.<br>2. Badge atualiza para `DEMO 3/3`.<br>3. BioScore atualiza para `72`, Piscadas `18`, Sono `5.5h`.<br>4. Alerta Preditivo é ocultado (status GO).<br>5. Ação primária se torna botão verde `Iniciar Turno`. | Estado GO nominal alcançado. | [ ] |
| **00:50 - 01:00** (10 s) | Clicar em `Reiniciar demonstração` | O cockpit volta imediatamente para a Etapa 1 (Semáforo NO-GO, BioScore `34`, Piscadas `14`). | Reinício limpo no cliente sem recarregamento da janela. | [ ] |

---

## 10. Itens Mantidos como NÃO VERIFICADO (Ações Externas de Produção)

Os seguintes itens dependem de ações operacionais fora do repositório Git local e permanecem formalmente como **NÃO VERIFICADO** até a execução pelo dono:

1. **Deploy no Lovable:** Publicação no painel com visibilidade pública ativada e confirmação de resposta HTTP 200 em `https://neuro-suite.lovable.app/demo`.
2. **Teste em Rede Móvel (4G/5G):** Homologação do carregamento sem login em smartphone desconectado da rede Wi-Fi local.
3. **Upload do Deck e Vídeo:** Disponibilização dos arquivos `CrewVitals-Demo.pptx`, `CrewVitals-Demo.pdf` e do vídeo de 30s em link aberto ("qualquer pessoa com o link"), registrando as URLs definitivas em `docs/publicacao/LINKS.md`.
4. **Submissão à Banca:** Preenchimento do formulário da NASA Space Apps / banca avaliadora utilizando o modelo de 3 linhas documentado em `docs/publicacao/CHECKLIST-PUBLICACAO.md`.

---

## Conclusão da Auditoria

O marco **v1.2 (CrewVitals: Demo Pública sem Login)** está **100% aprovado no código-fonte, nos testes e nos materiais de apresentação**. Todos os 561 testes unitários e de integração passaram, a checagem de tipos e o build estão limpos, e os arquivos blindados permaneceram estritamente intactos.
