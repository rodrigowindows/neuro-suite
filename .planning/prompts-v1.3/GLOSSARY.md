# Glossário EN/PT do CrewVitals (fonte única para todos os prompts do v1.3)

Leitura obrigatória antes de traduzir qualquer texto. Somente leitura: nenhum prompt edita este arquivo.

## Regras de tom e honestidade

- Inglês dos EUA, operacional e conciso (estilo cockpit). Sem emojis. Sem exclamações de marketing.
- Tradução não pode acrescentar alegações. Proibido: "NASA-approved", "clinically validated", "medical device", "real-time prediction", depoimentos, números novos.
- Sempre manter: dados da demo são **simulados**; o alerta preditivo é **demonstração, não previsão clínica validada**; o CrewVitals é um **Decision Support System (DSS)** e não substitui avaliação médica.
- Números e valores do cenário não mudam: etapa 1 = BioScore 34, 14 blinks/min, sleep 5.5 h; etapa 2 = 52, 14, 5.5 h; etapa 3 = 72, 18, 5.5 h. HRV 28, 45, 62 ms existe no cenário mas não aparece na tela da demo.
- Formato numérico: PT usa vírgula decimal ("5,5 h"); EN usa ponto ("5.5 h"). Piscadas sempre inteiras (`roundBlinkRate`). O texto PT atual da demo deve continuar idêntico, a menos que o prompt diga o contrário.
- Nomes que não se traduzem: CrewVitals, BioScore, HRV, DSS, GO, NO-GO, EVA, RLS, Lovable, GitHub.

## Termos

| PT (atual) | EN |
|---|---|
| Terminal de Telemetria de Saúde da Tripulação | Crew Health Telemetry Terminal |
| Sistema de Suporte à Decisão (DSS) | Decision Support System (DSS) |
| DEMO: dados simulados | DEMO: simulated data |
| GO - APTO PARA O TURNO | GO - FIT FOR SHIFT |
| ATENÇÃO - VIGILÂNCIA | CAUTION - WATCH |
| NO-GO - FADIGA (NÃO APTO) | NO-GO - FATIGUE (NOT FIT) |
| AGUARDANDO SCAN | AWAITING SCAN |
| veredito baseado em estresse e HRV | verdict based on stress and HRV |
| Piscadas/min | Blinks/min |
| Sono | Sleep |
| Iniciar Protocolo 4-7-8 | Start 4-7-8 Protocol |
| Simular novo scan | Simulate new scan |
| Iniciar Turno | Start Shift |
| Reiniciar demonstração | Restart demo |
| Entrar | Sign in |
| Fechar | Close |
| Autenticar / Autenticando... | Sign in / Signing in... |
| Ver demonstração (sem login) | View demo (no login) |
| Ver demonstração sem login | View demo without signing in |
| LOG DE EVENTOS RECENTES | RECENT EVENT LOG |
| [há 10 min] / [há 2 min] / [agora] | [10 min ago] / [2 min ago] / [now] |
| Alerta Preditivo: Fadiga Elevada (BioScore 34) | Predictive alert: Elevated fatigue (BioScore 34) |
| Ação: Contramedida executada (Respiração 4-7-8) | Action: Countermeasure executed (4-7-8 breathing) |
| Status atualizado: Estável (BioScore 72, HRV 62) | Status updated: Stable (BioScore 72, HRV 62) |
| Contramedida local executada: 3 ciclos de respiração 4-7-8 concluídos. | Local countermeasure executed: 3 cycles of 4-7-8 breathing completed. |
| Turno operacional iniciado com sucesso. | Operational shift started. |
| Demonstração (selo do alerta) | Demo |
| Risco de erro em tarefas de precisão nas próximas 4 h — suspender acoplagem/EVA. | Risk of errors in precision tasks over the next 4 h — suspend docking/EVA. |
| Cenário demonstrativo — não é uma previsão clínica validada. | Demonstration scenario — not a validated clinical prediction. |
| Contramedida | Countermeasure |
| Tripulação / tripulante | Crew / crew member |
| Prontidão | Readiness |
| Fadiga cognitiva | Cognitive fatigue |
| Histórico de Voo | Flight Log |
| Cockpit | Cockpit |

Termo novo que não esteja aqui: escolha a tradução mais literal e operacional, registre no SUMMARY da sua fase e não crie sinônimos.

## Convenção de chaves (contrato do módulo i18n)

- Arquivo por área em `src/i18n/locales/<ns>.ts`, exportando `en` e `pt` (`Record<string, string>`), todas as chaves prefixadas com `<ns>.`.
- Namespaces reservados: `common` (fase 21), `demo` (22), `predictive` (23), `landing` (24), `auth` (25). Cada fase só escreve no seu namespace.
- Variáveis de interpolação: `{nome}`. Exemplo: `"demo.log.alert": "Predictive alert: Elevated fatigue (BioScore {score})"`.
- As duas línguas precisam ter exatamente as mesmas chaves (há teste de paridade).
