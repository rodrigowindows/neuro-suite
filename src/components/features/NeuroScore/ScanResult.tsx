import { StressResult, getStressLabel, getDiagnosticLabel, getPnlTip } from '@/services/stressCalculator';
import PostScanActionPlan from '@/components/PostScanActionPlan';

interface ScanResultProps {
  result: StressResult;
  userName: string;
  lastHrvValue?: number;
}

export default function ScanResult({ result, userName, lastHrvValue }: ScanResultProps) {
  return (
    <div className="p-6 bg-gradient-card rounded-lg space-y-4 border border-primary/20">
      <div className="text-center space-y-2">
        <div className="text-6xl">{result.emoji}</div>
        <h3 className="text-2xl font-bold">
          {userName && <span>{userName}, </span>}
          Nível {getStressLabel(result.stressLevel)}
        </h3>
        <p className="text-muted-foreground">{result.message}</p>
      </div>

      <div className={`grid ${result.hrvValue ? 'grid-cols-3' : 'grid-cols-2'} gap-4 pt-4 border-t`}>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Taxa de piscadas</p>
          <p className="text-2xl font-bold text-primary">{result.blinkRate}/min</p>
        </div>
        {result.hrvValue && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">HRV</p>
            <p className="text-2xl font-bold text-accent">{result.hrvValue}<span className="text-sm">ms</span></p>
          </div>
        )}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Diagnóstico</p>
          <p className="text-2xl font-bold text-secondary">
            {getDiagnosticLabel(result.stressLevel)}
          </p>
        </div>
      </div>

      <div className="p-4 bg-primary/5 rounded-lg">
        <p className="text-sm font-medium mb-2">💡 Dica PNL:</p>
        <p className="text-sm text-muted-foreground">{getPnlTip(result.stressLevel)}</p>
      </div>

      <PostScanActionPlan
        stressLevel={result.stressLevel}
        blinkRate={result.blinkRate}
        hrvValue={result.hrvValue ?? lastHrvValue}
      />
    </div>
  );
}
