export const en: Record<string, string> = {
  // Header & DSS
  'coach.title': 'AstroAssist — Countermeasure Prescription',
  'coach.dssSubtitle': 'Decision Support System (DSS) for Workload Mitigation and Operational Fatigue',
  'coach.badge.nasaHrp': 'NASA HRP Guidelines',
  'coach.badge.autonomous': 'Generated locally (fixed rules, no cloud AI)',

  // Status Alert Banner
  'coach.status.fatigueDetected': 'Status: Fatigue Detected.',
  'coach.status.fatigueDesc': 'Risk of attentional lapse and readiness degradation. Execute the countermeasures prescribed below.',
  'coach.btn.executeMitigation': 'Execute Mitigation Protocol',
  'coach.badge.highPriority': 'High Priority',

  // Progress
  'coach.progress.label': 'Countermeasures Progress: {completed} of {total} executed',

  // Section Header
  'coach.section.prescriptions': 'Mandatory Operational Prescriptions',

  // Action 1: Respiration
  'coach.action1.title': 'Action 1 (Breathing): Execute 4-7-8 cycle for 3 minutes.',
  'coach.action1.badge': '4-7-8 Breathing',
  'coach.action1.desc': 'Inhale through the nose for 4s, hold breath for 7s, and exhale through the mouth for 8s. Reduces sympathetic tone and restores HRV stability (Harvard Medical School).',
  'coach.timer.start': 'Start Guided Timer (3 min)',
  'coach.timer.pause': 'Pause Timer',
  'coach.timer.resume': 'Resume Timer',
  'coach.timer.reset': 'Reset / Restart',
  'coach.timer.openAria': 'Open 4-7-8 breathing cycle',

  // Action 2: Hydration
  'coach.action2.title': 'Action 2 (Hydration): 500ml water intake.',
  'coach.action2.badge': '500ml H₂O',
  'coach.action2.desc': 'Combats plasma volume reduction in microgravity and prevents motor slowing and headaches resulting from subclinical dehydration.',

  // Action 3: Rest
  'coach.action3.title': 'Action 3 (Rest): Schedule 90-min sleep cycle in Biometric Log.',
  'coach.action3.badge': '90-min cycle (REM/NREM)',
  'coach.action3.desc': 'Allows passage through all sleep stages, restoring vigilance index and working memory without inducing prolonged sleep inertia. Record sleep hours in the Biometric Log tab.',

  // Bottom Controls & Toasts
  'coach.btn.resetChecklist': 'Clear Checklist',
  'coach.btn.exportPlan': 'Export Plan',
  'coach.btn.registerExecution': 'Register Countermeasures Execution',
  'coach.toast.breathingComplete': '4-7-8 breathing cycle completed! Action 1 marked.',
  'coach.toast.selectAtLeastOne': 'Select at least one completed countermeasure.',
  'coach.toast.protocolRegistered': 'Protocol registered. Status updated.',
  'coach.toast.checklistReset': 'Checklist reset for this shift.',
  'coach.toast.planDownloaded': 'Operational plan downloaded successfully!',

  // Export File
  'coach.export.title': 'OPERATIONAL COUNTERMEASURE PLAN - CREWVITALS',
  'coach.export.date': 'Date: {date}',
  'coach.export.status': 'Status: Fatigue Detected',
  'coach.export.guidelines': 'Guidelines: NASA HRP / Harvard Medical School',
  'coach.export.prescriptionsHeader': 'Prescribed Countermeasures:',
  'coach.export.action1': '1. [{checked}] Breathing: 4-7-8 cycle for 3 minutes.',
  'coach.export.action2': '2. [{checked}] Hydration: 500ml water intake.',
  'coach.export.action3': '3. [{checked}] Rest: 90-min sleep cycle (REM/NREM).',
  'coach.export.progress': 'Progress: {percent}% ({completed} of {total} countermeasures executed).',
  'coach.export.filename': 'crewvitals-plan.txt',

  // Breathing Overlay
  'coach.overlay.ariaLabel': 'Immersive 4-7-8 Breathing Experience',
  'coach.overlay.cockpitBadge': 'Orbital Cockpit • Night Mode',
  'coach.overlay.title': 'Mitigation Protocol — 4-7-8 Breathing',
  'coach.overlay.guidelines': 'Harvard Medical School & NASA HRP Guidelines • Physiological Stabilization and Sympathetic Tone Attenuation',
  'coach.overlay.closeAria': 'Close',
  'coach.overlay.phaseIndicator': 'Phase {phase} of 3',
  'coach.overlay.cycleBadge': 'Cycle {cycle} of 10',
  'coach.overlay.rhythmBadge': 'Parasympathetic Rhythm',
  'coach.overlay.countdownLabel': 'Countdown Timer (3 min)',
  'coach.overlay.cancelClose': 'Cancel / Close',

  // 4-7-8 Breathing Phases
  'coach.breathing.phase1.title': 'Inhale through the nose (4s)',
  'coach.breathing.phase1.desc': 'Inhale gently through the nose filling the diaphragm and lungs',
  'coach.breathing.phase2.title': 'Hold breath in lungs (7s)',
  'coach.breathing.phase2.desc': 'Hold breath in lungs with active vagal tone and cellular oxygenation',
  'coach.breathing.phase3.title': 'Exhale slowly through the mouth (8s)',
  'coach.breathing.phase3.desc': 'Empty lungs completely with slow, controlled exhalation',

  // ToneSelector
  'coach.tone.title': 'Choose your communication tone:',
  'coach.tone.subtitle': 'Select how you prefer AstroAssist to communicate with you',
  'coach.tone.placeholder': 'Select a tone...',
  'coach.tone.technical': 'Technical/Academic - Formal, scientific with references',
  'coach.tone.casual': 'Casual Everyday - Friendly, informal and motivating',
  'coach.tone.spiritual': 'Pragmatic Spiritual Guide - Inspirational and inner guidance',

  // ChatInput & ChatMessages
  'coach.chat.placeholder': 'Describe how you feel or what you want to improve...',
  'coach.chat.cancelGeneration': 'Cancel generation',
  'coach.chat.typing': 'AstroAssist is typing',

  // Streaming chat errors
  'coach.chat.errorSession': 'Session expired. Please sign in again.',
  'coach.chat.errorRateLimit': 'Too many requests. Please wait a moment.',
  'coach.chat.errorUnavailable': 'Service temporarily unavailable.',
  'coach.chat.errorGeneric': 'Failed to connect to service',

  // coachService
  'coach.initial.low': 'Great focus! Which performance expectation do you want to elevate? NLP suggestion: Anchor a success memory to sustain high productivity.',
  'coach.initial.moderate': 'To reduce burnout and turnover, what is draining your energy? Reframe it as an opportunity (NLP) to balance well-being and performance.',
  'coach.initial.high': 'Burnout alert (Mission Safety). Which sensory pause (4-7-8 breathing) recharges you? Let us create an immediate rebalancing plan.',
  'coach.initial.default': 'Hello! Complete a scan first so I can calibrate my analysis to your current state. Meanwhile, tell me: how are you feeling?',
  'coach.service.userLabel': 'You',
  'coach.service.coachLabel': 'AstroAssist',
  'coach.service.stressContext': 'Detected stress level: {level}. ',
  'coach.service.lowHrvWarning': 'Low HRV indicates high stress - prioritize well-being. ',
};

export const pt: Record<string, string> = {
  // Header & DSS
  'coach.title': 'AstroAssist — Prescrição de Contramedidas',
  'coach.dssSubtitle': 'Sistema de Suporte à Decisão (DSS) para Mitigação de Carga e Fadiga Operacional',
  'coach.badge.nasaHrp': 'Diretrizes NASA HRP',
  'coach.badge.autonomous': 'Gerado localmente (regras fixas, sem IA em nuvem)',

  // Status Alert Banner
  'coach.status.fatigueDetected': 'Status: Fadiga Detectada.',
  'coach.status.fatigueDesc': 'Risco de lapso atencional e degradação de prontidão. Execute as contramedidas prescritas abaixo.',
  'coach.btn.executeMitigation': 'Executar Protocolo de Mitigação',
  'coach.badge.highPriority': 'Prioridade Alta',

  // Progress
  'coach.progress.label': 'Progresso das Contramedidas: {completed} de {total} executadas',

  // Section Header
  'coach.section.prescriptions': 'Prescrições Operacionais Obrigatórias',

  // Action 1: Respiration
  'coach.action1.title': 'Ação 1 (Respiração): Executar ciclo 4-7-8 por 3 minutos.',
  'coach.action1.badge': 'Respiração 4-7-8',
  'coach.action1.desc': 'Inspire pelo nariz por 4s, retenha o ar por 7s e expire pela boca por 8s. Reduz o tônus simpático e restabelece a estabilidade de HRV (Harvard Medical School).',
  'coach.timer.start': 'Iniciar Timer Guiado (3 min)',
  'coach.timer.pause': 'Pausar Timer',
  'coach.timer.resume': 'Retomar Timer',
  'coach.timer.reset': 'Zerar / Reiniciar',
  'coach.timer.openAria': 'Abrir ciclo de respiração 4-7-8',

  // Action 2: Hydration
  'coach.action2.title': 'Ação 2 (Hidratação): Ingestão de 500ml de água.',
  'coach.action2.badge': '500ml H₂O',
  'coach.action2.desc': 'Combate o decréscimo de volume plasmático em microgravidade e previne a lentidão motora e cefaleia decorrentes de desidratação subclínica.',

  // Action 3: Rest
  'coach.action3.title': 'Ação 3 (Descanso): Agendar ciclo de sono de 90 min no Biometric Log.',
  'coach.action3.badge': 'Ciclo 90 min (REM/NREM)',
  'coach.action3.desc': 'Permite a passagem por todos os estágios do sono, restaurando o índice de vigilância e a memória operacional sem induzir inércia de sono prolongada. Registre as horas de sono na aba Biometric Log.',

  // Bottom Controls & Toasts
  'coach.btn.resetChecklist': 'Limpar Checklist',
  'coach.btn.exportPlan': 'Exportar Plano',
  'coach.btn.registerExecution': 'Registrar Execução de Contramedidas',
  'coach.toast.breathingComplete': 'Ciclo de respiração 4-7-8 concluído! Ação 1 marcada.',
  'coach.toast.selectAtLeastOne': 'Marque ao menos uma contramedida executada.',
  'coach.toast.protocolRegistered': 'Protocolo registrado. Status atualizado.',
  'coach.toast.checklistReset': 'Checklist reiniciado para este turno.',
  'coach.toast.planDownloaded': 'Plano operacional baixado com sucesso!',

  // Export File
  'coach.export.title': 'PLANO OPERACIONAL DE CONTRAMEDIDAS - CREWVITALS',
  'coach.export.date': 'Data: {date}',
  'coach.export.status': 'Status: Fadiga Detectada',
  'coach.export.guidelines': 'Diretrizes: NASA HRP / Harvard Medical School',
  'coach.export.prescriptionsHeader': 'Contramedidas Prescritas:',
  'coach.export.action1': '1. [{checked}] Respiração: Ciclo 4-7-8 por 3 minutos.',
  'coach.export.action2': '2. [{checked}] Hidratação: Ingestão de 500ml de água.',
  'coach.export.action3': '3. [{checked}] Descanso: Ciclo de sono de 90 min (REM/NREM).',
  'coach.export.progress': 'Progresso: {percent}% ({completed} de {total} contramedidas executadas).',
  'coach.export.filename': 'plano-crewvitals.txt',

  // Breathing Overlay
  'coach.overlay.ariaLabel': 'Experiência Imersiva de Respiração 4-7-8',
  'coach.overlay.cockpitBadge': 'Cabine Orbital • Modo Noturno',
  'coach.overlay.title': 'Protocolo de Mitigação — Respiração 4-7-8',
  'coach.overlay.guidelines': 'Diretrizes Harvard Medical School & NASA HRP • Estabilização Fisiológica e Atenuação de Tônus Simpático',
  'coach.overlay.closeAria': 'Fechar',
  'coach.overlay.phaseIndicator': 'Fase {phase} de 3',
  'coach.overlay.cycleBadge': 'Ciclo {cycle} de 10',
  'coach.overlay.rhythmBadge': 'Ritmo Parassimpático',
  'coach.overlay.countdownLabel': 'Contador Regressivo (3 min)',
  'coach.overlay.cancelClose': 'Cancelar / Fechar',

  // 4-7-8 Breathing Phases
  'coach.breathing.phase1.title': 'Inspire pelo nariz (4s)',
  'coach.breathing.phase1.desc': 'Inspire suavemente pelo nariz preenchendo o diafragma e pulmões',
  'coach.breathing.phase2.title': 'Retenha o ar nos pulmões (7s)',
  'coach.breathing.phase2.desc': 'Mantenha o ar nos pulmões com tônus vagal ativo e oxigenação celular',
  'coach.breathing.phase3.title': 'Expire lentamente pela boca (8s)',
  'coach.breathing.phase3.desc': 'Esvazie completamente os pulmões com expiração lenta e controlada',

  // ToneSelector
  'coach.tone.title': 'Escolha teu tom de comunicação:',
  'coach.tone.subtitle': 'Selecione como prefere que o AstroAssist se comunique com você',
  'coach.tone.placeholder': 'Selecione um tom...',
  'coach.tone.technical': 'Técnico/Acadêmico - Formal, científico com referências',
  'coach.tone.casual': 'Descolado Dia-a-Dia - Papo amigo, casual e motivador',
  'coach.tone.spiritual': 'Toque Mestre Espiritual Pragmático - Inspiracional e guia interior',

  // ChatInput & ChatMessages
  'coach.chat.placeholder': 'Descreva como se sente ou o que quer melhorar...',
  'coach.chat.cancelGeneration': 'Cancelar geração',
  'coach.chat.typing': 'AstroAssist está digitando',

  // Streaming chat errors
  'coach.chat.errorSession': 'Sessão expirada. Faça novamente o login.',
  'coach.chat.errorRateLimit': 'Muitas requisições. Aguarde um momento.',
  'coach.chat.errorUnavailable': 'Serviço temporariamente indisponível.',
  'coach.chat.errorGeneric': 'Erro ao conectar ao serviço',

  // coachService
  'coach.initial.low': 'Ótimo foco! Qual expectativa de performance você quer elevar? Sugestão PNL: Ancore uma memória de sucesso para manter alta produtividade.',
  'coach.initial.moderate': 'Para reduzir turnover, o que drena sua energia? Reframe como oportunidade (PNL) para equilibrar bem-estar e performance.',
  'coach.initial.high': 'Alerta burnout (Segurança de Missão). Qual pausa sensorial (respiração 4-7-8) te recarrega? Vamos criar um plano de reequilíbrio imediato.',
  'coach.initial.default': 'Olá! Faça um scan primeiro para eu calibrar minha análise ao seu estado atual. Enquanto isso, me conta: como você está se sentindo?',
  'coach.service.userLabel': 'Você',
  'coach.service.coachLabel': 'AstroAssist',
  'coach.service.stressContext': 'Nível de estresse detectado: {level}. ',
  'coach.service.lowHrvWarning': 'HRV baixa valida estresse alto - priorize bem-estar. ',
};
