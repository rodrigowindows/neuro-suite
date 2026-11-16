# Plano — Fase 26: Deck de 7 Slides Bilíngue (EN/PT)

## Objetivo
Refatorar `docs/apresentacao/gerar_apresentacao.py` para gerar o deck de 7 slides em inglês (`CrewVitals-Demo-EN.*`), manter a versão em português (`CrewVitals-Demo-PT.*`) e manter `CrewVitals-Demo.*` como cópia idêntica da versão inglesa (padrão oficial para a banca).

## Estrutura de Slides (7 slides estritos)
1. Cover / Título: CrewVitals — Crew Health Telemetry Terminal / Terminal de Telemetria de Saúde da Tripulação
2. Bullets / Problema: Cognitive fatigue in long-duration spaceflight / Fadiga cognitiva em voos de longa duração
3. Cards / Solução: 3-tier operational cockpit / Cockpit operacional de 3 níveis
4. Table / Demonstração: 3-stage operational walkthrough / Roteiro operacional em 3 etapas (BioScores 34, 52, 72; 14, 14, 18 blinks/min; sono 5.5 h / 5,5 h; botões reais de Demo.tsx; sem HRV em tela)
5. Table / Transparência Científica: Measured versus simulated / Medido versus simulado (100% simulado, alerta demonstração, DSS, sem backend)
6. Bullets / Privacidade e Segurança: Telemetry privacy and security / Privacidade e segurança da telemetria
7. Closing / Fechamento: Links para /demo?lang=en e /demo?lang=pt, repo GitHub, isenção médica DSS

## Arquivos exclusivos
- `docs/apresentacao/gerar_apresentacao.py`
- `docs/apresentacao/CrewVitals-Demo-EN.pptx`
- `docs/apresentacao/CrewVitals-Demo-EN.pdf`
- `docs/apresentacao/CrewVitals-Demo-PT.pptx`
- `docs/apresentacao/CrewVitals-Demo-PT.pdf`
- `docs/apresentacao/CrewVitals-Demo.pptx`
- `docs/apresentacao/CrewVitals-Demo.pdf`

## Critérios de Aceite e Verificação
1. `python docs/apresentacao/gerar_apresentacao.py` gera todos os arquivos sem erro.
2. Contagem de slides: `[7, 7] 7` em PPTX e `[7, 7]` em PDF.
3. Métricas 34, 52, 72 presentes, sem menção a senhas ou emails pessoais ('@' ausente).
4. Zero diff em `src/`, `supabase/`, `package.json`, etc.
5. Renderização visual das páginas 4 e 7 sem cortes ou sobreposições.
