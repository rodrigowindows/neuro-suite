/gsd-quick Fase 17 (correção do v1.2, CrewVitals): deck e roteiro de vídeo com números errados e sem acentos.

## Defeitos encontrados na auditoria (verificados no PPTX e no código)

1. O slide 4 do deck e as cenas 2 a 4 de `docs/apresentacao/ROTEIRO-VIDEO-30S.md` citam números que a demo não tem. Valores reais em `src/lib/demoScenario.ts` (`getDemoScenarioData`): etapa 1 BioScore 34, HRV 28, 14 piscadas/min, sono 5,5 h; etapa 2 BioScore 52, HRV 45, 14 piscadas/min; etapa 3 BioScore 72, HRV 62, 18 piscadas/min. O deck diz HRV 38 e 26 piscadas (etapa 1), HRV 48 e 20 piscadas (etapa 2) e 14 piscadas (etapa 3). O vídeo repete 38 ms e 26 piscadas e fala em 14 piscadas no GO. Isso viola a regra de honestidade do projeto (nada inventado).
2. A página `/demo` mostra três números: BioScore, Piscadas/min e Sono. HRV NÃO aparece em `src/pages/Demo.tsx`. O slide 3 e o vídeo tratam HRV como um dos "três números essenciais".
3. O roteiro de vídeo manda clicar em "Registrar Execucao de Contramedidas", botão que não existe. Fluxo real: a etapa 1 mostra o botão "Iniciar Protocolo 4-7-8", que já registra a contramedida e leva à etapa 2 (ATENÇÃO); na etapa 2 o botão primário é "Simular novo scan", que leva à etapa 3 (GO) com o botão "Iniciar Turno". O cabeçalho também tem "Simular novo scan" e "Reiniciar demonstração".
4. Todo o texto do deck e do roteiro perdeu os acentos ("Saude", "Tripulacao", "ATENCAO"). O deck anterior e o app têm acentos. Para uma banca isso parece erro.

## Arquivos exclusivos

`docs/apresentacao/**`. Não toque em `src/`, `README.md` nem `docs/publicacao/`.

## O que fazer

1. Leia `src/lib/demoScenario.ts` e `src/pages/Demo.tsx` e monte uma tabela de verdade com os valores por etapa (confirme também o sono da etapa 3). Todo número no deck e no vídeo vem dela. Cite só o que aparece na tela: BioScore, piscadas/min (inteiras) e sono. O mais simples é tirar o HRV dos slides 3 e 4 e do vídeo. Se mantiver, diga que é valor simulado do cenário e que não aparece na tela da demo.
2. Reescreva o slide 3 (três números: BioScore, piscadas/min, horas de sono), o slide 4 (tabela das 3 etapas com valores e botões reais) e as cenas do vídeo (botões reais, tempos somando no máximo 30 s).
3. Restaure a acentuação correta em `gerar_apresentacao.py` e no roteiro (UTF-8). Confirme que PPTX e PDF renderizam os acentos sem caracteres quebrados.
4. Mantenha 7 slides no PPTX e 7 páginas no PDF, sem credenciais, sem emojis, URL `https://neuro-suite.lovable.app/demo` e a ressalva "dados simulados; alerta preditivo é demonstração".
5. Regenere PPTX e PDF.

## Verificação (cole a saída real no SUMMARY)

```bash
python docs/apresentacao/gerar_apresentacao.py
python -c "from pptx import Presentation; print(len(Presentation('docs/apresentacao/CrewVitals-Demo.pptx').slides))"
python -c "import fitz; d=fitz.open('docs/apresentacao/CrewVitals-Demo.pdf'); print(len(d)); print(d[3].get_text()[:600])"
python -c "import re; t=open('docs/apresentacao/ROTEIRO-VIDEO-30S.md',encoding='utf-8').read(); print(sorted(set(re.findall(r'\b(?:26|38|48|20)\b',t))))"
git diff --stat -- src supabase package.json package-lock.json vite.config.ts
```

Esperado: 7, 7, texto da etapa 4 com acentos e valores 34/14/5,5, 52/14 e 72/18; nenhum 26, 38, 48 ou 20 como métrica; diff fora de `docs/apresentacao/` vazio. Renderize 2 páginas do PDF em imagem (`page.get_pixmap()`) e confira que não há texto cortado.

## Entrega

`.planning/phases/17-corrigir-deck-video/PLAN.md` e `SUMMARY.md`. Commit só de `docs/apresentacao/**`: `fix(apresentacao): numeros reais da demo, botoes reais e acentuacao`. Sem push.
