import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

describe('Auth page', () => {
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

  it('renders no emoji in the rendered HTML', () => {
    // Arrange
    const emoji = /\p{Extended_Pictographic}/u;

    // Act
    const { container } = renderAuth();

    // Assert
    expect(emoji.test(container.innerHTML)).toBe(false);
  });
});
