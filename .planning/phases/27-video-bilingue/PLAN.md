# Plano da Fase 27 — Roteiro de Vídeo Bilíngue (CrewVitals v1.3)

## Objetivo

Criar a versão em inglês do roteiro de vídeo de 30 segundos (`docs/apresentacao/VIDEO-SCRIPT-30S.en.md`) e atualizar o roteiro em português (`docs/apresentacao/ROTEIRO-VIDEO-30S.md`), mantendo estrita paridade com a interface operacional de `src/pages/Demo.tsx` e o cenário de `src/lib/demoScenario.ts`.

## Escopo e Arquivos Exclusivos

- `docs/apresentacao/VIDEO-SCRIPT-30S.en.md` (novo)
- `docs/apresentacao/ROTEIRO-VIDEO-30S.md` (ajustes pontuais)

## Requisitos Atendidos

1. **Parâmetros Técnicos e Ponto de Entrada**:
   - `VIDEO-SCRIPT-30S.en.md`: ponto de entrada `https://neuro-suite.lovable.app/demo?lang=en` (janela anônima, sem login).
   - `ROTEIRO-VIDEO-30S.md`: ponto de entrada atualizado para `https://neuro-suite.lovable.app/demo?lang=pt` e link de cabeçalho para a versão em inglês.
2. **Cenário Cronometrado em 30 Segundos**:
   - 00:00 - 00:05 (5 s): Abertura na demo pública com selo `DEMO: simulated data`.
   - 00:05 - 00:12 (7 s): NO-GO com BioScore 34, 14 blinks/min e sono 5.5 h (HRV 28 ms nos bastidores).
   - 00:12 - 00:19 (7 s): Ação 'Start 4-7-8 Protocol' transicionando para CAUTION (BioScore 52, 14 blinks/min).
   - 00:19 - 00:27 (8 s): Ação 'Simulate new scan' estabilizando em GO (BioScore 72, 18 blinks/min) e exibição do botão 'Start Shift'.
   - 00:27 - 00:30 (3 s): Encerramento com URL pública demonstrativa.
3. **Narração em Inglês Concisa (70 a 80 palavras)**:
   - Texto objetivo e profissional sem emojis nem alegações não comprovadas.
   - 74 palavras no total da locução em inglês.
4. **Botões Reais de `Demo.tsx`**:
   - 'Start 4-7-8 Protocol', 'Simulate new scan', 'Start Shift', 'Restart demo'.
5. **Divulgação de Honestidade Científica**:
   - Alerta preditivo é demonstração rotulada e não modelo validado clinicamente; dados simulados fixos.
6. **Legendas e Acessibilidade**:
   - Bloco documentado em ambos os roteiros com regras de transcrição fiel sem tradução livre.
