import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/i18n';

interface ToneSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ToneSelector({ value, onChange }: ToneSelectorProps) {
  const { t } = useI18n();

  return (
    <div className="p-4 bg-accent/10 rounded-lg border-2 border-accent/30 space-y-3">
      <h3 className="font-semibold text-accent">{t('coach.tone.title')}</h3>
      <p className="text-sm text-muted-foreground">
        {t('coach.tone.subtitle')}
      </p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t('coach.tone.placeholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="technical">
            {t('coach.tone.technical')}
          </SelectItem>
          <SelectItem value="casual">
            {t('coach.tone.casual')}
          </SelectItem>
          <SelectItem value="spiritual">
            {t('coach.tone.spiritual')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
