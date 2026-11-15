# Checklist de Publicação e Links Públicos (PUB-10 / v1.3)

Instruções operacionais para o responsável pela entrega externa do projeto CrewVitals aos avaliadores da banca examinadora (NASA Space Apps / banca examinadora).

Este checklist define os passos sequenciais necessários para garantir acesso público e irrestrito (zero login, zero senha, zero solicitação de cadastro ou permissão) a todos os artefatos da solução, tanto em inglês (padrão internacional da banca) quanto em português.

---

## Passo 1: Publicação no Lovable com Acesso Público

- Dono: Responsável pelo projeto (Lincon).
- Critério de pronto: Aplicação compilada e publicada no painel do Lovable com status público ativo, respondendo com código HTTP 200 nas URLs esperadas:
  - `https://neuro-suite.lovable.app/demo?lang=en` (Cockpit em inglês)
  - `https://neuro-suite.lovable.app/demo?lang=pt` (Cockpit em português)
  - `https://neuro-suite.lovable.app/demo` (Detecção automática de idioma conforme o navegador)

### Procedimento
1. Acesse o console do projeto no Lovable (`https://lovable.dev`).
2. No menu superior direito, clique em "Publish" (ou "Deploy to Production").
3. Certifique-se de que a visibilidade do projeto está configurada como "Public" (Acesso Público).
4. Verifique a URL gerada pelo deploy:
   - URL esperada: `https://neuro-suite.lovable.app/demo`
   - Se a URL gerada for diferente (exemplo: `https://neuro-suite-<identificador>.lovable.app/demo`), anote imediatamente a URL real para atualizar os links de apresentação em `docs/apresentacao/` e na tabela de `docs/publicacao/LINKS.md`.

---

## Passo 2: Teste em Janela Anônima e Rede Móvel (Zero Redirect e Paridade Bilíngue)

- Dono: Responsável pelo projeto / Avaliador técnico.
- Critério de pronto:
  - As URLs públicas `<URL>/demo?lang=en` e `<URL>/demo?lang=pt` abrem diretamente no cockpit de telemetria sem redirecionar para `/auth` ou `/login`, sem solicitar login ou cadastro, tanto em navegador anônimo desktop quanto em dispositivo móvel via 4G/5G fora da rede Wi-Fi local.
  - A rota `/demo` sem parâmetro `?lang=` respeita a preferência do navegador: abre em inglês se o navegador estiver em inglês (ou outro idioma internacional), e em português se o navegador estiver em português.
  - O seletor de idioma no topo (EN | PT) alterna o idioma imediatamente sem recarregar a página e sem perder o estado da demonstração.

### Procedimento
1. Teste Desktop em Janela Anônima com Parâmetro Explícito:
   - Abra uma nova janela anônima no Google Chrome (`Ctrl+Shift+N` ou `Cmd+Shift+N`) ou Firefox (`Ctrl+Shift+P`).
   - Acesse: `https://neuro-suite.lovable.app/demo?lang=en`.
   - Confirme que a página carrega diretamente no painel do cockpit em inglês ("Crew Health Telemetry Terminal", "Fit for Shift" / "Caution" / "Fatigue", "Blinks/min", "Sleep") com dados de telemetria simulados.
   - Acesse: `https://neuro-suite.lovable.app/demo?lang=pt`.
   - Confirme que a página carrega no cockpit em português ("Terminal de Telemetria de Saúde da Tripulação", "Apto para o Turno", etc.).
   - Verifique a barra de navegação: certifique-se de que a URL não redirecionou para `/auth` ou `/login`.
2. Teste do Seletor de Idioma:
   - Na barra de navegação da `/demo`, clique no seletor alternando entre EN e PT.
   - Verifique se os textos trocam instantaneamente sem recarregar a página e mantendo a etapa atual da demonstração.
3. Teste de Detecção Automática do Navegador (sem `?lang=`):
   - Em uma janela anônima configurada com idioma inglês (ou navegador padrão em inglês), acesse `https://neuro-suite.lovable.app/demo`.
   - Confirme que o idioma padrão exibido é o inglês (EN).
   - Em navegador com idioma primário em português, confirme que o padrão exibido é o português (PT).
4. Teste Mobile (Rede Celular 4G/5G):
   - Em um smartphone desconectado do Wi-Fi (usando dados móveis puros 4G/5G), abra o navegador em modo anônimo.
   - Acesse `https://neuro-suite.lovable.app/demo?lang=en` e `https://neuro-suite.lovable.app/demo?lang=pt`.
   - Verifique se os componentes visuais, semáforo de prontidão e navegação entre abas carregam sem bloqueios de rede corporativa e sem solicitação de autenticação.

---

## Passo 3: Hospedagem Pública do Deck de Apresentação Bilíngue (PDF e PPTX)

- Dono: Responsável pelo projeto.
- Critério de pronto: Arquivos `CrewVitals-Demo-EN.pdf` / `CrewVitals-Demo-EN.pptx` (versão principal para a banca internacional) e `CrewVitals-Demo-PT.pdf` / `CrewVitals-Demo-PT.pptx` (versão de apoio em português) hospedados com link público aberto ("qualquer pessoa com o link pode visualizar/baixar") sem tela de login ou restrição de permissão. Testados em janela anônima.

### Opções de Hospedagem e Configuração Exata

#### Opção A: GitHub Releases ou Repositório Público (Recomendado)
- Repositório remoto: `https://github.com/rodrigowindows/neuro-suite`
- Procedimento:
  1. No GitHub, vá até a aba "Releases" > "Draft a new release".
  2. Defina a tag como `v1.3-banca` e o título como `CrewVitals v1.3 — Apresentação e Demo Bilíngue`.
  3. Faça o upload dos arquivos:
     - `docs/apresentacao/CrewVitals-Demo-EN.pdf`
     - `docs/apresentacao/CrewVitals-Demo-EN.pptx`
     - `docs/apresentacao/CrewVitals-Demo-PT.pdf`
     - `docs/apresentacao/CrewVitals-Demo-PT.pptx`
  4. Clique em "Publish release".
  5. Copie os links diretos de download de cada arquivo.
  6. Alternativamente, no branch público `main`, use o link do blob ou raw do arquivo no repositório público.

#### Opção B: Google Drive
- Procedimento:
  1. Faça upload dos arquivos PDF e PPTX (EN e PT) para uma pasta no Google Drive.
  2. Clique com o botão direito sobre cada arquivo > "Compartilhar" (Share) > "Compartilhar".
  3. Na seção "Acesso geral" (General access), mude de "Restrito" (Restricted) para "Qualquer pessoa com o link" (Anyone with the link).
  4. Garanta que o perfil esteja marcado como "Leitor" (Viewer).
  5. Clique em "Copiar link" (Copy link).
  6. Abra uma janela anônima e cole o link copiado para garantir que abre sem exigir login de conta Google.

#### Opção C: Microsoft OneDrive
- Procedimento:
  1. Faça upload dos arquivos no OneDrive.
  2. Selecione o arquivo > clique em "Compartilhar".
  3. Nas configurações de link, selecione "Qualquer pessoa com o link pode exibir" (sem exigir login e sem permitir edição).
  4. Clique em "Copiar".
  5. Valide o link copiado em janela anônima.

#### Opção D: Dropbox
- Procedimento:
  1. Faça upload dos arquivos no Dropbox.
  2. Posicione o cursor sobre o arquivo > "Compartilhar" > "Criar link".
  3. Defina as permissões como "Qualquer pessoa com este link pode visualizar".
  4. Copie o link e valide em janela anônima.

---

## Passo 4: Hospedagem dos Vídeos de Demonstração (Até 30s) no YouTube

- Dono: Responsável pelo projeto / Apresentador.
- Critério de pronto:
  - Vídeo em inglês (principal para a banca internacional): gravado seguindo o roteiro de 30 segundos em inglês (`docs/apresentacao/ROTEIRO-VIDEO-30S.en.md` ou equivalente), publicado no YouTube como "Não listado" (Unlisted), abrindo sem restrições de idade e sem login em janela anônima.
  - Vídeo em português (versão de apoio): gravado seguindo o roteiro em português (`docs/apresentacao/ROTEIRO-VIDEO-30S.pt.md` ou `ROTEIRO-VIDEO-30S.md`), publicado como "Não listado".

### Procedimento
1. Faça login no YouTube Studio (`https://studio.youtube.com`).
2. Clique no botão superior direito "Criar" (Create) > "Enviar vídeos" (Upload videos).
3. Selecione o arquivo de vídeo gravado (duração máxima: 30 segundos).
4. Configurações básicas:
   - Vídeo EN:
     - Título: `CrewVitals — Crew Health Telemetry & Mission Readiness Platform (Demo 30s)`
     - Descrição: `Public demonstration of the CrewVitals cockpit telemetry with simulated data for NASA Space Apps evaluation board.`
   - Vídeo PT:
     - Título: `CrewVitals — Plataforma de Telemetria e Prontidão de Missão (Demo 30s)`
     - Descrição: `Demonstração operacional sem login do cockpit CrewVitals com dados simulados para a banca examinadora.`
   - Público: Marque "Não é conteúdo para crianças" e desative restrição de idade.
5. Na etapa de "Visibilidade" (Visibility):
   - Selecione a opção "Não listado" (Unlisted).
   - ATENÇÃO: NUNCA selecione "Privado" (Private), pois impedirá a banca de assistir sem convite por e-mail.
6. Conclua o upload e copie a URL gerada (exemplo: `https://youtu.be/<PREENCHER_ID_VIDEO>`).
7. Teste de validação:
   - Abra uma janela anônima no navegador e cole o link do YouTube.
   - Verifique se o vídeo reproduz imediatamente sem solicitar autenticação de conta Google.

---

## Passo 5: Sanitização de Credenciais e Privacidade (Auditoria Pré-Publicação)

- Dono: Responsável pelo projeto / Auditor de Segurança.
- Critério de pronto: Nenhuma chave de API, senha, e-mail pessoal ou informação confidencial visível nos decks, nos vídeos, nos commits ou nas URLs públicas.

### Procedimento de Verificação
1. Inspeção Visual dos Decks (EN e PT):
   - Abra os PDFs e PPTXs dos decks em inglês e português.
   - Verifique se os slides contêm apenas nomes operacionais (ex: Lincon, Rodrigo) e papéis de missão, sem e-mails pessoais.
   - Confirme a presença explícita dos rótulos de dados simulados ("DEMO: simulated data" / "DEMO: dados simulados"), nota de demonstração do alerta preditivo e menção a Decision Support System (DSS).
2. Inspeção Visual das Gravações de Vídeo:
   - Assista aos vídeos gravados em tela cheia.
   - Verifique se o navegador gravado está com abas limpas (nenhuma aba visível com e-mail pessoal, dashboards corporativos ou senhas).
   - Verifique se a barra de favoritos, histórico de navegação ou notificações do sistema operacional não foram capturados.
3. Inspeção de Repositório e Chaves:
   - Consulte `docs/seguranca/CHECKLIST-MANUAL.md` para confirmar que as chaves Gemini expostas anteriormente foram devidamente revogadas no console do provedor.
   - Verifique que o diretório `Feedbacks/` permanece ignorado pelo git:
     ```bash
     git check-ignore -v "Feedbacks/"
     ```
   - Confirme a ausência de chaves `AIza`, `sk-` e senhas rastreadas no código:
     ```bash
     git grep -n -i "AIza" -- . ":!Feedbacks"
     git grep -n -i "password\s*=\|senha\s*=" -- src docs supabase
     ```
   - A busca deve retornar zero chaves ou senhas em texto puro.

---

## Passo 6: Templates para Submissão na NASA Space Apps / Banca

- Dono: Responsável pelo projeto.
- Critério de pronto: Blocos de texto estruturados em 3 a 5 linhas para preenchimento direto no formulário oficial de submissão (em inglês para a banca internacional e em português para a banca local).

### Modelo de Submissão em Inglês (Banca Internacional - Principal)

```text
Project: CrewVitals - Decision Support System (DSS) for crew cognitive fatigue monitoring and mission operational readiness telemetry.
Interactive Demo (no login required): https://neuro-suite.lovable.app/demo?lang=en (100% simulated data for testing and demonstration).
Presentation Deck (PDF): <FILL IN> | Slide Deck (PPTX): <FILL IN>
Demonstration Video (30s): <FILL IN>
Note: CrewVitals is an operational Decision Support System and does not replace medical evaluation. Predictive alerts are demonstration scenarios, not validated clinical predictions.
```

### Modelo de Submissão em Português (Banca Local / Avaliação Nacional)

```text
Projeto: CrewVitals — Sistema de Suporte à Decisão (DSS) para monitoramento de fadiga cognitiva e telemetria de prontidão operacional da tripulação.
Demonstração Interativa (sem login): https://neuro-suite.lovable.app/demo?lang=pt (dados 100% simulados para homologação e demonstração de interface).
Deck de Apresentação (PDF): <FILL IN> | Deck Editável (PPTX): <FILL IN>
Vídeo de Demonstração (30s): <FILL IN>
Nota: O CrewVitals é um Sistema de Suporte à Decisão operacional e não substitui avaliação médica. Alertas preditivos constituem cenários demonstrativos, não previsões clínicas validadas.
```

---

## Passo 7: Plano de Contingência (Plano B)

- Dono: Responsável pelo projeto.
- Critério de pronto: Se a URL da aplicação web interativa falhar por problemas de infraestrutura no momento da avaliação da banca, os links dos decks de 7 slides e dos vídeos de 30 segundos garantem integralmente o cumprimento da avaliação técnica.

### Ações de Contingência
1. Redundância de Artefatos:
   - Os decks e os vídeos devem ser mantidos em dois locais distintos (exemplo: GitHub Releases e Google Drive com link público).
   - Se o avaliador relatar instabilidade no carregamento da URL `https://neuro-suite.lovable.app/demo`, forneça imediatamente o link do vídeo de 30s no YouTube ou o PDF do deck.
2. Rota Alternativa:
   - Caso a Lovable enfrente indisponibilidade global, o projeto pode ser executado localmente ou visualizado através das gravações de tela disponíveis no canal do projeto.
3. Aprovação de Entrega:
   - Preencha todos os campos do arquivo `docs/publicacao/LINKS.md` após concluir cada teste em janela anônima.
