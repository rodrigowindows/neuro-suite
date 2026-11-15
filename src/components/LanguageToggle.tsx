import React from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

export interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className }: LanguageToggleProps = {}): JSX.Element {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={cn(
        'inline-flex items-center rounded-md border border-border/40 p-0.5 bg-background/50 backdrop-blur-sm',
        className
      )}
    >
      <Button
        type="button"
        variant={lang === 'en' ? 'default' : 'ghost'}
        size="sm"
        aria-pressed={lang === 'en'}
        onClick={() => setLang('en')}
        className="min-h-[44px] min-w-[44px] px-3 text-xs font-semibold uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none transition-colors"
      >
        EN
      </Button>
      <Button
        type="button"
        variant={lang === 'pt' ? 'default' : 'ghost'}
        size="sm"
        aria-pressed={lang === 'pt'}
        onClick={() => setLang('pt')}
        className="min-h-[44px] min-w-[44px] px-3 text-xs font-semibold uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none transition-colors"
      >
        PT
      </Button>
    </div>
  );
}

export { LanguageToggle };
