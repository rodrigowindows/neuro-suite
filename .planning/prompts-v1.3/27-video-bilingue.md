/gsd-quick Fase 27 do marco v1.3 (CrewVitals): roteiro de vídeo de 30 s em inglês e português. Não depende de nenhuma outra fase (pode rodar já).

## Contexto

Existe `docs/apresentacao/ROTEIRO-VIDEO-30S.md` (português, aprovado na auditoria v1.2). A banca assiste em inglês, então a versão principal passa a ser em inglês, com o português mantido. Ninguém gravou vídeo ainda: o entregável continua sendo roteiro de gravação. Leia antes: `AGENTS.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `docs/apresentacao/ROTEIRO-VIDEO-30S.md`, `src/pages/Demo.tsx` e `src/lib/demoScenario.ts`.

## Arquivos exclusivos

`docs/apresentacao/VIDEO-SCRIPT-30S.en.md` (novo) e `docs/apresentacao/ROTEIRO-VIDEO-30S.md` (somente ajustes pontuais descritos abaixo). Não toque em `gerar_apresentacao.py` nem nos `.pptx`/`.pdf` (fase 26).

## O que fazer

1. Crie `VIDEO-SCRIPT-30S.en.md` com a mesma estrutura do roteiro PT (parâmetros de gravação, tabela cena a cena, checklist pré-gravação), em inglês:
   - Entrada em `https://neuro-suite.lovable.app/demo?lang=en` (janela anônima, sem login, sem cadastro).
   - Cenas e tempos que somam no máximo 30 s (0-5 abertura com o selo "DEMO: simulated data"; 5-12 NO-GO com BioScore 34, 14 blinks/min, sleep 5.5 h; 12-19 "Start 4-7-8 Protocol" leva a CAUTION, BioScore 52; 19-27 "Simulate new scan" leva a GO, BioScore 72, 18 blinks/min, botão "Start Shift"; 27-30 link final).
   - Texto de narração em inglês falado, curto, com ritmo de 30 s (confira o tamanho: cerca de 70 a 80 palavras no total, no máximo).
   - Só botões que existem em `Demo.tsx` na versão EN: "Start 4-7-8 Protocol", "Simulate new scan", "Start Shift", "Restart demo".
   - Frase de honestidade: simulated data; the predictive alert is a demonstration, not a validated prediction.
   - Sem HRV como número em tela (ele não aparece na demo), sem credenciais, sem e-mail pessoal, sem emojis.
2. Ajuste mínimo em `ROTEIRO-VIDEO-30S.md`: apontar a entrada para `...demo?lang=pt` e acrescentar no topo uma linha "Versão em inglês: `VIDEO-SCRIPT-30S.en.md`". O resto permanece.
3. Acrescente em ambos um bloco "Legendas" explicando que, se o vídeo for narrado em um idioma, a legenda no outro idioma deve seguir o texto da narração (sem tradução livre).

## Verificação (cole a saída real no SUMMARY)

```bash
python - <<'PY'
import re
t=open('docs/apresentacao/VIDEO-SCRIPT-30S.en.md',encoding='utf-8').read()
print(sorted(set(re.findall(r'\b(?:38|48|26|20)\b',t))))
print([b for b in ('Start 4-7-8 Protocol','Simulate new scan','Start Shift') if b not in t])
PY
git diff --stat -- src supabase package.json package-lock.json vite.config.ts
```

Esperado: nenhuma métrica errada (38, 48, 26, 20), nenhum botão faltando, diff fora de `docs/apresentacao/` vazio. Some as durações das cenas e confirme 30 s no máximo; conte as palavras da narração e registre.

## Entrega

`.planning/phases/27-video-bilingue/PLAN.md` e `SUMMARY.md`. Commit só dos 2 arquivos: `docs(video): roteiro de 30s em ingles e portugues`. Sem push.
