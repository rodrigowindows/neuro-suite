import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Index from './Index';

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}

const renderIndex = () =>
  render(
    <MemoryRouter>
      <Index />
    </MemoryRouter>,
  );

describe('Index page', () => {
  const originalIO = globalThis.IntersectionObserver;

  beforeEach(() => {
    globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
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

  it('renders no emoji in the rendered HTML', () => {
    // Arrange
    const emoji = /\p{Extended_Pictographic}/u;

    // Act
    const { container } = renderIndex();

    // Assert
    expect(emoji.test(container.innerHTML)).toBe(false);
  });
});
