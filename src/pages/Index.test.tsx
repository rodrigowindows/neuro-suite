import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Index from './Index';
import { LangProvider, type Lang } from '@/i18n';

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}

const renderIndex = (initialLang?: Lang) =>
  render(
    initialLang ? (
      <LangProvider initialLang={initialLang}>
        <MemoryRouter>
          <Index />
        </MemoryRouter>
      </LangProvider>
    ) : (
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    )
  );

describe('Index page', () => {
  const originalIO = globalThis.IntersectionObserver;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
    globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    localStorage.clear();
    globalThis.IntersectionObserver = originalIO;
  });

  it('does not contain the unverifiable "100% Offline" or "0 Dados Vazados" claims', () => {
    // Arrange / Act
    const { container } = renderIndex();

    // Assert
    expect(container.textContent).not.toContain('100% Offline');
    expect(container.textContent).not.toContain('0 Dados Vazados');
  });

  it('does not contain the removed testimonial names', () => {
    // Arrange
    const names = ['Elena Vasquez', 'James Chen', 'Ana Kowalski'];

    // Act
    const { container } = renderIndex();

    // Assert
    for (const name of names) {
      expect(container.textContent).not.toContain(name);
    }
  });

  it('renders the "Contexto da missão" section under the "depoimentos" anchor', () => {
    // Arrange / Act
    renderIndex();
    const section = document.getElementById('depoimentos');

    // Assert
    expect(section).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Contexto da missão' })).toBeTruthy();
  });

  it('renders the three factual context cards', () => {
    // Arrange
    const titles = [
      'Latência de comunicação com a Terra',
      'Isolamento e confinamento',
      'Microgravidade',
    ];

    // Act
    renderIndex();

    // Assert
    for (const title of titles) {
      expect(screen.getByText(title)).toBeTruthy();
    }
  });

  it('renders the statistics bar with verifiable labels only', () => {
    // Arrange
    const expected = [
      'Isolamento de dados por usuário',
      'Simulado nesta versão',
      'Estimativas, não diagnóstico',
      'Apoio à decisão',
    ];

    // Act
    const { container } = renderIndex();

    // Assert
    for (const label of expected) {
      expect(container.textContent).toContain(label);
    }
  });

  it('renders the "Iniciar Missão" button without an emoji', () => {
    // Arrange / Act
    renderIndex();

    // Assert
    expect(screen.getByRole('button', { name: 'Iniciar Missão' })).toBeTruthy();
  });

  it('renders the "Ver demonstração (sem login)" link with destination /demo', () => {
    // Arrange & Act
    renderIndex();
    const demoLink = screen.getByRole('link', { name: 'Ver demonstração (sem login)' });

    // Assert
    expect(demoLink).toBeTruthy();
    expect(demoLink.getAttribute('href')).toBe('/demo');
  });

  it('renders supporting text informing that demo data is simulated', () => {
    // Arrange & Act
    const { container } = renderIndex();

    // Assert
    expect(container.textContent).toContain('dados simulados');
  });

  it('renders no emoji in the rendered HTML', () => {
    // Arrange
    const emoji = /\p{Extended_Pictographic}/u;

    // Act
    const { container } = renderIndex();

    // Assert
    expect(emoji.test(container.innerHTML)).toBe(false);
  });

  describe('i18n multilingual rendering', () => {
    it('renders English content when initialLang is en', () => {
      // Arrange & Act
      const { container } = renderIndex('en');

      // Assert: Primary hero actions and text
      const demoLink = screen.getByRole('link', { name: 'View demo (no login)' });
      expect(demoLink).toBeTruthy();
      expect(demoLink.getAttribute('href')).toBe('/demo');
      expect(screen.getByRole('button', { name: 'Start Mission' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'View Features' })).toBeTruthy();
      expect(screen.getByRole('heading', { name: 'Mission Capabilities' })).toBeTruthy();
      expect(screen.getByRole('heading', { name: 'Mission Context' })).toBeTruthy();
      expect(screen.getByText('Communication latency with Earth')).toBeTruthy();
      expect(screen.getByText('User data isolation')).toBeTruthy();
      expect(screen.getByText('Long-Duration Missions')).toBeTruthy();
      expect(container.textContent).toContain('Webcam-based monitoring');
      expect(container.textContent).toContain('recovery techniques');

      // Assert: Portuguese texts are absent
      expect(container.textContent).not.toContain('Ver demonstração');
      expect(container.textContent).not.toContain('Iniciar Missão');

      // Assert: Prohibited claims and emojis
      expect(container.textContent).not.toContain('100% Offline');
      expect(container.textContent).not.toContain('0 Dados Vazados');
      expect(container.textContent).not.toContain('0 data leaks');
      expect(container.textContent).not.toContain('Long-Duration Missions — NASA');
      expect(container.textContent).not.toContain('in real time');
      expect(container.textContent).not.toContain('techniques validated');
      const emoji = /\p{Extended_Pictographic}/u;
      expect(emoji.test(container.innerHTML)).toBe(false);
    });

    it('renders Portuguese content when initialLang is pt', () => {
      // Arrange & Act
      const { container } = renderIndex('pt');

      // Assert: Primary hero actions and text
      const demoLink = screen.getByRole('link', { name: 'Ver demonstração (sem login)' });
      expect(demoLink).toBeTruthy();
      expect(demoLink.getAttribute('href')).toBe('/demo');
      expect(screen.getByRole('button', { name: 'Iniciar Missão' })).toBeTruthy();
      expect(screen.getByRole('heading', { name: 'Contexto da missão' })).toBeTruthy();
      expect(screen.getByText('Missões de longa duração')).toBeTruthy();
      expect(container.textContent).toContain('monitoramento por webcam');
      expect(container.textContent).toContain('técnicas de recuperação');

      // Assert: English texts are absent
      expect(container.textContent).not.toContain('View demo');
      expect(container.textContent).not.toContain('Start Mission');

      // Assert: Prohibited claims and emojis
      expect(container.textContent).not.toContain('100% Offline');
      expect(container.textContent).not.toContain('0 Dados Vazados');
      expect(container.textContent).not.toContain('0 data leaks');
      expect(container.textContent).not.toContain('Missões de Longa Duração — NASA');
      expect(container.textContent).not.toContain('em tempo real');
      expect(container.textContent).not.toContain('técnicas validadas');
      const emoji = /\p{Extended_Pictographic}/u;
      expect(emoji.test(container.innerHTML)).toBe(false);
    });

    it('renders LanguageToggle in header and allows switching language', () => {
      // Arrange
      renderIndex('pt');
      const enBtn = screen.getByRole('button', { name: 'EN' });
      const ptBtn = screen.getByRole('button', { name: 'PT' });

      expect(ptBtn.getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByRole('link', { name: 'Ver demonstração (sem login)' })).toBeTruthy();

      // Act: click EN
      fireEvent.click(enBtn);

      // Assert: switches to English
      expect(enBtn.getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByRole('link', { name: 'View demo (no login)' })).toBeTruthy();
    });
  });
});
