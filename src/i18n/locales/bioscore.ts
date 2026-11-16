export const en: Record<string, string> = {
  // Header
  'bioscore.title': 'BioScore — Stress Detection',
  'bioscore.description': 'Webcam blink rate + HRV analysis to estimate stress (neuroscience-based)',

  // Actions & Tooltips
  'bioscore.btn.newScan': 'Perform new scan',
  'bioscore.btn.startScan': 'Start Scan (60s)',
  'bioscore.tooltip.position': 'Position your face in the webcam and remain natural for 60 seconds.',

  // Progress
  'bioscore.scan.progress': 'Scan progress',

  // Toasts
  'bioscore.toast.offlineTitle': 'Record saved locally — will be sent when uplink is restored',
  'bioscore.toast.onlineTitle': 'Scan complete!',
  'bioscore.toast.desc': 'Stress level: {level}{hrv}',
  'bioscore.toast.hrvSuffix': ' • HRV: {hrv}ms',

  // Badges & Statuses
  'bioscore.badge.stable': 'Stable',
  'bioscore.badge.caution': 'Caution',
  'bioscore.badge.alert': 'Alert',
  'bioscore.badge.critical': 'Critical',
  'bioscore.badge.ok': 'OK',

  // Stress Level Names
  'bioscore.stress.low': 'Low',
  'bioscore.stress.moderate': 'Moderate',
  'bioscore.stress.high': 'High',
  'bioscore.stress.unknown': 'High',

  // Result Card
  'bioscore.result.levelHeading': '{level} Level',
  'bioscore.result.confidence': 'Vision Model Confidence: 94% (demonstration value)',
  'bioscore.metric.blinkRate': 'Blink rate',
  'bioscore.metric.blinkRateValue': '{rate} blinks/min',
  'bioscore.metric.hrv': 'HRV',
  'bioscore.metric.hrvUnit': 'ms',
  'bioscore.metric.diagnostic': 'Diagnostic',

  // Diagnostic values
  'bioscore.diagnostic.optimal': 'Optimal',
  'bioscore.diagnostic.normal': 'Normal',
  'bioscore.diagnostic.alert': 'Alert',

  // Feedback Messages
  'bioscore.msg.low': 'Optimized focus, high productivity',
  'bioscore.msg.moderate': 'Normal focus, take breaks to prevent burnout',
  'bioscore.msg.high': 'Fatigue detected. Risk of operational error',
  'bioscore.msg.crossValidation': 'Stress alert: Low HRV + high blink rate (cross-validation)',

  // NLP Tips
  'bioscore.pnl.label': 'NLP Tip:',
  'bioscore.pnl.low': 'Anchor a successful memory to maintain operational readiness.',
  'bioscore.pnl.moderate': 'Practice 4-7-8 breathing for rapid rebalancing.',
  'bioscore.pnl.high': 'Pause now: 2 min of deep breathing + mental reframe (NLP).',

  // Webcam Capture
  'bioscore.webcam.errorInit': 'Error initializing face detection',
  'bioscore.webcam.errorCamera': 'Error accessing camera. Please allow access.',
  'bioscore.webcam.cameraOffTitle': 'Camera Off',
  'bioscore.webcam.cameraOffDesc': 'Click "Start Scan" to activate',
  'bioscore.webcam.cameraOn': 'Camera On',
  'bioscore.webcam.background': 'Running in background',
  'bioscore.webcam.adjustPosition': 'Adjust your position',
  'bioscore.webcam.facePrompt': 'Position your face in front of the camera',
  'bioscore.webcam.lowLight': 'Low light? Move closer to the light!',
  'bioscore.webcam.blinks': 'Blinks',
  'bioscore.webcam.currentRate': 'Current rate',
  'bioscore.webcam.rateValue': '{rate} blinks/min',
  'bioscore.webcam.faceDetected': 'Face detected • ',
  'bioscore.webcam.positionFace': 'Position your face • ',
  'bioscore.webcam.canMinimize': 'You may minimize window',
  'bioscore.webcam.workNormally': 'Work normally',

  // Wellness Score Card
  'bioscore.wellness.title': 'Wellness Score',
  'bioscore.wellness.of100': 'of 100',
  'bioscore.wellness.empty': 'Complete your first NeuroScore to generate your wellness indicator',
  'bioscore.wellness.trend.up': 'Improving',
  'bioscore.wellness.trend.down': 'Worsening',
  'bioscore.wellness.trend.stable': 'Stable',
  'bioscore.wellness.breakdown.stress': 'Stress Level',
  'bioscore.wellness.breakdown.consistency': 'Consistency',
  'bioscore.wellness.breakdown.hrv': 'Heart Rate Variability',
  'bioscore.wellness.label.noData': 'No data',
  'bioscore.wellness.label.excellent': 'Excellent',
  'bioscore.wellness.label.good': 'Good',
  'bioscore.wellness.label.moderate': 'Moderate',
  'bioscore.wellness.label.caution': 'Caution',
  'bioscore.wellness.label.critical': 'Critical',

  // Post Scan Action Plan
  'bioscore.plan.title': 'Autonomous Operational Plan',
  'bioscore.plan.close': 'Close',
  'bioscore.plan.timeImmediate': 'Immediate',
  'bioscore.plan.timeNextHour': 'Next Hour',
  'bioscore.plan.duration3Min': '3 min',
  'bioscore.plan.duration2Min': '2 min',
  'bioscore.plan.scienceLocal': 'Generated locally (fixed rules, no cloud AI)',
  'bioscore.plan.actionHigh': 'Perform 4-7-8 breathing cycle for 3 minutes and hydrate with 500ml of water.',
  'bioscore.plan.actionNominal': 'Maintain nominal hydration and focused posture in the cockpit.',
  'bioscore.plan.actionVisual': '20-second visual break and operational priority alignment.',
  'bioscore.plan.avoidSensory': 'Simultaneous sensory overload',
  'bioscore.plan.avoidCaffeine': 'Excess caffeine',
  'bioscore.plan.mantra': 'Generated locally (fixed rules, no cloud AI): Physiological stability precedes operational precision.',
  'bioscore.plan.durationBase': 'Duration: {duration} • Base: {science}',
  'bioscore.plan.avoid': 'Avoid: ',
};

export const pt: Record<string, string> = {
  // Header
  'bioscore.title': 'BioScore — Detecção de Estresse',
  'bioscore.description': 'Análise de taxa de piscadas + HRV via webcam para estimar estresse (baseado em neurociência)',

  // Actions & Tooltips
  'bioscore.btn.newScan': 'Realizar novo scan',
  'bioscore.btn.startScan': 'Iniciar Scan (60s)',
  'bioscore.tooltip.position': 'Posicione seu rosto na webcam e fique natural por 60 segundos.',

  // Progress
  'bioscore.scan.progress': 'Progresso do scan',

  // Toasts
  'bioscore.toast.offlineTitle': 'Registro salvo localmente — será enviado ao restabelecer o uplink',
  'bioscore.toast.onlineTitle': 'Scan completo!',
  'bioscore.toast.desc': 'Nível de estresse: {level}{hrv}',
  'bioscore.toast.hrvSuffix': ' • HRV: {hrv}ms',

  // Badges & Statuses
  'bioscore.badge.stable': 'Estável',
  'bioscore.badge.caution': 'Atenção',
  'bioscore.badge.alert': 'Alerta',
  'bioscore.badge.critical': 'Crítico',
  'bioscore.badge.ok': 'OK',

  // Stress Level Names
  'bioscore.stress.low': 'Baixo',
  'bioscore.stress.moderate': 'Moderado',
  'bioscore.stress.high': 'Alto',
  'bioscore.stress.unknown': 'Alto',

  // Result Card
  'bioscore.result.levelHeading': 'Nível {level}',
  'bioscore.result.confidence': 'Confiança do Modelo de Visão: 94% (valor de demonstração)',
  'bioscore.metric.blinkRate': 'Taxa de piscadas',
  'bioscore.metric.blinkRateValue': '{rate} piscadas/min',
  'bioscore.metric.hrv': 'HRV',
  'bioscore.metric.hrvUnit': 'ms',
  'bioscore.metric.diagnostic': 'Diagnóstico',

  // Diagnostic values
  'bioscore.diagnostic.optimal': 'Ótimo',
  'bioscore.diagnostic.normal': 'Normal',
  'bioscore.diagnostic.alert': 'Alerta',

  // Feedback Messages
  'bioscore.msg.low': 'Foco otimizado, produtividade alta',
  'bioscore.msg.moderate': 'Atenção normal, sugira pausas para evitar burnout',
  'bioscore.msg.high': 'Fadiga detectada. Risco de erro operacional',
  'bioscore.msg.crossValidation': 'Alerta estresse: HRV baixo + piscadas altas (validação cruzada)',

  // NLP Tips
  'bioscore.pnl.label': 'Dica PNL:',
  'bioscore.pnl.low': 'Ancore uma memória de sucesso para manter prontidão operacional.',
  'bioscore.pnl.moderate': 'Pratique respiração 4-7-8 para reequilíbrio rápido.',
  'bioscore.pnl.high': 'Pause agora: 2min de respiração profunda + reframe mental (PNL).',

  // Webcam Capture
  'bioscore.webcam.errorInit': 'Erro ao inicializar detecção facial',
  'bioscore.webcam.errorCamera': 'Erro ao acessar câmera. Permita o acesso.',
  'bioscore.webcam.cameraOffTitle': 'Câmera Desligada',
  'bioscore.webcam.cameraOffDesc': 'Clique em "Iniciar Scan" para ativar',
  'bioscore.webcam.cameraOn': 'Câmera Ligada',
  'bioscore.webcam.background': 'Rodando em background',
  'bioscore.webcam.adjustPosition': 'Ajuste sua posição',
  'bioscore.webcam.facePrompt': 'Posicione seu rosto na câmera',
  'bioscore.webcam.lowLight': 'Iluminação baixa? Aproxime-se da luz!',
  'bioscore.webcam.blinks': 'Piscadas',
  'bioscore.webcam.currentRate': 'Taxa atual',
  'bioscore.webcam.rateValue': '{rate} piscadas/min',
  'bioscore.webcam.faceDetected': 'Face detectada • ',
  'bioscore.webcam.positionFace': 'Posicione seu rosto • ',
  'bioscore.webcam.canMinimize': 'Pode minimizar janela',
  'bioscore.webcam.workNormally': 'Trabalhe normalmente',

  // Wellness Score Card
  'bioscore.wellness.title': 'Score de Bem-Estar',
  'bioscore.wellness.of100': 'de 100',
  'bioscore.wellness.empty': 'Complete seu primeiro NeuroScore para gerar seu indicador de bem-estar',
  'bioscore.wellness.trend.up': 'Melhorando',
  'bioscore.wellness.trend.down': 'Piorando',
  'bioscore.wellness.trend.stable': 'Estável',
  'bioscore.wellness.breakdown.stress': 'Nível de Estresse',
  'bioscore.wellness.breakdown.consistency': 'Consistência',
  'bioscore.wellness.breakdown.hrv': 'Variabilidade Cardíaca',
  'bioscore.wellness.label.noData': 'Sem dados',
  'bioscore.wellness.label.excellent': 'Excelente',
  'bioscore.wellness.label.good': 'Bom',
  'bioscore.wellness.label.moderate': 'Moderado',
  'bioscore.wellness.label.caution': 'Atenção',
  'bioscore.wellness.label.critical': 'Crítico',

  // Post Scan Action Plan
  'bioscore.plan.title': 'Plano Operacional Autônomo',
  'bioscore.plan.close': 'Fechar',
  'bioscore.plan.timeImmediate': 'Imediato',
  'bioscore.plan.timeNextHour': 'Próxima Hora',
  'bioscore.plan.duration3Min': '3 min',
  'bioscore.plan.duration2Min': '2 min',
  'bioscore.plan.scienceLocal': 'Gerado localmente (regras fixas, sem IA em nuvem)',
  'bioscore.plan.actionHigh': 'Executar ciclo de respiração 4-7-8 por 3 minutos e hidratação com 500ml de água.',
  'bioscore.plan.actionNominal': 'Manter hidratação nominal e postura de foco no cockpit.',
  'bioscore.plan.actionVisual': 'Pausa visual de 20 segundos e alinhamento de prioridades operacionais.',
  'bioscore.plan.avoidSensory': 'Sobrecarga sensorial simultânea',
  'bioscore.plan.avoidCaffeine': 'Cafeína em excesso',
  'bioscore.plan.mantra': 'Gerado localmente (regras fixas, sem IA em nuvem): Estabilidade fisiológica precede a precisão operacional.',
  'bioscore.plan.durationBase': 'Duração: {duration} • Base: {science}',
  'bioscore.plan.avoid': 'Evite: ',
};
