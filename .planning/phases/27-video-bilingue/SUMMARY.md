# Resumo da Fase 27 — Roteiro de Vídeo Bilíngue (CrewVitals v1.3)

## Status: Concluído ✓

Data: 2026-11-15
Commit exclusivo: `docs(video): roteiro de 30s em ingles e portugues`

## Alterações Realizadas

1. **`docs/apresentacao/VIDEO-SCRIPT-30S.en.md` (novo)**:
   - Estrutura completa em inglês com parâmetros técnicos, tabela cronometrada cena a cena, checklist pré-gravação e seção de legendas e acessibilidade.
   - Ponto de entrada: `https://neuro-suite.lovable.app/demo?lang=en`.
   - Botões reais verificados contra `Demo.tsx`: 'Start 4-7-8 Protocol', 'Simulate new scan', 'Start Shift', 'Restart demo'.
   - Narração em inglês: exatamente 74 palavras (faixa exigida: 70 a 80 palavras).
   - Cronometragem rigorosa de 30 segundos (5 + 7 + 7 + 8 + 3 s).
   - Divulgação clara de honestidade científica: dados simulados, alerta preditivo rotulado como demonstração.
   - Sem métricas legadas (`38`, `48`, `26`, `20`), sem emojis, sem HRV na interface visível.

2. **`docs/apresentacao/ROTEIRO-VIDEO-30S.md`**:
   - Adicionada referência à versão em inglês no cabeçalho: `Versão em inglês: [VIDEO-SCRIPT-30S.en.md](VIDEO-SCRIPT-30S.en.md)`.
   - Atualizado ponto de entrada para `https://neuro-suite.lovable.app/demo?lang=pt` nos parâmetros e checklist.
   - Adicionada seção 4 com orientações de sincronização e fidelidade para legendas e acessibilidade.

## Saídas Reais de Verificação

### 1. Varredura de Métricas Antigas e Presença de Botões
```bash
python -c "import re; t=open('docs/apresentacao/VIDEO-SCRIPT-30S.en.md',encoding='utf-8').read(); print('Old metrics:', sorted(set(re.findall(r'\b(?:38|48|26|20)\b', t)))); assert not re.findall(r'\b(?:38|48|26|20)\b', t), 'Metricas antigas encontradas'; missing = [b for b in ('Start 4-7-8 Protocol','Simulate new scan','Start Shift') if b not in t]; print('Missing buttons:', missing); assert not missing, f'Botoes ausentes: {missing}'; print('SUCCESS')"
```
Saída:
```
Old metrics: []
Missing buttons: []
SUCCESS
```

### 2. Contagem de Palavras da Narração
```bash
python -c "t=open('docs/apresentacao/VIDEO-SCRIPT-30S.en.md',encoding='utf-8').read(); quotes=[l.split('|')[4].strip().strip(chr(34)) for l in t.splitlines() if l.startswith('| **')]; print(quotes); total=sum(len(q.split()) for q in quotes); print('Total words:', total); assert 70 <= total <= 80"
```
Saída:
```
['CrewVitals: operational readiness terminal for space crews, with direct public access and no login required.', 'The system detects elevated cognitive fatigue. NO-GO verdict: BioScore 34, 14 blinks per minute, and 5.5 hours of sleep.', 'The crew member clicks Start 4-7-8 Protocol. The breathing countermeasure raises readiness to CAUTION, with BioScore 52.', 'Clicking Simulate new scan stabilizes metrics at BioScore 72, enabling the Start Shift button to resume operations.', 'Interactive public demo available at neuro-suite.lovable.app/demo.']
Total words: 74
```

### 3. Verificação de Diff Blindado
```bash
git diff --stat -- src supabase package.json package-lock.json vite.config.ts
```
Saída: Vazia (zero alterações no código de produção ou infraestrutura).
