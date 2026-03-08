import { Progress } from '@/components/ui/progress';

interface ScanProgressProps {
  progress: number;
}

export default function ScanProgress({ progress }: ScanProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Progresso do scan</span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
