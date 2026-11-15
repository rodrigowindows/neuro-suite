import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageToggle from './LanguageToggle';
import { LangProvider } from '@/i18n';

describe('LanguageToggle component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders both EN and PT buttons with accessible target size of at least 44px', () => {
    // Arrange & Act
    render(
      <LangProvider initialLang="en">
        <LanguageToggle />
      </LangProvider>
    );

    const enBtn = screen.getByRole('button', { name: /^EN$/i });
    const ptBtn = screen.getByRole('button', { name: /^PT$/i });

    // Assert
    expect(enBtn).toBeInTheDocument();
    expect(ptBtn).toBeInTheDocument();
    expect(enBtn.className).toContain('min-h-[44px]');
    expect(enBtn.className).toContain('min-w-[44px]');
    expect(ptBtn.className).toContain('min-h-[44px]');
    expect(ptBtn.className).toContain('min-w-[44px]');
  });

  it('reflects active language through aria-pressed', () => {
    // Arrange & Act
    render(
      <LangProvider initialLang="en">
        <LanguageToggle />
      </LangProvider>
    );

    const enBtn = screen.getByRole('button', { name: /^EN$/i });
    const ptBtn = screen.getByRole('button', { name: /^PT$/i });

    // Assert
    expect(enBtn).toHaveAttribute('aria-pressed', 'true');
    expect(ptBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches language and updates aria-pressed when clicked', () => {
    // Arrange
    render(
      <LangProvider initialLang="en">
        <LanguageToggle />
      </LangProvider>
    );

    const enBtn = screen.getByRole('button', { name: /^EN$/i });
    const ptBtn = screen.getByRole('button', { name: /^PT$/i });

    // Act: click PT
    fireEvent.click(ptBtn);

    // Assert
    expect(ptBtn).toHaveAttribute('aria-pressed', 'true');
    expect(enBtn).toHaveAttribute('aria-pressed', 'false');

    // Act: click EN
    fireEvent.click(enBtn);

    // Assert
    expect(enBtn).toHaveAttribute('aria-pressed', 'true');
    expect(ptBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('does not contain any emojis in text or labels', () => {
    // Arrange
    const { container } = render(
      <LangProvider initialLang="en">
        <LanguageToggle />
      </LangProvider>
    );

    // Regex checking common emoji unicode blocks
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    // Assert
    expect(emojiRegex.test(container.textContent || '')).toBe(false);
  });

  it('renders safely outside LangProvider with PT as default', () => {
    // Arrange & Act
    render(<LanguageToggle />);

    const ptBtn = screen.getByRole('button', { name: /^PT$/i });
    const enBtn = screen.getByRole('button', { name: /^EN$/i });

    // Assert
    expect(ptBtn).toHaveAttribute('aria-pressed', 'true');
    expect(enBtn).toHaveAttribute('aria-pressed', 'false');
  });
});
