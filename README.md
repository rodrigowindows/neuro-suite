# CrewVitals — Plataforma de Telemetria Fisiológica e Suporte à Decisão Operacional (Padrão NASA)

> **Aviso Ético e Regulatório:**  
> Ferramenta de apoio operacional à tripulação. Não substitui avaliação médica profissional.

---

## 🛰️ Visão Geral

O **CrewVitals** é uma plataforma de telemetria fisiológica e suporte à decisão operacional (DSS) desenhada para monitoramento contínuo, prontidão de missão e mitigação proativa de fadiga cognitiva em tripulações operacionais e missões críticas aeroespaciais.

---

## 🧩 Módulos Ativos

- **Avaliação de Turno:** Registro e acompanhamento periódico da prontidão física e cognitiva operacional da tripulação, com foco em prontidão operacional e carga de trabalho.
- **BioScore:** Monitoramento biométrico com preservação da precisão dos limiares de classificação fisiológica e formatação precisa de taxas de piscamento (*blink rate*) na camada de visualização.
- **Disciplina de Missão:** Sistema de engajamento operacional e adesão aos protocolos de resiliência e estabilidade fisiológica da missão (Check-in Inicial, Monitoramento Constante, Protocolo de Resiliência e Estabilidade Fisiológica).
- **AstroAssist DSS:** Sistema de Suporte à Decisão para mitigação e prescrição de contramedidas operacionais imediatas com barra de progresso e verificação:
  - *Contramedida 4-7-8:* Ciclo de respiração guiada de 3 minutos para estabilização vagal.
  - *Hidratação:* Ingestão operacional de 500ml de água.
  - *Sono 90min:* Agendamento e cumprimento de bloco de descanso/sono ultradiano de 90 minutos.
- **Métricas de Fadiga Cognitiva:** Painel analítico de carga cognitiva, registro de observações do turno e modal de base científica fundamentado em referências da NASA HRP (Human Research Program) e análise de piscamento.
- **Relatório de Telemetria de Saúde da Tripulação:** Exportação de relatórios técnicos consolidados, com dados de prontidão, registros de sono, log de treino ARED e disclaimers éticos obrigatórios.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 18, TypeScript, Vite
- **Estilização & Componentes:** Tailwind CSS, shadcn/ui, Radix UI, Lucide Icons
- **Gerenciamento de Estado & Requisições:** TanStack Query (React Query)
- **Visão Computacional & Biometria:** MediaPipe Tasks Vision
- **Backend / Persistência:** Supabase, Drizzle ORM
- **Testes:** Vitest, Testing Library

---

## 🚀 Como Executar Localmente

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

## 🛡️ Diretrizes Éticas e de Governança

- **Suporte Operacional, Não Diagnóstico:** O CrewVitals foi concebido como uma ferramenta de apoio à decisão para a tripulação e equipes de solo. Todos os alertas preditivos e métricas são instrumentos de suporte preventivo e demonstrações rotuladas, não constituindo diagnóstico ou parecer clínico.
