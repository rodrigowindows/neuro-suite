/gsd-quick Fase 14 do marco v1.2 (CrewVitals): deck de 7 slides e roteiro de vídeo de 30 s, sem login nem credenciais.

## Contexto

Exigência da banca: demo em 7 slides (título e introdução incluídos) OU vídeo de no máximo 30 s, em link público que não peça senha, permissão nem cadastro. O deck atual (`docs/apresentacao/CrewVitals-Demo.pptx` e `.pdf`, gerado por `docs/apresentacao/gerar_apresentacao.py`) tem 9 slides e manda "fazer login com [EMAIL DA CONTA DEMO] e [SENHA]". Isso não serve mais. A demo agora é pública em `https://neuro-suite.lovable.app/demo` (outro terminal cria a rota; você só cita a URL). Leia antes: `AGENTS.md`, `.planning/ROADMAP.md` (seção v1.2), `docs/apresentacao/gerar_apresentacao.py`, `docs/seguranca/RESUMO-APPSEC.md`.

## Arquivos exclusivos

`docs/apresentacao/**` (script gerador, PPTX, PDF e o novo roteiro). Não toque em `src/`, `README.md` nem `docs/publicacao/`.

## Requisitos

1. PUB-07: exatamente 7 slides no PPTX (verifique com `python-pptx`: `len(prs.slides) == 7`). Estrutura sugerida:
   1. Título: CrewVitals, subtítulo "Terminal de Telemetria de Saúde da Tripulação".
   2. Introdução: o problema (fadiga cognitiva em ambientes críticos) e a pergunta "o tripulante está apto para o turno?".
   3. Solução: cockpit de 3 níveis (semáforo GO/ATENÇÃO/NO-GO, 3 números essenciais, ação primária única).
   4. Demonstração: o roteiro de 3 etapas (NO-GO BioScore 34, ATENÇÃO 52, GO 72), com "Simular novo scan".
   5. Medido versus simulado: tabela honesta. A demo pública é 100% simulada; nenhuma previsão validada; o alerta preditivo é demonstração.
   6. Privacidade e segurança: demo sem sessão e sem rede; autenticação, funções protegidas e leituras com colunas explícitas no app completo.
   7. Fechamento: link público `https://neuro-suite.lovable.app/demo` ("acesso direto, sem login"), repositório e contato.
2. PUB-08: o PDF reflete os mesmos 7 slides (gere pelo mesmo script; confira a contagem de páginas = 7).
3. PUB-09: `docs/apresentacao/ROTEIRO-VIDEO-30S.md` com no máximo 30 s no total, 4 a 5 cenas com tempo (ex.: 0-5 s abertura em `/demo` com o selo, 5-12 s NO-GO e os 3 números, 12-20 s "Simular novo scan" e ATENÇÃO, 20-27 s GO, 27-30 s link final), texto de narração curto em português e instrução de gravação (janela anônima, 1280x720, sem mostrar abas pessoais). Mesma regra de honestidade.
4. Nenhuma credencial, nenhum e-mail pessoal, nenhum placeholder de senha, nenhuma menção a "fazer login" como passo da demo. Nenhuma métrica inventada, depoimento ou alegação não sustentada ("100% offline", "0 dados vazados", previsão validada). Sem emojis.
5. Piscadas/min só em valores inteiros de exibição. O alerta preditivo é sempre "demonstração, não previsão validada".
6. O gerador continua rodando com o que já está instalado (`python-pptx`; para o PDF use o que o script atual usa). Não adicione dependência ao projeto (`package.json` é blindado).

## Verificação (cole o resultado real no SUMMARY)

```bash
python docs/apresentacao/gerar_apresentacao.py
python -c "from pptx import Presentation; print(len(Presentation('docs/apresentacao/CrewVitals-Demo.pptx').slides))"
python -c "import re,sys; t=open('docs/apresentacao/gerar_apresentacao.py',encoding='utf-8').read(); print([w for w in ('SENHA','login','EMAIL DA CONTA') if w.lower() in t.lower()])"
git diff --stat -- src/integrations supabase/migrations package.json package-lock.json vite.config.ts
```

Esperado: 7, lista vazia (ou só menções negativas justificadas, como "sem login"), diff dos blindados vazio. Abra o PDF e confira visualmente que não há texto cortado; se não for possível, marque NÃO VERIFICADO.

## Entrega (fluxo GSD)

`.planning/phases/14-deck-7-slides/PLAN.md` curto antes e `SUMMARY.md` depois. Commit atômico só com `docs/apresentacao/**`, mensagem `docs(apresentacao): deck de 7 slides e roteiro de video 30s sem login`. Sem push.
