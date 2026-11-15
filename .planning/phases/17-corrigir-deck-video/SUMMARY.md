# Resumo da Fase 17 — Correção do Deck e Roteiro de Vídeo (CrewVitals)

## Status: Concluído ✓

Data: 2026-11-15
Commit exclusivo: `fix(apresentacao): numeros reais da demo, botoes reais e acentuacao`

## Alterações Realizadas

1. **`docs/apresentacao/gerar_apresentacao.py`**:
   - Slide 3 atualizado para refletir os 3 números reais exibidos em tela: BioScore global, taxa de piscadas (piscadas/min) e horas de sono, apontando que o HRV atua nos bastidores do cálculo.
   - Slide 4 reformulado com tabela de 3 etapas alinhada a `src/lib/demoScenario.ts`:
     - Etapa 1: BioScore 34, 14 piscadas/min, sono 5,5 h (HRV 28 ms nos bastidores). Botão: 'Iniciar Protocolo 4-7-8'.
     - Etapa 2: BioScore 52, 14 piscadas/min, sono 5,5 h (HRV 45 ms nos bastidores). Botão: 'Simular novo scan'.
     - Etapa 3: BioScore 72, 18 piscadas/min, sono 5,5 h (HRV 62 ms nos bastidores). Botão: 'Iniciar Turno'.
   - Acentuação gráfica integral restaurada em todos os slides e rodapés ("Saúde", "Tripulação", "ATENÇÃO", "Demonstração Operacional", etc.).
   - Regenerados `CrewVitals-Demo.pptx` e `CrewVitals-Demo.pdf`.

2. **`docs/apresentacao/ROTEIRO-VIDEO-30S.md`**:
   - Ajustadas as cenas 2, 3 e 4 com os números exatos e arredondamentos reais da demo.
   - Removido o botão fictício "Registrar Execucao de Contramedidas".
   - Fluxo real integrado: "Iniciar Protocolo 4-7-8" -> "Simular novo scan" -> "Iniciar Turno".
   - Cronometragem validada somando exatamente 30 s (5 + 7 + 7 + 8 + 3 s) sem qualquer ocorrência de métricas antigas (26, 38, 48 ou 20).
   - Acentuação completa em UTF-8 restaurada.

## Saídas Reais de Verificação

### 1. Geração de Apresentação
```bash
python docs/apresentacao/gerar_apresentacao.py
```
Saída:
```
PPTX: C:\Projetos\neuro-suite\docs\apresentacao\CrewVitals-Demo.pptx
PDF:  C:\Projetos\neuro-suite\docs\apresentacao\CrewVitals-Demo.pdf
Slides: 7
```

### 2. Contagem de Slides no PPTX
```bash
python -c "from pptx import Presentation; prs = Presentation('docs/apresentacao/CrewVitals-Demo.pptx'); assert len(prs.slides) == 7, f'Erro: {len(prs.slides)} slides'"
```
Saída: Exit code 0 (7 slides confirmados).

### 3. Contagem e Amostra de Texto no PDF
```bash
python -c "import fitz; d=fitz.open('docs/apresentacao/CrewVitals-Demo.pdf'); assert len(d) == 7; print(d[3].get_text()[:300])"
```
Saída:
```
Demonstração: roteiro operacional em 3 etapas
Etapa
Estado e Métricas em Tela
Ação Operacional e Botão Real
Etapa 1: Abertura
NO-GO — Não Apto (BioScore 34, 14 piscadas/min, sono
5,5 h; HRV 28 ms nos bastidores)
Acesso direto à rota pública /demo com selo DEMO. Botão
primário: 'Iniciar Protocolo 4-7
```

### 4. Varredura de Métricas Antigas no Roteiro
```bash
python -c "import re; t=open('docs/apresentacao/ROTEIRO-VIDEO-30S.md',encoding='utf-8').read(); print(sorted(set(re.findall(r'\b(?:26|38|48|20)\b', t)))); assert not re.findall(r'\b(?:26|38|48|20)\b', t), 'Metricas antigas detectadas'"
```
Saída: `[]` (Exit code 0, nenhuma ocorrência).

### 5. Verificação de Diff Blindado
```bash
git diff --stat -- src supabase package.json package-lock.json vite.config.ts
```
Saída: Vazia (zero alterações fora de `docs/apresentacao/`).
