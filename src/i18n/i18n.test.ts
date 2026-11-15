import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import {
  LANG_STORAGE_KEY,
  resolveInitialLang,
  translate,
  LangProvider,
  useI18n,
  catalog,
} from './index';

describe('i18n core module', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('resolveInitialLang', () => {
    it('prioritizes explicit ?lang in search over stored value and navigator', () => {
      // Arrange & Act
      const result = resolveInitialLang({
        search: '?lang=pt',
        stored: 'en',
        navigatorLanguage: 'en-US',
      });

      // Assert
      expect(result).toBe('pt');
    });

    it('prioritizes stored value over navigator language when search is empty or absent', () => {
      // Arrange & Act
      const result = resolveInitialLang({
        search: '',
        stored: 'pt',
        navigatorLanguage: 'en-US',
      });

      // Assert
      expect(result).toBe('pt');
    });

    it('resolves navigatorLanguage starting with pt to pt', () => {
      // Arrange & Act
      const result1 = resolveInitialLang({ search: '', stored: null, navigatorLanguage: 'pt-BR' });
      const result2 = resolveInitialLang({ search: '', stored: null, navigatorLanguage: 'pt-PT' });
      const result3 = resolveInitialLang({ search: '', stored: null, navigatorLanguage: 'pt' });

      // Assert
      expect(result1).toBe('pt');
      expect(result2).toBe('pt');
      expect(result3).toBe('pt');
    });

    it('falls back to en for non-Portuguese navigator language when no other source is provided', () => {
      // Arrange & Act
      const resultFr = resolveInitialLang({ search: '', stored: null, navigatorLanguage: 'fr' });
      const resultEs = resolveInitialLang({ search: '', stored: null, navigatorLanguage: 'es-ES' });
      const resultEn = resolveInitialLang({ search: '', stored: null, navigatorLanguage: 'en-GB' });

      // Assert
      expect(resultFr).toBe('en');
      expect(resultEs).toBe('en');
      expect(resultEn).toBe('en');
    });

    it('ignores invalid values in ?lang= and falls back to stored', () => {
      // Arrange & Act
      const result = resolveInitialLang({
        search: '?lang=invalid',
        stored: 'en',
        navigatorLanguage: 'pt-BR',
      });

      // Assert
      expect(result).toBe('en');
    });

    it('ignores invalid values in ?lang= and stored, falling back to navigator or en', () => {
      // Arrange & Act
      const resultPt = resolveInitialLang({
        search: '?lang=xyz',
        stored: 'invalid',
        navigatorLanguage: 'pt-BR',
      });
      const resultEn = resolveInitialLang({
        search: '?lang=xyz',
        stored: 'invalid',
        navigatorLanguage: 'fr-FR',
      });

      // Assert
      expect(resultPt).toBe('pt');
      expect(resultEn).toBe('en');
    });

    it('reads window.location.search and localStorage when opts are not provided', () => {
      // Arrange
      localStorage.setItem(LANG_STORAGE_KEY, 'pt');

      // Act
      const result = resolveInitialLang();

      // Assert
      expect(result).toBe('pt');
    });
  });

  describe('translate', () => {
    it('translates existing keys for the requested language', () => {
      // Arrange & Act & Assert
      expect(translate('en', 'common.language')).toBe('Language');
      expect(translate('pt', 'common.language')).toBe('Idioma');
      expect(translate('en', 'common.lang.en')).toBe('English');
      expect(translate('pt', 'common.lang.en')).toBe('Inglês');
    });

    it('interpolates {var} tokens with provided vars', () => {
      // Arrange
      catalog.en['test.greeting'] = 'Hello, {name}!';
      catalog.pt['test.greeting'] = 'Olá, {name}!';

      // Act & Assert
      expect(translate('en', 'test.greeting', { name: 'Astronaut' })).toBe('Hello, Astronaut!');
      expect(translate('pt', 'test.greeting', { name: 'Astronauta' })).toBe('Olá, Astronauta!');

      // Cleanup
      delete catalog.en['test.greeting'];
      delete catalog.pt['test.greeting'];
    });

    it('handles numeric interpolation tokens including 0', () => {
      // Arrange
      catalog.en['test.score'] = 'Score: {score}';

      // Act & Assert
      expect(translate('en', 'test.score', { score: 34 })).toBe('Score: 34');
      expect(translate('en', 'test.score', { score: 0 })).toBe('Score: 0');

      // Cleanup
      delete catalog.en['test.score'];
    });

    it('falls back to English when key is missing in Portuguese', () => {
      // Arrange
      catalog.en['test.only_in_en'] = 'Available only in English';
      delete catalog.pt['test.only_in_en'];

      // Act & Assert
      expect(translate('pt', 'test.only_in_en')).toBe('Available only in English');

      // Cleanup
      delete catalog.en['test.only_in_en'];
    });

    it('falls back to key itself when missing in both languages', () => {
      // Arrange & Act & Assert
      expect(translate('en', 'missing.key.example')).toBe('missing.key.example');
      expect(translate('pt', 'missing.key.example')).toBe('missing.key.example');
      expect(translate('en', 'missing.key.{token}', { token: 'value' })).toBe('missing.key.value');
    });
  });

  describe('Locale parity and namespace convention', () => {
    const localeModules = import.meta.glob<{
      en?: Record<string, string>;
      pt?: Record<string, string>;
    }>('./locales/*.ts', { eager: true });

    it('every locale file exports en and pt with identical keys prefixed by filename namespace', () => {
      const filePaths = Object.keys(localeModules);
      expect(filePaths.length).toBeGreaterThan(0);

      for (const filePath of filePaths) {
        const match = filePath.match(/\/([^/]+)\.ts$/);
        expect(match).toBeTruthy();
        const ns = match![1];

        const mod = localeModules[filePath];
        expect(mod.en).toBeDefined();
        expect(mod.pt).toBeDefined();

        const enKeys = Object.keys(mod.en!).sort();
        const ptKeys = Object.keys(mod.pt!).sort();

        // Parity: exactly the same keys in EN and PT
        expect(enKeys).toEqual(ptKeys);

        // Namespace: every key must start with `<ns>.`
        for (const key of enKeys) {
          expect(key.startsWith(`${ns}.`)).toBe(true);
        }
      }
    });
  });

  describe('LangProvider and useI18n', () => {
    function TestConsumer() {
      const { lang, setLang, t } = useI18n();
      return React.createElement(
        'div',
        null,
        React.createElement('span', { 'data-testid': 'current-lang' }, lang),
        React.createElement('span', { 'data-testid': 'translated-word' }, t('common.language')),
        React.createElement(
          'button',
          { type: 'button', onClick: () => setLang('en') },
          'Switch to EN'
        ),
        React.createElement(
          'button',
          { type: 'button', onClick: () => setLang('pt') },
          'Switch to PT'
        )
      );
    }

    it('provides default value outside of LangProvider without throwing', () => {
      // Act
      render(React.createElement(TestConsumer));

      // Assert: default outside provider is 'pt'
      expect(screen.getByTestId('current-lang').textContent).toBe('pt');
      expect(screen.getByTestId('translated-word').textContent).toBe('Idioma');

      // Clicking setLang outside provider does not throw and does nothing
      act(() => {
        screen.getByText('Switch to EN').click();
      });
      expect(screen.getByTestId('current-lang').textContent).toBe('pt');
    });

    it('updates language, persists to localStorage, and updates document.documentElement.lang', () => {
      // Arrange
      render(
        React.createElement(
          LangProvider,
          { initialLang: 'en' },
          React.createElement(TestConsumer)
        )
      );

      // Assert initial state
      expect(screen.getByTestId('current-lang').textContent).toBe('en');
      expect(screen.getByTestId('translated-word').textContent).toBe('Language');
      expect(document.documentElement.lang).toBe('en');

      // Act: switch to PT
      act(() => {
        screen.getByText('Switch to PT').click();
      });

      // Assert updated state
      expect(screen.getByTestId('current-lang').textContent).toBe('pt');
      expect(screen.getByTestId('translated-word').textContent).toBe('Idioma');
      expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('pt');
      expect(document.documentElement.lang).toBe('pt-BR');
    });

    it('restores document.documentElement.lang on unmount', () => {
      // Arrange
      document.documentElement.lang = 'prev-lang';
      const { unmount } = render(
        React.createElement(
          LangProvider,
          { initialLang: 'en' },
          React.createElement('div', null, 'Inner')
        )
      );
      expect(document.documentElement.lang).toBe('en');

      // Act
      unmount();

      // Assert
      expect(document.documentElement.lang).toBe('prev-lang');
    });
  });
});
