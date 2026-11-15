# Plano da Fase 17 — Correção do Deck e Roteiro de Vídeo (CrewVitals)

## Objetivo

Corrigir divergências numéricas, nomes de botões e acentuação no deck de slides e no roteiro de vídeo de 30 segundos, alinhando rigorosamente com os dados reais simulados em `src/lib/demoScenario.ts` e a interface de `src/pages/Demo.tsx`.

## Escopo e Arquivos Exclusivos

- `docs/apresentacao/gerar_apresentacao.py`
- `docs/apresentacao/CrewVitals-Demo.pptx`
- `docs/apresentacao/CrewVitals-Demo.pdf`
- `docs/apresentacao/ROTEIRO-VIDEO-30S.md`

## Defeitos Corrigidos

1. **Alinhamento Numérico Estrito**:
   - Etapa 1: BioScore 34, 14 piscadas/min, 5,5 h sono (HRV 28 ms nos bastidores).
   - Etapa 2: BioScore 52, 14 piscadas/min, 5,5 h sono (HRV 45 ms nos bastidores).
   - Etapa 3: BioScore 72, 18 piscadas/min, 5,5 h sono (HRV 62 ms nos bastidores).
   - Remoção de métricas fictícias (HRV 38 ms, 26 piscadas/min, HRV 48 ms, 20 piscadas/min).
2. **Três Números em Tela**:
   - A tela `/demo` exibe exclusivamente BioScore, Piscadas/min e Sono.
   - O Slide 3 e o roteiro esclarecem que o HRV atua nos bastidores do cálculo de prontidão e não é exibido diretamente no cockpit.
3. **Botões e Fluxo Real**:
   - Remoção do botão inexistente "Registrar Execucao de Contramedidas".
   - Fluxo real documentado: "Iniciar Protocolo 4-7-8" (etapa 1) -> "Simular novo scan" (etapa 2) -> "Iniciar Turno" (etapa 3).
4. **Restauração de Acentuação Gráfica em UTF-8**:
   - Restauração de todos os acentos e caracteres ortográficos em português ("Saúde", "Tripulação", "ATENÇÃO", "Decisão", "Demonstração", etc.).
5. **Regeneração de Artefatos**:
   - 7 slides no PPTX e 7 páginas no PDF, sem emojis, sem credenciais, link oficial `https://neuro-suite.lovable.app/demo`.
