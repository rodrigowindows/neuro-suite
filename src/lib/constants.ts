// Centralized configuration constants

// E-mail da conta demo legado. Vazio = recurso de conta demo inerte.
// No v1.2+, a demonstracao publica oficial opera em /demo sem login.
export const DEMO_ACCOUNT_EMAIL = '';

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
