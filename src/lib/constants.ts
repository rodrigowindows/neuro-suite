// Centralized configuration constants

// E-mail da conta demo (publico). Vazio = recurso de conta demo inerte.
// A senha da conta demo NUNCA entra no codigo.
export const DEMO_ACCOUNT_EMAIL = '20001711@professor.se.df.gov.br';

export const FEEDBACK_FORM_URL ='https://docs.google.com/forms/d/e/1FAIpQLSe81DxmsG0amW42BCTsr2w2nplmT8uLsedNpNVCE-pC7HCj_g/viewform?usp=dialog';

export const APP_CONFIG = {
  name: 'CrewVitals',
  version: '1.0',
  tagline: 'Detecção de Estresse e Coach de Alta Performance',
  company: 'CrewVitals by Dark Sector',
  contact: {
    email: 'contato@neurosuite.com.br',
    whatsapp: '(11) 99999-9999',
  },
} as const;
