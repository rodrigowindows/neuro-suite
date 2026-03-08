export interface CoachMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function getInitialMessage(stressLevel: string): string {
  if (stressLevel === 'low') {
    return 'Ótimo foco! 😊 Qual expectativa de performance você quer elevar? Sugestão PNL: Ancore uma memória de sucesso para manter alta produtividade.';
  }
  if (stressLevel === 'moderate') {
    return 'Para reduzir turnover, o que drena sua energia? 😐 Reframe como oportunidade (PNL) para equilibrar bem-estar e performance.';
  }
  if (stressLevel === 'high') {
    return 'Alerta burnout (NR-1). 😟 Qual pausa sensorial (respiração 4-7-8) te recarrega? Vamos criar um plano de reequilíbrio imediato.';
  }
  return 'Olá! 👋 Faça um scan primeiro para eu calibrar minha análise ao seu estado atual. Enquanto isso, me conta: como você está se sentindo?';
}

export function buildContext(stressLevel: string, hrvValue: string): string {
  let context = `Nível de estresse detectado: ${stressLevel}. `;
  const hrvNum = parseFloat(hrvValue);
  if (!isNaN(hrvNum)) {
    context += `HRV (RMSSD): ${hrvNum}ms. `;
    if (hrvNum < 30) {
      context += 'HRV baixa valida estresse alto - priorize bem-estar. ';
    }
  }
  return context;
}

export function exportConversation(messages: CoachMessage[]): Blob {
  const planText = messages
    .map((msg) => `${msg.role === 'user' ? 'Você' : 'NeuroCoach'}: ${msg.content}`)
    .join('\n\n');
  return new Blob([planText], { type: 'text/plain' });
}
