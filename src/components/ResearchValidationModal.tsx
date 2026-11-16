import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';

interface MissionRiskCoverageItem {
  indicatorKey: string;
  classificationKey: 'measured' | 'partial' | 'selfReported' | 'notCovered';
  sourceKey: string;
}

const RISK_COVERAGE_ITEMS: MissionRiskCoverageItem[] = [
  {
    indicatorKey: 'dashboard.researchModal.risk.1.indicator',
    classificationKey: 'partial',
    sourceKey: 'dashboard.researchModal.risk.1.source',
  },
  {
    indicatorKey: 'dashboard.researchModal.risk.2.indicator',
    classificationKey: 'partial',
    sourceKey: 'dashboard.researchModal.risk.2.source',
  },
  {
    indicatorKey: 'dashboard.researchModal.risk.3.indicator',
    classificationKey: 'selfReported',
    sourceKey: 'dashboard.researchModal.risk.3.source',
  },
  {
    indicatorKey: 'dashboard.researchModal.risk.4.indicator',
    classificationKey: 'partial',
    sourceKey: 'dashboard.researchModal.risk.4.source',
  },
  {
    indicatorKey: 'dashboard.researchModal.risk.5.indicator',
    classificationKey: 'notCovered',
    sourceKey: 'dashboard.researchModal.risk.5.source',
  },
  {
    indicatorKey: 'dashboard.researchModal.risk.6.indicator',
    classificationKey: 'selfReported',
    sourceKey: 'dashboard.researchModal.risk.6.source',
  },
];

const getClassificationBadgeClass = (classification: string) => {
  switch (classification) {
    case 'measured':
    case 'Medido':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'partial':
    case 'Parcial':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'selfReported':
    case 'Autorrelatado':
      return 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400';
    case 'notCovered':
    default:
      return 'border-border bg-muted/60 text-muted-foreground';
  }
};

interface ResearchValidationModalProps {
  triggerText?: string;
  triggerClassName?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ResearchValidationModal({
  triggerText,
  triggerClassName,
  defaultOpen,
  open,
  onOpenChange,
}: ResearchValidationModalProps) {
  const { t } = useI18n();
  const displayTriggerText = triggerText || t('dashboard.researchModal.defaultTrigger');

  return (
    <Dialog defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          size="sm"
          aria-label={t('dashboard.researchModal.ariaLabel')}
          className={
            triggerClassName ||
            'gap-1.5 text-xs text-primary underline-offset-4 hover:underline p-0 h-auto font-medium inline-flex items-center'
          }
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>{displayTriggerText}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-display">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {t('dashboard.researchModal.title')}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t('dashboard.researchModal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-sm text-foreground/90">
          {/* Item 1 */}
          <div className="p-3.5 rounded-lg border bg-muted/40 space-y-1.5">
            <h4 className="font-semibold text-primary flex items-center gap-1.5 text-sm">
              <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">1</span>
              {t('dashboard.researchModal.item1Title')}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('dashboard.researchModal.item1Text')}
            </p>
          </div>

          {/* Item 2 */}
          <div className="p-3.5 rounded-lg border bg-muted/40 space-y-1.5">
            <h4 className="font-semibold text-primary flex items-center gap-1.5 text-sm">
              <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">2</span>
              {t('dashboard.researchModal.item2Title')}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('dashboard.researchModal.item2Text')}
            </p>
          </div>

          {/* Item 3 */}
          <div className="p-3.5 rounded-lg border bg-muted/40 space-y-1.5">
            <h4 className="font-semibold text-primary flex items-center gap-1.5 text-sm">
              <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">3</span>
              {t('dashboard.researchModal.item3Title')}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('dashboard.researchModal.item3Text')}
            </p>
          </div>

          {/* Mission risk coverage */}
          <div className="space-y-2 pt-2 border-t">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
              {t('dashboard.researchModal.riskCoverageTitle')}
            </h3>
            <div
              tabIndex={0}
              role="region"
              aria-label={t('dashboard.researchModal.riskTableAriaLabel')}
              className="overflow-x-auto rounded-lg border bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <table className="w-full min-w-[340px] text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50 text-muted-foreground">
                    <th scope="col" className="p-2 text-left font-medium">{t('dashboard.researchModal.colIndicator')}</th>
                    <th scope="col" className="p-2 text-left font-medium">{t('dashboard.researchModal.colClassification')}</th>
                    <th scope="col" className="p-2 text-left font-medium">{t('dashboard.researchModal.colSource')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {RISK_COVERAGE_ITEMS.map((item) => {
                    const indicator = t(item.indicatorKey);
                    const classificationLabel = t(`dashboard.researchModal.class.${item.classificationKey}`);
                    const source = t(item.sourceKey);
                    return (
                      <tr key={item.indicatorKey} className="hover:bg-muted/30">
                        <td className="p-2 font-medium text-foreground align-top">
                          {indicator}
                        </td>
                        <td className="p-2 align-top whitespace-nowrap">
                          <span
                            className={cn(
                              'inline-block px-1.5 py-0.5 rounded text-[11px] font-medium border',
                              getClassificationBadgeClass(item.classificationKey)
                            )}
                          >
                            {classificationLabel}
                          </span>
                        </td>
                        <td className="p-2 text-muted-foreground leading-relaxed align-top">
                          {source}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.researchModal.dssDisclaimer')}
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t">
            <h3 className="font-semibold text-foreground text-sm">{t('dashboard.researchModal.bioScoreCompTitle')}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('dashboard.researchModal.bioScoreCompText')}
            </p>
          </div>

          {/* Ethical Disclaimer */}
          <div className="border-t pt-3 mt-2">
            <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 leading-relaxed">
              <span className="font-semibold block mb-0.5">{t('dashboard.researchModal.ethicalTitle')}</span>
              {t('dashboard.researchModal.ethicalText')}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ResearchValidationModal;
