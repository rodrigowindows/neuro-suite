export const en: Record<string, string> = {
  // Biometric Log Card
  'missionlog.biometric.title': 'Biometric Log',
  'missionlog.biometric.desc': 'Record your daily sleep and exercise — essential to mitigate the effects of microgravity.',
  'missionlog.biometric.sleepLabel': 'Sleep Hours',
  'missionlog.biometric.sleepPlaceholder': 'e.g. 7.5',
  'missionlog.biometric.exerciseLabel': 'Exercise Completed Today',
  'missionlog.biometric.exercisePlaceholder': 'e.g. 45 min treadmill with harness + 30 min resistance (ARED)',
  'missionlog.biometric.fatigueLabel': 'Perceived Fatigue Level (1-5)',
  'missionlog.biometric.fatiguePlaceholder': 'Select fatigue level',
  'missionlog.biometric.divergence': 'Divergence between perception and telemetry — consider reassessing',
  'missionlog.biometric.symptomsLabel': 'Symptoms today',
  'missionlog.biometric.symptomsDesc': 'Select any symptoms observed during the duty period.',
  'missionlog.biometric.saveBtn': 'Save Entry',

  // Fatigue options
  'missionlog.fatigue.1': '1 - No fatigue',
  'missionlog.fatigue.2': '2 - Mild fatigue',
  'missionlog.fatigue.3': '3 - Moderate fatigue',
  'missionlog.fatigue.4': '4 - High fatigue',
  'missionlog.fatigue.5': '5 - Exhaustion',

  // Symptoms chips
  'missionlog.symptom.fever': 'fever or chills',
  'missionlog.symptom.headache': 'headache',
  'missionlog.symptom.nausea': 'nausea',
  'missionlog.symptom.dizziness': 'dizziness',
  'missionlog.symptom.musculoskeletal': 'musculoskeletal pain',
  'missionlog.symptom.lowMood': 'low mood',
  'missionlog.symptom.sleep': 'fragmented sleep',
  'missionlog.symptom.eyeDiscomfort': 'eye discomfort',

  // Decision Support
  'missionlog.decisionSupport.recommendation': 'Consider contacting the Flight Surgeon. Package available in Flight Log.',
  'missionlog.decisionSupport.disclaimer': 'Decision support, not a clinical diagnosis',

  // Personal Baseline Card
  'missionlog.baseline.title': 'Personal Baseline',
  'missionlog.baseline.desc': 'Biometric comparison between current values and the median of your recent valid scans.',
  'missionlog.baseline.loading': 'Loading...',
  'missionlog.baseline.building': 'Baseline under construction ({count}/3 scans)',
  'missionlog.baseline.hrvCurrent': 'Current HRV',
  'missionlog.baseline.hrvBase': 'Baseline: {value} ms',
  'missionlog.baseline.blinkCurrent': 'Current Blinks/min',
  'missionlog.baseline.blinkBase': 'Baseline: {value}/min',
  'missionlog.baseline.delta': '{delta} vs. your baseline',

  // Last Saved Entry Card
  'missionlog.lastEntry.title': 'Last Saved Entry',
  'missionlog.lastEntry.sleep': 'Sleep',
  'missionlog.lastEntry.exercise': 'Exercise',
  'missionlog.lastEntry.fatigue': 'Perceived Fatigue',
  'missionlog.lastEntry.empty': 'No entries yet. Save your first entry above.',
  'missionlog.lastEntry.sleepHoursFormat': '{hours}h',

  // Downlink Package Card
  'missionlog.downlink.title': 'Downlink Package',
  'missionlog.downlink.desc': 'Summary of the last 72 hours of telemetry for transmission to Mission Control.',
  'missionlog.downlink.btnDefault': 'Generate Downlink Package',
  'missionlog.downlink.btnGenerated': 'Package generated',
  'missionlog.downlink.btnAutonomous': 'Package saved locally (uplink simulation — no actual transmission)',

  // Timeline Card
  'missionlog.timeline.title': 'Mission Event Timeline',
  'missionlog.timeline.desc': 'Chronological record of operational events, scans, and crew countermeasures.',
  'missionlog.timeline.verdictLabel': 'Cockpit Verdict',
  'missionlog.timeline.filterAll': 'All',
  'missionlog.timeline.filterScan': 'Scans',
  'missionlog.timeline.filterProtocol': 'Countermeasures',
  'missionlog.timeline.filterFatigue': 'Fatigue & Sleep',
  'missionlog.timeline.filterSymptoms': 'Symptoms',
  'missionlog.timeline.empty': 'No events recorded yet.',
  'missionlog.timeline.noFilterMatches': 'No events for the selected filter.',

  // Cockpit verdicts
  'missionlog.verdict.go': 'GO - FIT FOR SHIFT',
  'missionlog.verdict.caution': 'CAUTION - WATCH',
  'missionlog.verdict.nogo': 'NO-GO - FATIGUE (NOT FIT)',
  'missionlog.verdict.awaiting': 'AWAITING SCAN',
  'missionlog.verdict.noData': 'NO DATA',

  // Event dynamic translation strings in English
  'missionlog.event.scanCompleted': 'Scan completed: BioScore {score}, HRV {hrv} ms',
  'missionlog.event.scanBioScore': 'BioScore scan completed ({score})',
  'missionlog.event.predictiveAlert': 'Predictive alert: Elevated fatigue (BioScore {score})',
  'missionlog.event.statusUpdated': 'Status updated: {verdict}',
  'missionlog.event.statusStable': 'Status updated: Stable',
  'missionlog.event.countermeasureLocal': 'Local countermeasure executed: 3 cycles of 4-7-8 breathing completed.',
  'missionlog.event.countermeasureAction': 'Action: Countermeasure executed (4-7-8 breathing)',
  'missionlog.event.countermeasureProtocol': 'Countermeasure protocol executed: {name}',
  'missionlog.event.shiftStarted': 'Operational shift started.',
  'missionlog.event.assessmentVerdict': 'Readiness assessment: {verdict}',
  'missionlog.event.fatigueLogged': 'Perceived fatigue: {level}',
  'missionlog.event.sleepLogged': 'Sleep logged: {hours}h',
  'missionlog.event.noSymptoms': 'No symptoms reported',
  'missionlog.event.symptomsReported': 'Symptoms reported: {list}',
  'missionlog.event.symptomsTitle': 'Symptom Log',

  // Toasts and validation
  'missionlog.toast.validationTitle': 'Check the fields',
  'missionlog.toast.invalidData': 'Invalid data',
  'missionlog.toast.saveSuccessTitle': 'Entry saved',
  'missionlog.toast.saveSuccessDesc': 'Your Biometric Log has been updated.',
  'missionlog.toast.saveLocalTitle': 'Entry saved locally — will be sent when uplink is restored',
  'missionlog.toast.saveErrorTitle': 'Error saving',
  'missionlog.toast.saveErrorDesc': 'Could not save entry. Please try again.',
  'missionlog.toast.downlinkSuccessDesc': 'JSON file and consolidated report download completed.',
  'missionlog.toast.downlinkErrorTitle': 'Error generating package',
  'missionlog.toast.downlinkErrorDesc': 'Could not compile telemetry package.',
  'missionlog.zod.validNumber': 'Please enter a valid number',
  'missionlog.zod.negativeSleep': 'Sleep hours cannot be negative',
  'missionlog.zod.maxSleep': 'Maximum of 24 hours',
  'missionlog.zod.maxExercise': 'Maximum of 500 characters',
};

export const pt: Record<string, string> = {
  // Biometric Log Card
  'missionlog.biometric.title': 'Biometric Log',
  'missionlog.biometric.desc': 'Registre seu sono e exercícios diários — essenciais para mitigar os efeitos da microgravidade.',
  'missionlog.biometric.sleepLabel': 'Horas de Sono',
  'missionlog.biometric.sleepPlaceholder': 'Ex: 7.5',
  'missionlog.biometric.exerciseLabel': 'Exercício Realizado Hoje',
  'missionlog.biometric.exercisePlaceholder': 'Ex: 45 min de esteira com arnês + 30 min de resistência (ARED)',
  'missionlog.biometric.fatigueLabel': 'Nível de Fadiga Percebida (1-5)',
  'missionlog.biometric.fatiguePlaceholder': 'Selecione o nível de fadiga',
  'missionlog.biometric.divergence': 'Divergência entre percepção e telemetria — considere reavaliar',
  'missionlog.biometric.symptomsLabel': 'Sintomas hoje',
  'missionlog.biometric.symptomsDesc': 'Selecione quaisquer sintomas observados durante o período de serviço.',
  'missionlog.biometric.saveBtn': 'Salvar Registro',

  // Fatigue options
  'missionlog.fatigue.1': '1 - Sem fadiga',
  'missionlog.fatigue.2': '2 - Fadiga leve',
  'missionlog.fatigue.3': '3 - Fadiga moderada',
  'missionlog.fatigue.4': '4 - Fadiga alta',
  'missionlog.fatigue.5': '5 - Exaustão',

  // Symptoms chips
  'missionlog.symptom.fever': 'febre ou calafrios',
  'missionlog.symptom.headache': 'dor de cabeça',
  'missionlog.symptom.nausea': 'náusea',
  'missionlog.symptom.dizziness': 'tontura',
  'missionlog.symptom.musculoskeletal': 'dor musculoesquelética',
  'missionlog.symptom.lowMood': 'humor rebaixado',
  'missionlog.symptom.sleep': 'sono fragmentado',
  'missionlog.symptom.eyeDiscomfort': 'desconforto ocular',

  // Decision Support
  'missionlog.decisionSupport.recommendation': 'Considere contato com o Cirurgião de Voo. Pacote disponível em Histórico de Voo.',
  'missionlog.decisionSupport.disclaimer': 'Apoio à decisão, não diagnóstico',

  // Personal Baseline Card
  'missionlog.baseline.title': 'Linha de Base Pessoal',
  'missionlog.baseline.desc': 'Comparativo biométrico entre os valores atuais e a mediana dos seus últimos scans válidos.',
  'missionlog.baseline.loading': 'Carregando...',
  'missionlog.baseline.building': 'Linha de base em construção ({count}/3 scans)',
  'missionlog.baseline.hrvCurrent': 'HRV Atual',
  'missionlog.baseline.hrvBase': 'Base: {value} ms',
  'missionlog.baseline.blinkCurrent': 'Piscadas/min Atual',
  'missionlog.baseline.blinkBase': 'Base: {value}/min',
  'missionlog.baseline.delta': '{delta} vs. sua linha de base',

  // Last Saved Entry Card
  'missionlog.lastEntry.title': 'Último Registro Salvo',
  'missionlog.lastEntry.sleep': 'Sono',
  'missionlog.lastEntry.exercise': 'Exercício',
  'missionlog.lastEntry.fatigue': 'Fadiga Percebida',
  'missionlog.lastEntry.empty': 'Nenhum registro ainda. Salve seu primeiro registro acima.',
  'missionlog.lastEntry.sleepHoursFormat': '{hours}h',

  // Downlink Package Card
  'missionlog.downlink.title': 'Pacote de Downlink',
  'missionlog.downlink.desc': 'Resumo das últimas 72 horas de telemetria para transmissão ao Controle de Missão.',
  'missionlog.downlink.btnDefault': 'Gerar Pacote de Downlink',
  'missionlog.downlink.btnGenerated': 'Pacote gerado',
  'missionlog.downlink.btnAutonomous': 'Pacote salvo localmente (simulação de uplink — nenhum envio real)',

  // Timeline Card
  'missionlog.timeline.title': 'Linha do Tempo da Missão',
  'missionlog.timeline.desc': 'Registro cronológico de eventos operacionais, scans e contramedidas da tripulação.',
  'missionlog.timeline.verdictLabel': 'Veredito do Cockpit',
  'missionlog.timeline.filterAll': 'Todos',
  'missionlog.timeline.filterScan': 'Scans',
  'missionlog.timeline.filterProtocol': 'Contramedidas',
  'missionlog.timeline.filterFatigue': 'Fadiga e Sono',
  'missionlog.timeline.filterSymptoms': 'Sintomas',
  'missionlog.timeline.empty': 'Nenhum evento registrado ainda.',
  'missionlog.timeline.noFilterMatches': 'Nenhum evento para o filtro selecionado.',

  // Cockpit verdicts
  'missionlog.verdict.go': 'GO - APTO PARA O TURNO',
  'missionlog.verdict.caution': 'ATENÇÃO - VIGILÂNCIA',
  'missionlog.verdict.nogo': 'NO-GO - FADIGA (NÃO APTO)',
  'missionlog.verdict.awaiting': 'AGUARDANDO SCAN',
  'missionlog.verdict.noData': 'SEM DADOS',

  // Event dynamic translation strings in Portuguese
  'missionlog.event.scanCompleted': 'Scan realizado: BioScore {score}, HRV {hrv} ms',
  'missionlog.event.scanBioScore': 'Scan de BioScore realizado ({score})',
  'missionlog.event.predictiveAlert': 'Alerta Preditivo: Fadiga Elevada (BioScore {score})',
  'missionlog.event.statusUpdated': 'Status atualizado: {verdict}',
  'missionlog.event.statusStable': 'Status atualizado: Estável',
  'missionlog.event.countermeasureLocal': 'Contramedida local executada: 3 ciclos de respiração 4-7-8 concluídos.',
  'missionlog.event.countermeasureAction': 'Ação: Contramedida executada (Respiração 4-7-8)',
  'missionlog.event.countermeasureProtocol': 'Protocolo de contramedida executado: {name}',
  'missionlog.event.shiftStarted': 'Turno operacional iniciado com sucesso.',
  'missionlog.event.assessmentVerdict': 'Avaliação de prontidão: {verdict}',
  'missionlog.event.fatigueLogged': 'Fadiga percebida: {level}',
  'missionlog.event.sleepLogged': 'Sono registrado: {hours}h',
  'missionlog.event.noSymptoms': 'Sem sintomas reportados',
  'missionlog.event.symptomsReported': 'Sintomas reportados: {list}',
  'missionlog.event.symptomsTitle': 'Registro de Sintomas',

  // Toasts and validation
  'missionlog.toast.validationTitle': 'Verifique os campos',
  'missionlog.toast.invalidData': 'Dados inválidos',
  'missionlog.toast.saveSuccessTitle': 'Registro salvo',
  'missionlog.toast.saveSuccessDesc': 'Seu Biometric Log foi atualizado.',
  'missionlog.toast.saveLocalTitle': 'Registro salvo localmente — será enviado ao restabelecer o uplink',
  'missionlog.toast.saveErrorTitle': 'Erro ao salvar',
  'missionlog.toast.saveErrorDesc': 'Não foi possível salvar o registro. Tente novamente.',
  'missionlog.toast.downlinkSuccessDesc': 'Download do arquivo JSON e relatório consolidado concluídos.',
  'missionlog.toast.downlinkErrorTitle': 'Erro ao gerar pacote',
  'missionlog.toast.downlinkErrorDesc': 'Não foi possível compilar o pacote de telemetria.',
  'missionlog.zod.validNumber': 'Informe um número válido',
  'missionlog.zod.negativeSleep': 'Horas de sono não podem ser negativas',
  'missionlog.zod.maxSleep': 'Máximo de 24 horas',
  'missionlog.zod.maxExercise': 'Máximo de 500 caracteres',
};
