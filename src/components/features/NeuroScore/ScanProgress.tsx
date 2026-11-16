import { Progress } from '@/components/ui/progress';
import { useI18n } from '@/i18n';

interface ScanProgressProps {
  progress: number;
}

export default function ScanProgress({ progress }: ScanProgressProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{t('bioscore.scan.progress')}</span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
