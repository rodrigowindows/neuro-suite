/gsd-quick Fase 26 do marco v1.3 (CrewVitals): deck de 7 slides em inglês e português. Não depende de nenhuma outra fase (pode rodar já).

## Contexto

O deck atual (`docs/apresentacao/gerar_apresentacao.py` gera `CrewVitals-Demo.pptx` e `.pdf`, 7 slides, português, aprovado na auditoria v1.2) precisa de uma versão em **inglês**, que será a principal para a banca, mantendo a versão em português. Leia antes: `AGENTS.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `docs/apresentacao/gerar_apresentacao.py` (472 linhas), `src/lib/demoScenario.ts` (valores do cenário) e `src/pages/Demo.tsx` (botões reais).

## Arquivos exclusivos

`docs/apresentacao/gerar_apresentacao.py` e os arquivos gerados em `docs/apresentacao/`. Não toque no roteiro de vídeo (fase 27), em `src/`, `README.md` nem `docs/publicacao/`.

## O que implementar

1. Refatore o gerador para receber o idioma (`python docs/apresentacao/gerar_apresentacao.py` gera as duas versões; aceite também `--lang en|pt`). Separe o conteúdo dos slides em dois blocos de dados (`SLIDES_PT`, `SLIDES_EN`) com a mesma estrutura. Não adicione dependência de projeto; use o que o script já usa.
2. Saídas:
   - `CrewVitals-Demo-EN.pptx` e `CrewVitals-Demo-EN.pdf` (nova).
   - `CrewVitals-Demo-PT.pptx` e `CrewVitals-Demo-PT.pdf` (conteúdo atual).
   - Mantenha `CrewVitals-Demo.pptx` e `CrewVitals-Demo.pdf` como cópia idêntica da versão **inglesa** (nome estável que a banca e os documentos já citam).
3. Estrutura dos 7 slides igual nas duas línguas: título, introdução/problema, solução (cockpit), demonstração (3 etapas), medido versus simulado, privacidade e segurança, fechamento com o link. EN no slide 7: `https://neuro-suite.lovable.app/demo?lang=en` ("direct access, no login"); PT: `...?lang=pt`; repositório `https://github.com/rodrigowindows/neuro-suite`.
4. Números e botões idênticos ao app, nas duas versões: etapa 1 BioScore 34, 14 blinks/min, sleep 5.5 h; etapa 2 52, 14, 5.5 h; etapa 3 72, 18, 5.5 h. Botões EN: "Start 4-7-8 Protocol", "Simulate new scan", "Start Shift", "Restart demo". Não cite HRV como número em tela (ele não aparece na demo); se citar, diga que é valor simulado do cenário. Termos EN do `GLOSSARY.md`.
5. Honestidade em EN: demo 100% simulated, no backend calls; the predictive alert is a demonstration, not a validated prediction; DSS, does not replace medical evaluation. Sem credenciais, sem e-mail pessoal, sem emojis, sem alegações novas.
6. Qualidade visual: nenhum texto cortado nem sobreposto nas duas versões (EN costuma ser mais curto, mas confira títulos longos). Acentos íntegros em PT.

## Verificação (cole a saída real no SUMMARY)

```bash
python docs/apresentacao/gerar_apresentacao.py
python -c "from pptx import Presentation as P; print([len(P(f'docs/apresentacao/CrewVitals-Demo-{l}.pptx').slides) for l in ('EN','PT')], len(P('docs/apresentacao/CrewVitals-Demo.pptx').slides))"
python -c "import pymupdf; print([len(pymupdf.open(f'docs/apresentacao/CrewVitals-Demo-{l}.pdf')) for l in ('EN','PT')])"
python -c "import pymupdf,re; t=' '.join(p.get_text() for p in pymupdf.open('docs/apresentacao/CrewVitals-Demo-EN.pdf')); print(re.findall(r'BioScore \d+', t), 'senha' in t.lower(), '@' in t)"
git diff --stat -- src supabase package.json package-lock.json vite.config.ts
```

Esperado: `[7, 7] 7`, `[7, 7]`, BioScore 34, 52 e 72, sem "senha" nem "@", diff fora de `docs/apresentacao/` vazio. Renderize pelo menos as páginas 4 e 7 de cada PDF em imagem (`page.get_pixmap()`) e confira que não há texto cortado.

## Entrega

`.planning/phases/26-deck-bilingue/PLAN.md` e `SUMMARY.md`. Commit só de `docs/apresentacao/gerar_apresentacao.py` e dos `.pptx`/`.pdf`: `docs(apresentacao): deck de 7 slides em ingles e portugues`. Sem push.
