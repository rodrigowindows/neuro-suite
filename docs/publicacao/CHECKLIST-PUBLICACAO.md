# Checklist de Publicacao e Links Publicos (PUB-10)

Instrucoes operacionais para o responsavel pela entrega externa do projeto CrewVitals aos avaliadores da banca (NASA Space Apps / banca examinadora).

Este checklist define os passos sequenciais necessarios para garantir acesso publico e irrestrito (zero login, zero senha, zero solicitacao de cadastro ou permissao) a todos os artefatos da solucao.

---

## Passo 1: Publicacao no Lovable com Acesso Publico

- Dono: Responsavel pelo projeto (Lincon).
- Criterio de pronto: Aplicacao compilada e publicada no painel do Lovable com status publico ativo, respondendo com codigo HTTP 200 na URL esperada `https://neuro-suite.lovable.app/demo`.

### Procedimento
1. Acesse o console do projeto no Lovable (`https://lovable.dev`).
2. No menu superior direito, clique em "Publish" (ou "Deploy to Production").
3. Certifique-se de que a visibilidade do projeto esta configurada como "Public" (Acesso Publico).
4. Verifique a URL gerada pelo deploy:
   - URL esperada: `https://neuro-suite.lovable.app/demo`
   - Se a URL gerada for diferente (exemplo: `https://neuro-suite-<identificador>.lovable.app/demo`), anote imediatamente a URL real para atualizar os links de apresentacao em `docs/apresentacao/` e na tabela de `docs/publicacao/LINKS.md`.

---

## Passo 2: Teste em Janela Anonima e Rede Movel (Zero Redirect)

- Dono: Responsavel pelo projeto / Avaliador tecnico.
- Criterio de pronto: A URL publica `<URL>/demo` abre diretamente no cockpit de telemetria sem redirecionar para `/auth`, sem solicitar login ou cadastro, tanto em navegador anonimo desktop quanto em dispositivo movel via 4G/5G fora da rede Wi-Fi local.

### Procedimento
1. Teste Desktop (Janela Anonima):
   - Abra uma nova janela anonima no Google Chrome (`Ctrl+Shift+N` ou `Cmd+Shift+N`) ou Firefox (`Ctrl+Shift+P`).
   - Cole a URL: `https://neuro-suite.lovable.app/demo`.
   - Confirme que a pagina carrega diretamente no painel do cockpit (Bridge Console) com dados de telemetria simulados.
   - Verifique a barra de navegacao: certifique-se de que a URL nao redirecionou para `/auth` ou `/login`.
2. Teste Mobile (Rede Celular 4G/5G):
   - Em um smartphone desconectado do Wi-Fi de casa/trabalho (usando dados moveis puros 4G/5G), abra o navegador em modo anonimo.
   - Acesse a URL: `https://neuro-suite.lovable.app/demo`.
   - Verifique se os componentes visuais, semaforo de prontidao e navegacao entre abas carregam sem bloqueios de rede corporativa ou solicitacao de autenticacao.

---

## Passo 3: Hospedagem Publica do Deck de Apresentacao (PDF e PPTX)

- Dono: Responsavel pelo projeto.
- Criterio de pronto: Arquivos `CrewVitals-Demo.pdf` e `CrewVitals-Demo.pptx` hospedados com link publico aberto ("qualquer pessoa com o link pode visualizar/baixar") sem tela de login ou restricao de permissao. Testado em janela anonima.

### Opcoes de Hospedagem e Configuracao Exata

#### Opcao A: GitHub Releases ou Repositorio Publico (Recomendado)
- Repositorio remoto: `https://github.com/rodrigowindows/neuro-suite`
- Procedimento:
  1. No GitHub, va ate a aba "Releases" > "Draft a new release".
  2. Defina a tag como `v1.2-banca` e o titulo como `CrewVitals v1.2 — Apresentacao e Demo`.
  3. Faca o upload dos arquivos `docs/apresentacao/CrewVitals-Demo.pdf` e `docs/apresentacao/CrewVitals-Demo.pptx`.
  4. Clique em "Publish release".
  5. Copie os links diretos de download de cada arquivo.
  6. Alternativamente, no branch publico `main`, use o link do blob ou raw do arquivo no repositorio publico.

#### Opcao B: Google Drive
- Procedimento:
  1. Faca upload dos arquivos `CrewVitals-Demo.pdf` e `CrewVitals-Demo.pptx` para uma pasta no Google Drive.
  2. Clique com o botao direito sobre o arquivo > "Compartilhar" (Share) > "Compartilhar".
  3. Na secao "Acesso geral" (General access), mude de "Restrito" (Restricted) para "Qualquer pessoa com o link" (Anyone with the link).
  4. Garanta que o perfil esteja marcado como "Leitor" (Viewer).
  5. Clique em "Copiar link" (Copy link).
  6. Abra uma janela anonima e cole o link copiado para garantir que abre sem exigir login do Google.

#### Opcao C: Microsoft OneDrive
- Procedimento:
  1. Faca upload dos arquivos no OneDrive.
  2. Selecione o arquivo > clique em "Compartilhar".
  3. Nas configuracoes de link, selecione "Qualquer pessoa com o link pode exibir" (sem exigir login e sem permitir edicao).
  4. Clique em "Copiar".
  5. Valide o link copiado em janela anonima.

#### Opcao D: Dropbox
- Procedimento:
  1. Faca upload dos arquivos no Dropbox.
  2. Posicione o cursor sobre o arquivo > "Compartilhar" > "Criar link".
  3. Defina as permissoes como "Qualquer pessoa com este link pode visualizar".
  4. Copie o link e valide em janela anonima.

---

## Passo 4: Hospedagem do Video de Demonstracao (Ate 30s) no YouTube

- Dono: Responsavel pelo projeto / Apresentador.
- Criterio de pronto: Video gravado seguindo o roteiro de 30 segundos (`docs/apresentacao/ROTEIRO-VIDEO-30S.md`), publicado no YouTube como "Nao listado" (Unlisted), abrindo sem restricoes de idade e sem login em janela anonima.

### Procedimento
1. Faca login no YouTube Studio (`https://studio.youtube.com`).
2. Clique no botao superior direito "Criar" (Create) > "Enviar videos" (Upload videos).
3. Selecione o arquivo de video gravado (duracao maxima: 30 segundos).
4. Configuracoes basicas:
   - Titulo: `CrewVitals — Plataforma de Telemetria e Prontidao de Missao (Demo 30s)`
   - Descricao: `Demonstracao operacional sem login do cockpit CrewVitals com dados simulados para a banca NASA Space Apps.`
   - Publico: Marque "Nao e conteudo para criancas" (ou conforme regulamento) e desative restricao de idade.
5. Na etapa de "Visibilidade" (Visibility):
   - Selecione a opcao "Nao listado" (Unlisted).
   - ATENCAO: NUNCA selecione "Privado" (Private), pois impedira a banca de assistir sem convite por e-mail.
6. Conclua o upload e copie a URL gerada (exemplo: `https://youtu.be/<PREENCHER_ID_VIDEO>`).
7. Teste de validacao:
   - Abra uma janela anonima no navegador e cole o link do YouTube.
   - Verifique se o video reproduz imediatamente sem solicitar autenticacao de conta Google.

---

## Passo 5: Sanitizacao de Credenciais e Privacidade (Auditoria Pre-Publicacao)

- Dono: Responsavel pelo projeto / Auditor de Seguranca.
- Criterio de pronto: Nenhuma chave de API, senha, e-mail pessoal ou informacao corporativa confidencial visivel no deck, no video, nos commits ou na URL publica.

### Procedimento de Verificacao
1. Inspecao Visual do Deck:
   - Abra o PDF e PPTX do deck.
   - Verifique se os slides contem apenas nomes operacionais (ex: Lincon, Rodrigo) e papeis de missao, sem e-mails pessoais (@gmail.com, @hotmail.com, etc.).
   - Confirme a presenca explicita dos rotulos "Dados Simulados", "Demonstracao Operacional" e disclaimers eticos NASA HRP.
2. Inspecao Visual da Gravacao de Video:
   - Assista aos 30 segundos de video gravados em tela cheia.
   - Verifique se o navegador gravado esta com abas fechadas (nenhuma aba visivel com e-mail pessoal, dashboards corporativos ou senhas).
   - Verifique se a barra de favoritos, historico de navegacao ou notificacoes do sistema operacional nao foram capturadas.
3. Inspecao de Repositorio e Chaves:
   - Consulte `docs/seguranca/CHECKLIST-MANUAL.md` para confirmar que as chaves Gemini expostas anteriormente foram devidamente revogadas no console do provedor.
   - Verifique que o diretorio `Feedbacks/` permanece ignorado pelo git:
     ```bash
     git check-ignore -v "Feedbacks/"
     ```
   - Confirme a ausencia de chaves `AIza` e senhas rastreadas no codigo:
     ```bash
     git grep -n -i "AIza" -- . ":!Feedbacks"
     git grep -n -i "password\s*=\|senha\s*=" -- src docs supabase
     ```
   - A busca deve retornar zero chaves ou senhas em texto puro.

---

## Passo 6: Template para Submissao na NASA Space Apps / Banca

- Dono: Responsavel pelo projeto.
- Criterio de pronto: Bloco de texto em portugues estruturado em 3 linhas para preenchimento direto no formulario oficial de submissao.

### Modelo de Submissao Oficial (Copiar e Preencher)

```text
Projeto: CrewVitals — Plataforma de Telemetria Fisiológica e Prontidão Operacional para Tripulações Espaciais.
Demonstração Interativa (sem login): https://neuro-suite.lovable.app/demo (dados 100% simulados para homologação).
Apresentação e Vídeo: Deck (PDF/PPTX): <PREENCHER_LINK_DECK> | Vídeo (30s): <PREENCHER_LINK_YOUTUBE>
```

---

## Passo 7: Plano de Contingencia (Plano B)

- Dono: Responsavel pelo projeto.
- Criterio de pronto: Se a URL da aplicacao web interativa falhar por problemas de infraestrutura no momento da avaliacao da banca, os links do deck de 7 slides e do video de 30 segundos garantem integralmente o cumprimento da avaliacao tecnica.

### Acoes de Contingencia
1. Redundancia de Artefatos:
   - O deck e o video devem ser mantidos em dois locais distintos (exemplo: GitHub Releases e Google Drive com link publico).
   - Se o avaliador relatar instabilidade no carregamento da URL `https://neuro-suite.lovable.app/demo`, forneca imediatamente o link do video de 30s no YouTube ou o PDF do deck.
2. Rota Alternativa:
   - Caso a Lovable enfrente indisponibilidade global, o projeto pode ser executado localmente ou visualizado atraves das gravacoes de tela disponiveis no canal do projeto.
3. Aprovacao de Entrega:
   - Preencha todos os campos do arquivo `docs/publicacao/LINKS.md` apos concluir cada teste em janela anonima.
