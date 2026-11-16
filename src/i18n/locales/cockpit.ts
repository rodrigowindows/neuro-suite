export const en: Record<string, string> = {
  // Semáforo de prontidão (Cockpit level 1)
  'cockpit.readiness.go': 'GO - FIT FOR SHIFT',
  'cockpit.readiness.caution': 'CAUTION - WATCH',
  'cockpit.readiness.nogo': 'NO-GO - FATIGUE (NOT FIT)',
  'cockpit.readiness.nogoProtocol': 'NO-GO - PROTOCOL REGISTERED',
  'cockpit.readiness.unknown': 'AWAITING SCAN',
  'cockpit.headline.unknown': 'Start BioScore to assess readiness',
  'cockpit.verdictSubtitle': 'verdict based on stress and HRV',

  // 3 Números (Cockpit level 2)
  'cockpit.metric.bioScore': 'BioScore',
  'cockpit.metric.blinkRate': 'Blinks/min',
  'cockpit.metric.sleep': 'Sleep',
  'cockpit.format.sleep': '{hours} h',

  // Ações primárias e secundárias (Cockpit level 3 e rodapé)
  'cockpit.action.startScan': 'Start Readiness Scan',
  'cockpit.action.startShift': 'Start Shift',
  'cockpit.action.reevaluate': 'Reassess with BioScore',
  'cockpit.action.startProtocol': 'Start 4-7-8 Protocol',
  'cockpit.action.runBioScore': 'Perform BioScore',
  'cockpit.action.simulateScan': 'Simulate new scan',
  'cockpit.action.updateScan': 'Update scan',

  // Log de eventos recentes
  'cockpit.log.title': 'RECENT EVENT LOG',
  'cockpit.log.badge': 'DEMO',
  'cockpit.log.today': 'Today',
  'cockpit.log.yesterday': 'Yesterday',
  'cockpit.log.demo1.time': '[Today, 10:30]',
  'cockpit.log.demo1.msg': 'Predictive alert: Elevated fatigue (BioScore 34)',
  'cockpit.log.demo2.time': '[Today, 10:35]',
  'cockpit.log.demo2.msg': 'Action: Countermeasure executed (4-7-8 breathing)',
  'cockpit.log.demo3.time': '[Today, 10:40]',
  'cockpit.log.demo3.msg': 'Status updated: Stable',

  // MissionStatusWidget
  'cockpit.missionStatus.go': 'Mission Status: Nominal',
  'cockpit.missionStatus.caution': 'Mission Status: Caution',
  'cockpit.missionStatus.nogo': 'Caution: Fatigue Detected',
  'cockpit.missionStatus.unknown': 'Mission Status: Awaiting scan',

  // ConnectionStatusWidget
  'cockpit.connection.autonomousBadge': 'Autonomous Mode (Edge Computing) Active',
  'cockpit.connection.onlineBadge': 'Earth Uplink: Active',
  'cockpit.connection.queue_one': '{count} record in queue',
  'cockpit.connection.queue_other': '{count} records in queue',
  'cockpit.connection.autonomousSubtext':
    '100% Local On-Board Processing · Zero-Trust Fallback (Earth Latency: 20 min).',
  'cockpit.connection.onlineSubtext': 'Cloud synchronization operational.',
  'cockpit.connection.reconnectBtn': 'Reconnect',
  'cockpit.connection.simulateDropBtn': 'Simulate Outage',
  'cockpit.connection.ariaReconnect': 'Reconnect Earth uplink',
  'cockpit.connection.ariaSimulate': 'Simulate communication disruption (Autonomous Mode)',
  'cockpit.connection.tooltipReconnect': 'Click to reconnect Earth Uplink',
  'cockpit.connection.tooltipSimulate':
    'Click to simulate communication loss (Autonomous Mode / Edge)',
  'cockpit.connection.toastLost': 'Earth connection lost. Local processing engaged.',
  'cockpit.connection.toastRestored': 'Uplink restored. Synchronization resumed.',
  'cockpit.connection.toastFlushed_one': 'Uplink restored. {count} record synchronized.',
  'cockpit.connection.toastFlushed_other': 'Uplink restored. {count} records synchronized.',

  // StressAlertBanner
  'cockpit.stressBanner.severeTitle': 'Critical Stress Alert',
  'cockpit.stressBanner.prolongedTitle': 'Caution: Prolonged Stress',
  'cockpit.stressBanner.lead': 'You have had high stress for ',
  'cockpit.stressBanner.consecutiveDays_one': '{count} consecutive day',
  'cockpit.stressBanner.consecutiveDays_other': '{count} consecutive days',
  'cockpit.stressBanner.scansPercent': ' ({percent}% of scans at high level)',
  'cockpit.stressBanner.hrvWarning': 'Average HRV: {hrv}ms — below optimal',
  'cockpit.stressBanner.chipBreak': 'Take a 5 min break',
  'cockpit.stressBanner.chipMeditation': 'Try Mini Meditation',
  'cockpit.stressBanner.chipCoach': 'Talk to AstroAssist',
  'cockpit.stressBanner.dismiss': 'Close',

  // Downlink labels
  'cockpit.downlink.autonomousLabel':
    'Package saved locally (simulated uplink — no real transmission)',
  'cockpit.downlink.onlineLabel': 'Package generated',
  'cockpit.downlink.disclaimer':
    'Webcam estimates, decision support, not a clinical diagnosis',
};

export const pt: Record<string, string> = {
  // Semáforo de prontidão (Cockpit level 1)
  'cockpit.readiness.go': 'GO - APTO PARA O TURNO',
  'cockpit.readiness.caution': 'ATENÇÃO - VIGILÂNCIA',
  'cockpit.readiness.nogo': 'NO-GO - FADIGA (NÃO APTO)',
  'cockpit.readiness.nogoProtocol': 'NO-GO - PROTOCOLO REGISTRADO',
  'cockpit.readiness.unknown': 'AGUARDANDO SCAN',
  'cockpit.headline.unknown': 'Inicie o BioScore para avaliar a prontidão',
  'cockpit.verdictSubtitle': 'veredito baseado em estresse e HRV',

  // 3 Números (Cockpit level 2)
  'cockpit.metric.bioScore': 'BioScore',
  'cockpit.metric.blinkRate': 'Piscadas/min',
  'cockpit.metric.sleep': 'Sono',
  'cockpit.format.sleep': '{hours}h',

  // Ações primárias e secundárias (Cockpit level 3 e rodapé)
  'cockpit.action.startScan': 'Iniciar Scan de Prontidão',
  'cockpit.action.startShift': 'Iniciar Turno',
  'cockpit.action.reevaluate': 'Reavaliar com BioScore',
  'cockpit.action.startProtocol': 'Iniciar Protocolo 4-7-8',
  'cockpit.action.runBioScore': 'Realizar BioScore',
  'cockpit.action.simulateScan': 'Simular novo scan',
  'cockpit.action.updateScan': 'Atualizar scan',

  // Log de eventos recentes
  'cockpit.log.title': 'LOG DE EVENTOS RECENTES',
  'cockpit.log.badge': 'DEMO',
  'cockpit.log.today': 'Hoje',
  'cockpit.log.yesterday': 'Ontem',
  'cockpit.log.demo1.time': '[Hoje, 10:30]',
  'cockpit.log.demo1.msg': 'Alerta Preditivo: Fadiga Elevada (BioScore 34)',
  'cockpit.log.demo2.time': '[Hoje, 10:35]',
  'cockpit.log.demo2.msg': 'Ação: Contramedida executada (Respiração 4-7-8)',
  'cockpit.log.demo3.time': '[Hoje, 10:40]',
  'cockpit.log.demo3.msg': 'Status atualizado: Estável',

  // MissionStatusWidget
  'cockpit.missionStatus.go': 'Status da Missão: Nominal',
  'cockpit.missionStatus.caution': 'Status da Missão: Atenção',
  'cockpit.missionStatus.nogo': 'Atenção: Fadiga Detectada',
  'cockpit.missionStatus.unknown': 'Status da Missão: Aguardando scan',

  // ConnectionStatusWidget
  'cockpit.connection.autonomousBadge': 'Modo Autônomo (Edge Computing) Ativado',
  'cockpit.connection.onlineBadge': 'Uplink da Terra: Ativo',
  'cockpit.connection.queue_one': '{count} registro em fila',
  'cockpit.connection.queue_other': '{count} registros em fila',
  'cockpit.connection.autonomousSubtext':
    'Processamento 100% Local na Nave · Zero-Trust Fallback (Latência Terra: 20 min).',
  'cockpit.connection.onlineSubtext': 'Sincronização em nuvem operacional.',
  'cockpit.connection.reconnectBtn': 'Reconectar',
  'cockpit.connection.simulateDropBtn': 'Simular Queda',
  'cockpit.connection.ariaReconnect': 'Reconectar uplink com a Terra',
  'cockpit.connection.ariaSimulate':
    'Simular interrupção de comunicação (Modo Autônomo)',
  'cockpit.connection.tooltipReconnect': 'Clique para reconectar Uplink com a Terra',
  'cockpit.connection.tooltipSimulate':
    'Clique para simular queda de comunicação (Modo Autônomo / Edge)',
  'cockpit.connection.toastLost':
    'Conexão com a Terra perdida. Processamento local assumido.',
  'cockpit.connection.toastRestored':
    'Uplink restabelecido. Sincronização retomada.',
  'cockpit.connection.toastFlushed_one':
    'Uplink restabelecido. {count} registro sincronizado.',
  'cockpit.connection.toastFlushed_other':
    'Uplink restabelecido. {count} registros sincronizados.',

  // StressAlertBanner
  'cockpit.stressBanner.severeTitle': 'Alerta Crítico de Estresse',
  'cockpit.stressBanner.prolongedTitle': 'Atenção: Estresse Prolongado',
  'cockpit.stressBanner.lead': 'Você está com estresse alto há ',
  'cockpit.stressBanner.consecutiveDays_one': '{count} dia consecutivo',
  'cockpit.stressBanner.consecutiveDays_other': '{count} dias consecutivos',
  'cockpit.stressBanner.scansPercent': ' ({percent}% dos scans em nível alto)',
  'cockpit.stressBanner.hrvWarning': 'HRV médio: {hrv}ms — abaixo do ideal',
  'cockpit.stressBanner.chipBreak': 'Faça uma pausa de 5 min',
  'cockpit.stressBanner.chipMeditation': 'Tente a Mini Meditação',
  'cockpit.stressBanner.chipCoach': 'Converse com o AstroAssist',
  'cockpit.stressBanner.dismiss': 'Fechar',

  // Downlink labels
  'cockpit.downlink.autonomousLabel':
    'Pacote salvo localmente (simulação de uplink — nenhum envio real)',
  'cockpit.downlink.onlineLabel': 'Pacote gerado',
  'cockpit.downlink.disclaimer':
    'Estimativas por webcam, apoio à decisão, não diagnóstico clínico',
};
