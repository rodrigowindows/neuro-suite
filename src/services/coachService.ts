import { translate, type Lang } from '@/i18n';

export interface CoachMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function getInitialMessage(stressLevel: string, lang: Lang = 'pt'): string {
  if (stressLevel === 'low') {
    return translate(lang, 'coach.initial.low');
  }
  if (stressLevel === 'moderate') {
    return translate(lang, 'coach.initial.moderate');
  }
  if (stressLevel === 'high') {
    return translate(lang, 'coach.initial.high');
  }
  return translate(lang, 'coach.initial.default');
}

export function buildContext(stressLevel: string, hrvValue: string, lang: Lang = 'pt'): string {
  let context = translate(lang, 'coach.service.stressContext', { level: stressLevel });
  const hrvNum = parseFloat(hrvValue);
  if (!isNaN(hrvNum)) {
    context += `HRV (RMSSD): ${hrvNum}ms. `;
    if (hrvNum < 30) {
      context += translate(lang, 'coach.service.lowHrvWarning');
    }
  }
  return context;
}

export function exportConversation(messages: CoachMessage[], lang: Lang = 'pt'): Blob {
  const userLabel = translate(lang, 'coach.service.userLabel');
  const coachLabel = translate(lang, 'coach.service.coachLabel');
  const planText = messages
    .map((msg) => `${msg.role === 'user' ? userLabel : coachLabel}: ${msg.content}`)
    .join('\n\n');
  return new Blob([planText], { type: 'text/plain' });
}
