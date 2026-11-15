<a id="top"></a>
<a id="english"></a>

# CrewVitals — Crew Health Telemetry & Operational Decision Support Platform

[English](#english) | [Português](#português)

> **Ethical and Regulatory Notice:**  
> Operational decision support tool for crew members. Does not substitute professional medical evaluation.

---

## Public Demo (no login)

For direct evaluation by the review board and external evaluators:

- **Direct Access (English):** [https://neuro-suite.lovable.app/demo?lang=en](https://neuro-suite.lovable.app/demo?lang=en)
- **Direct Access (Portuguese):** [https://neuro-suite.lovable.app/demo?lang=pt](https://neuro-suite.lovable.app/demo?lang=pt)
- **Access Guarantee:** No login, no sign-up, no permissions. 100% simulated data. The predictive alert is a demonstration, not a validated prediction.
- **Presentation Decks:** [CrewVitals-Demo-EN.pdf](docs/apresentacao/CrewVitals-Demo-EN.pdf) and [CrewVitals-Demo-PT.pdf](docs/apresentacao/CrewVitals-Demo-PT.pdf)
- **Documentation & Reviewer Resources:** See the [publication directory](docs/publicacao/) for checklists and official submission links.
- **Repository:** [https://github.com/rodrigowindows/neuro-suite](https://github.com/rodrigowindows/neuro-suite)

---

## Overview

CrewVitals is a physiological telemetry and operational Decision Support System (DSS) platform designed for continuous monitoring, mission readiness, and proactive cognitive fatigue mitigation in operational crews and safety-critical aerospace missions.

---

## Active Modules

- **Shift Assessment:** Periodic logging and tracking of crew physical and cognitive operational readiness, focusing on operational readiness and workload.
- **BioScore:** Biometric monitoring preserving physiological classification threshold precision, formatting blink rate at the display boundary.
- **Mission Discipline:** Operational engagement tracking and adherence to mission physiological stability and resilience protocols (Initial Check-in, Continuous Monitoring, Physiological Resilience and Stability Protocol).
- **AstroAssist DSS:** Decision Support System for immediate countermeasure recommendation and mitigation with progress tracking and verification:
  - *4-7-8 Countermeasure:* 3-minute guided breathing cycle for vagal stabilization.
  - *Hydration:* Operational intake of 500 ml of water.
  - *90-Minute Sleep:* Scheduling and completion of a 90-minute ultradian rest/sleep block.
- **Cognitive Fatigue Metrics:** Analytical panel for cognitive workload, shift observation logs, and a scientific foundation modal grounded in NASA Human Research Program (HRP) literature and blink rate analysis.
- **Crew Health Telemetry Report:** Consolidated technical report export featuring readiness data, sleep records, ARED workout logs, and mandatory ethical disclaimers.

---

## Technologies Used

- **Frontend:** React 18, TypeScript, Vite
- **Styling & Components:** Tailwind CSS, shadcn/ui, Radix UI, Lucide Icons
- **State Management & Data Fetching:** TanStack Query (React Query)
- **Computer Vision & Biometrics:** MediaPipe Tasks Vision
- **Backend & Persistence:** Supabase, Drizzle ORM
- **Testing:** Vitest, Testing Library

---

## How to Run Locally

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Start the development server:**
   ```sh
   npm run dev
   ```

3. **Run the test suite:**
   ```sh
   npm test
   ```

4. **Validate production build:**
   ```sh
   npm run build
   ```

---

## Ethical and Governance Guidelines

- **Operational Support, Not Diagnosis:** CrewVitals is designed strictly as an operational decision support tool (DSS) for crew members and ground teams. All predictive alerts and metrics are preventive support instruments and labeled demonstrations; they do not constitute clinical diagnoses or medical advice.

---

<a id="portugues"></a>
<a id="português"></a>

# Português

## CrewVitals — Plataforma de Telemetria Fisiológica e Suporte à Decisão Operacional

[English](#english) | [Português](#português)

> **Aviso Ético e Regulatório:**  
> Ferramenta de apoio operacional à tripulação. Não substitui avaliação médica profissional.

---

## Demonstração Pública (Acesso sem Login)

Para avaliação direta da banca examinadora e revisores externos:

- **Link de Acesso Direto (Português):** [https://neuro-suite.lovable.app/demo?lang=pt](https://neuro-suite.lovable.app/demo?lang=pt)
- **Link de Acesso Direto (Inglês):** [https://neuro-suite.lovable.app/demo?lang=en](https://neuro-suite.lovable.app/demo?lang=en)
- **Acesso sem Login:** Sem login, sem cadastro, sem permissões. Dados 100% simulados. O alerta preditivo é uma demonstração, não uma previsão clínica validada.
- **Apresentações:** [CrewVitals-Demo-PT.pdf](docs/apresentacao/CrewVitals-Demo-PT.pdf) e [CrewVitals-Demo-EN.pdf](docs/apresentacao/CrewVitals-Demo-EN.pdf)
- **Documentação e Recursos da Banca:** Consulte o [diretório de publicação](docs/publicacao/) (incluindo o [Checklist de Publicação](docs/publicacao/CHECKLIST-PUBLICACAO.md) e a tabela de [Links Oficiais da Banca](docs/publicacao/LINKS.md)).
- **Repositório:** [https://github.com/rodrigowindows/neuro-suite](https://github.com/rodrigowindows/neuro-suite)

---

## Visão Geral

O **CrewVitals** é uma plataforma de telemetria fisiológica e suporte à decisão operacional (DSS) desenhada para monitoramento contínuo, prontidão de missão e mitigação proativa de fadiga cognitiva em tripulações operacionais e missões críticas aeroespaciais.

---

## Módulos Ativos

- **Avaliação de Turno:** Registro e acompanhamento periódico da prontidão física e cognitiva operacional da tripulação, com foco em prontidão operacional e carga de trabalho.
- **BioScore:** Monitoramento biométrico com preservação da precisão dos limiares de classificação fisiológica e formatação precisa de taxas de piscamento (*blink rate*) na camada de visualização.
- **Disciplina de Missão:** Sistema de engajamento operacional e adesão aos protocolos de resiliência e estabilidade fisiológica da missão (Check-in Inicial, Monitoramento Constante, Protocolo de Resiliência e Estabilidade Fisiológica).
- **AstroAssist DSS:** Sistema de Suporte à Decisão para mitigação e prescrição de contramedidas operacionais imediatas com barra de progresso e verificação:
  - *Contramedida 4-7-8:* Ciclo de respiração guiada de 3 minutos para estabilização vagal.
  - *Hidratação:* Ingestão operacional de 500 ml de água.
  - *Sono 90min:* Agendamento e cumprimento de bloco de descanso/sono ultradiano de 90 minutos.
- **Métricas de Fadiga Cognitiva:** Painel analítico de carga cognitiva, registro de observações do turno e modal de base científica fundamentado em referências da NASA HRP (Human Research Program) e análise de piscamento.
- **Relatório de Telemetria de Saúde da Tripulação:** Exportação de relatórios técnicos consolidados, com dados de prontidão, registros de sono, log de treino ARED e disclaimers éticos obrigatórios.

---

## Tecnologias Utilizadas

- **Frontend:** React 18, TypeScript, Vite
- **Estilização & Componentes:** Tailwind CSS, shadcn/ui, Radix UI, Lucide Icons
- **Gerenciamento de Estado & Requisições:** TanStack Query (React Query)
- **Visão Computacional & Biometria:** MediaPipe Tasks Vision
- **Backend / Persistência:** Supabase, Drizzle ORM
- **Testes:** Vitest, Testing Library

---

## Como Executar Localmente

1. **Instale as dependências:**
   ```sh
   npm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```sh
   npm run dev
   ```

3. **Execute a suíte de testes:**
   ```sh
   npm test
   ```

4. **Valide a compilação de produção:**
   ```sh
   npm run build
   ```

---

## Diretrizes Éticas e de Governança

- **Suporte Operacional, Não Diagnóstico:** O CrewVitals foi concebido como uma ferramenta de apoio à decisão para a tripulação e equipes de solo. Todos os alertas preditivos e métricas são instrumentos de suporte preventivo e demonstrações rotuladas, não constituindo diagnóstico ou parecer clínico.
