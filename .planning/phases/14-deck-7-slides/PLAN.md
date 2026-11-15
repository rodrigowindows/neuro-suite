# Plano de Fase 14 — Deck de 7 Slides e Roteiro de Video de 30s sem Credenciais (v1.2)

## Objetivo
Ajustar a apresentacao do CrewVitals para atender as exigencias da banca avaliadora: exatamente 7 slides no PPTX/PDF e roteiro de video cronometrado em ate 30 segundos, com link publico direto (/demo) sem solicitacao de senha, cadastro ou credenciais.

## Requisitos
- **PUB-07:** Exatamente 7 slides no arquivo `CrewVitals-Demo.pptx` (`len(prs.slides) == 7`).
  - Slide 1: Titulo — CrewVitals (Terminal de Telemetria de Saude da Tripulacao).
  - Slide 2: Introducao — O problema: fadiga cognitiva em voos espaciais de longa duracao.
  - Slide 3: Solucao — Cockpit 3 niveis (semaforo GO/ATENCAO/NO-GO, 3 numeros essenciais, acao primaria).
  - Slide 4: Demonstracao — Roteiro de 3 etapas (NO-GO 34 -> ATENCAO 52 -> GO 72) com "Simular novo scan".
  - Slide 5: Transparencia Cientifica — Tabela Medido vs Simulado (dados simulados na demo publica, apoio a decisao).
  - Slide 6: Privacidade e Seguranca — Demo sem rede e sem sessao; zero vazamento de telemetria.
  - Slide 7: Fechamento — Link publico direto `https://neuro-suite.lovable.app/demo` (sem login) e repositorio.
- **PUB-08:** `CrewVitals-Demo.pdf` gerado refletindo exatamente os mesmos 7 slides.
- **PUB-09:** `docs/apresentacao/ROTEIRO-VIDEO-30S.md` com duracao de ate 30 segundos, narracao em portugues, indicacoes visuais de 0 a 30s e instrucoes tecnicas de gravacao.
- Higiene e Seguranca: Zero credenciais, zero e-mails pessoais, sem emojis, valores inteiros para piscadas/min, alerta preditivo rotulado como demonstracao.

## Arquivos Exclusivos
- `docs/apresentacao/gerar_apresentacao.py`
- `docs/apresentacao/CrewVitals-Demo.pptx`
- `docs/apresentacao/CrewVitals-Demo.pdf`
- `docs/apresentacao/ROTEIRO-VIDEO-30S.md`

## Validacao
1. Execucao de `python docs/apresentacao/gerar_apresentacao.py`.
2. Validacao de 7 slides via `python-pptx`.
3. Verificacao de ausencia de credenciais / senhas.
4. Diff vazio em arquivos protegidos (`src/`, `supabase/`, `package.json`, etc.).
5. Commit atomico exclusivo em `docs/apresentacao/`.
