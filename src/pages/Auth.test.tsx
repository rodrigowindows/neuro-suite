import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LangProvider } from '@/i18n';
import Auth from './Auth';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
  })),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { resetPasswordForEmail: vi.fn() },
  },
}));

const renderAuth = () =>
  render(
    <MemoryRouter>
      <Auth />
    </MemoryRouter>,
  );

const renderAuthWithLang = (lang: 'en' | 'pt') =>
  render(
    <LangProvider initialLang={lang}>
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    </LangProvider>,
  );

describe('Auth page', () => {
  describe('Default (without LangProvider fallback to Portuguese)', () => {
    it('shows the crew telemetry subtitle', () => {
      // Arrange
      const subtitle = 'Terminal de Telemetria de Saúde da Tripulação';

      // Act
      renderAuth();

      // Assert
      expect(screen.getByText(subtitle)).toBeTruthy();
    });

    it('shows the "Autenticar" submit button on the login form', () => {
      // Arrange / Act
      renderAuth();

      // Assert
      expect(screen.getByRole('button', { name: 'Autenticar' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Entrar' })).toBeNull();
    });

    it('does not render any Google or Apple sign-in button', () => {
      // Arrange / Act
      const { container } = renderAuth();

      // Assert
      expect(container.textContent).not.toMatch(/Google/);
      expect(container.textContent).not.toMatch(/Apple/);
    });

    it('shows the "Ver demonstração sem login" link with destination /demo while keeping "Autenticar"', () => {
      // Arrange & Act
      renderAuth();
      const demoLink = screen.getByRole('link', { name: 'Ver demonstração sem login' });
      const authButton = screen.getByRole('button', { name: 'Autenticar' });

      // Assert
      expect(demoLink).toBeTruthy();
      expect(demoLink.getAttribute('href')).toBe('/demo');
      expect(authButton).toBeTruthy();
    });

    it('renders supporting text informing that demo data is simulated on auth page', () => {
      // Arrange & Act
      const { container } = renderAuth();

      // Assert
      expect(container.textContent).toContain('dados simulados');
    });

    it('renders no emoji in the rendered HTML', () => {
      // Arrange
      const emoji = /\p{Extended_Pictographic}/u;

      // Act
      const { container } = renderAuth();

      // Assert
      expect(emoji.test(container.innerHTML)).toBe(false);
    });
  });

  describe('English localization (initialLang="en")', () => {
    it('shows the English crew telemetry subtitle', () => {
      // Arrange / Act
      renderAuthWithLang('en');

      // Assert
      expect(screen.getByText('Crew Health Telemetry Terminal')).toBeTruthy();
      expect(screen.queryByText('Terminal de Telemetria de Saúde da Tripulação')).toBeNull();
    });

    it('shows the "Sign in" submit button on the login form', () => {
      // Arrange / Act
      renderAuthWithLang('en');

      // Assert
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Autenticar' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Entrar' })).toBeNull();
    });

    it('shows the "View demo without signing in" link with destination /demo', () => {
      // Arrange / Act
      renderAuthWithLang('en');
      const demoLink = screen.getByRole('link', { name: 'View demo without signing in' });

      // Assert
      expect(demoLink).toBeTruthy();
      expect(demoLink.getAttribute('href')).toBe('/demo');
    });

    it('does not render Google or Apple buttons in English', () => {
      // Arrange / Act
      const { container } = renderAuthWithLang('en');

      // Assert
      expect(container.textContent).not.toMatch(/Google/);
      expect(container.textContent).not.toMatch(/Apple/);
    });

    it('renders no emoji in English HTML', () => {
      // Arrange
      const emoji = /\p{Extended_Pictographic}/u;

      // Act
      const { container } = renderAuthWithLang('en');

      // Assert
      expect(emoji.test(container.innerHTML)).toBe(false);
    });
  });

  describe('Portuguese localization (initialLang="pt")', () => {
    it('shows "Autenticar" and "Terminal de Telemetria de Saúde da Tripulação"', () => {
      // Arrange / Act
      renderAuthWithLang('pt');

      // Assert
      expect(screen.getByText('Terminal de Telemetria de Saúde da Tripulação')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Autenticar' })).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Ver demonstração sem login' })).toBeTruthy();
    });

    it('does not render Google or Apple buttons in Portuguese', () => {
      // Arrange / Act
      const { container } = renderAuthWithLang('pt');

      // Assert
      expect(container.textContent).not.toMatch(/Google/);
      expect(container.textContent).not.toMatch(/Apple/);
    });
  });

  describe('LanguageToggle interaction', () => {
    it('switches between EN and PT using the language toggle buttons', () => {
      // Arrange
      renderAuthWithLang('en');
      expect(screen.getByText('Crew Health Telemetry Terminal')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();

      // Act: click PT
      const ptBtn = screen.getByRole('button', { name: 'PT' });
      act(() => {
        ptBtn.click();
      });

      // Assert
      expect(screen.getByText('Terminal de Telemetria de Saúde da Tripulação')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Autenticar' })).toBeTruthy();

      // Act: click EN
      const enBtn = screen.getByRole('button', { name: 'EN' });
      act(() => {
        enBtn.click();
      });

      // Assert
      expect(screen.getByText('Crew Health Telemetry Terminal')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
    });
  });
});
