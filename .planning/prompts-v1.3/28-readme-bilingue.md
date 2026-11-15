/gsd-quick Fase 28 do marco v1.3 (CrewVitals): README em inglês e português. Não depende de nenhuma outra fase (pode rodar já).

## Contexto

O `README.md` está em português e a banca lê em inglês. O README tem a seção "Demonstração Pública (Acesso sem Login)". Leia antes: `AGENTS.md`, `.planning/prompts-v1.3/GLOSSARY.md`, `README.md`.

## Arquivos exclusivos

`README.md`. Não crie nem edite outros arquivos.

## O que fazer

1. Reestruture o README em duas partes no mesmo arquivo: **inglês primeiro**, depois uma seção "Português" completa (links de âncora no topo: `English | Português`).
2. Na parte inglesa, no topo, a seção "Public Demo (no login)":
   - `https://neuro-suite.lovable.app/demo?lang=en` (EN) e `https://neuro-suite.lovable.app/demo?lang=pt` (PT).
   - "No login, no sign-up, no permissions. 100% simulated data. The predictive alert is a demonstration, not a validated prediction."
   - Links para `docs/apresentacao/CrewVitals-Demo-EN.pdf` e `docs/apresentacao/CrewVitals-Demo-PT.pdf` (os arquivos são criados pela fase 26; use esses caminhos mesmo que ainda não existam) e para `docs/publicacao/`.
3. Traduza todo o restante do conteúdo (visão geral, módulos, tecnologias, como executar, diretrizes éticas) seguindo o `GLOSSARY.md`. Mantenha os comandos de shell idênticos.
4. Os títulos de seção do README não devem ter emojis (os atuais `Visão Geral`, `Módulos Ativos`, `Tecnologias Utilizadas`, `Como Executar Localmente` e `Diretrizes Éticas` herdaram emojis; remova-os nas duas línguas).
5. Preserve o aviso ético e regulatório nas duas línguas: ferramenta de apoio operacional (DSS), não substitui avaliação médica.
6. Sem credenciais, sem e-mail pessoal, sem alegações novas ("NASA-approved", "clinically validated" etc.). Não invente URLs; use apenas as citadas acima e o repositório `https://github.com/rodrigowindows/neuro-suite`.

## Verificação (cole a saída real no SUMMARY)

```bash
git grep -n -i -E "AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{10,}|2000171[1]|professor[.]se" -- README.md
python - <<'PY'
import re
t=open('README.md',encoding='utf-8').read()
em=re.compile('[\U0001F300-\U0001FAFF☀-➿⭐✅]')
print([m.group() for m in em.finditer(t)])
PY
git diff --stat
```

Esperado: grep sem saída, nenhum emoji, diff só em `README.md`.

## Entrega

`.planning/phases/28-readme-bilingue/PLAN.md` e `SUMMARY.md`. Commit só de `README.md`: `docs(readme): README em ingles e portugues`. Sem push.
