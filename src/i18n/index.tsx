/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

export type Lang = 'en' | 'pt';
export const LANG_STORAGE_KEY = 'crewvitals_lang';

interface LocaleModule {
  en?: Record<string, string>;
  pt?: Record<string, string>;
  [key: string]: unknown;
}

const localeModules = import.meta.glob<LocaleModule>('./locales/*.ts', { eager: true });

export const catalog: Record<Lang, Record<string, string>> = {
  en: {},
  pt: {},
};

for (const path in localeModules) {
  const mod = localeModules[path];
  if (mod?.en) {
    Object.assign(catalog.en, mod.en);
  }
  if (mod?.pt) {
    Object.assign(catalog.pt, mod.pt);
  }
}

export function resolveInitialLang(opts?: {
  search?: string;
  stored?: string | null;
  navigatorLanguage?: string;
}): Lang {
  // 1. URL search param: ?lang=en|pt
  let searchStr = opts?.search;
  if (searchStr === undefined && !(opts && 'search' in opts)) {
    try {
      if (typeof window !== 'undefined' && window.location?.search) {
        searchStr = window.location.search;
      }
    } catch {
      // ignore
    }
  }

  if (searchStr) {
    try {
      const cleanSearch = searchStr.startsWith('?') ? searchStr.slice(1) : searchStr;
      const params = new URLSearchParams(cleanSearch);
      const urlLang = params.get('lang')?.toLowerCase();
      if (urlLang === 'en' || urlLang === 'pt') {
        return urlLang;
      }
    } catch {
      // ignore
    }
  }

  // 2. Saved preference in storage
  let storedVal = opts?.stored;
  if (storedVal === undefined && !(opts && 'stored' in opts)) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        storedVal = window.localStorage.getItem(LANG_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }

  if (storedVal) {
    const cleanStored = storedVal.toLowerCase();
    if (cleanStored === 'en' || cleanStored === 'pt') {
      return cleanStored;
    }
  }

  // 3. Browser navigator language starting with 'pt'
  let navLang = opts?.navigatorLanguage;
  if (navLang === undefined && !(opts && 'navigatorLanguage' in opts)) {
    try {
      if (typeof navigator !== 'undefined' && navigator.language) {
        navLang = navigator.language;
      }
    } catch {
      // ignore
    }
  }

  if (navLang && navLang.toLowerCase().startsWith('pt')) {
    return 'pt';
  }

  // 4. Default fallback
  return 'en';
}

export function translate(
  lang: Lang,
  key: string,
  vars?: Record<string, string | number>
): string {
  let text = catalog[lang]?.[key];

  if (text === undefined && lang !== 'en') {
    text = catalog.en?.[key];
  }

  if (text === undefined) {
    text = key;
  }

  if (vars && text.includes('{')) {
    text = text.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, paramName) => {
      const val = vars[paramName];
      return val !== undefined ? String(val) : match;
    });
  }

  return text;
}

export interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const defaultContextValue: I18nContextValue = {
  lang: 'pt',
  setLang: () => {},
  t: (key: string, vars?: Record<string, string | number>) => translate('pt', key, vars),
};

const I18nContext = createContext<I18nContextValue>(defaultContextValue);

export function LangProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}): JSX.Element {
  const [lang, setLangState] = useState<Lang>(() => initialLang ?? resolveInitialLang());

  // URL search parameter ?lang= persistence on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location?.search) {
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang')?.toLowerCase();
        if (urlLang === 'en' || urlLang === 'pt') {
          localStorage.setItem(LANG_STORAGE_KEY, urlLang);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const setLang = useCallback((nextLang: Lang) => {
    setLangState(nextLang);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(LANG_STORAGE_KEY, nextLang);
      }
    } catch {
      // ignore
    }
  }, []);

  // Update document.documentElement.lang ('en' or 'pt-BR') and restore on unmount
  useEffect(() => {
    let prevLang: string | null = null;
    try {
      if (typeof document !== 'undefined' && document.documentElement) {
        prevLang = document.documentElement.lang;
        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
      }
    } catch {
      // ignore
    }

    return () => {
      try {
        if (typeof document !== 'undefined' && document.documentElement && prevLang !== null) {
          document.documentElement.lang = prevLang;
        }
      } catch {
        // ignore
      }
    };
  }, [lang]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
