import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';

interface HRVMonitorProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isScanning: boolean;
  onHRVDetected: (hrv: number, heartRate: number) => void;
}

export default function HRVMonitor({ videoRef, canvasRef, isScanning, onHRVDetected }: HRVMonitorProps) {
  const [heartRate, setHeartRate] = useState<number>(0);
  const [hrv, setHRV] = useState<number>(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const rrIntervalsRef = useRef<number[]>([]);
  const lastPeakTimeRef = useRef<number>(0);
  const greenValuesRef = useRef<number[]>([]);
  const scanStartRef = useRef<number>(0);

  // rPPG: Capturar canal verde da pele (fluxo sanguíneo)
  const extractGreenChannel = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== 4) return;

    // Região de interesse: centro da testa (melhor para rPPG)
    const width = 60;
    const height = 60;
    canvas.width = width;
    canvas.height = height;

    // Capturar frame
    ctx.drawImage(
      video,
      video.videoWidth / 2 - width / 2,
      video.videoHeight / 4,
      width,
      height,
      0,
      0,
      width,
      height
    );

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    // Extrair média do canal verde (indicador de fluxo sanguíneo)
    let greenSum = 0;
    for (let i = 1; i < pixels.length; i += 4) {
      greenSum += pixels[i]; // Canal verde
    }
    const avgGreen = greenSum / (pixels.length / 4);

    greenValuesRef.current.push(avgGreen);

    // Manter janela de 10 segundos (30 FPS = 300 samples)
    if (greenValuesRef.current.length > 300) {
      greenValuesRef.current.shift();
    }

    // Detectar picos (batimentos) usando detecção de pico simples
    if (greenValuesRef.current.length > 10) {
      const recentValues = greenValuesRef.current.slice(-10);
      const avg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
      const threshold = avg * 1.02; // 2% acima da média

      if (avgGreen > threshold && !isPulsing) {
        const now = Date.now();
        if (lastPeakTimeRef.current > 0) {
          const rrInterval = now - lastPeakTimeRef.current;
          rrIntervalsRef.current.push(rrInterval);

          // Manter últimos 20 RR intervals
          if (rrIntervalsRef.current.length > 20) {
            rrIntervalsRef.current.shift();
          }

          // Calcular HR e HRV
          if (rrIntervalsRef.current.length >= 5) {
            const avgRR = rrIntervalsRef.current.reduce((a, b) => a + b, 0) / rrIntervalsRef.current.length;
            const currentHR = Math.round(60000 / avgRR);
            
            // SDNN (desvio padrão dos RR intervals) como métrica de HRV
            const variance = rrIntervalsRef.current.reduce((sum, rr) => {
              return sum + Math.pow(rr - avgRR, 2);
            }, 0) / rrIntervalsRef.current.length;
            const currentHRV = Math.round(Math.sqrt(variance));

            setHeartRate(currentHR);
            setHRV(currentHRV);

            // Notificar componente pai após 30s de dados
            const elapsed = (Date.now() - scanStartRef.current) / 1000;
            if (elapsed >= 30 && rrIntervalsRef.current.length >= 15) {
              onHRVDetected(currentHRV, currentHR);
            }
          }
        }
        lastPeakTimeRef.current = now;
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 200);
      }
    }
  };

  useEffect(() => {
    if (isScanning) {
      scanStartRef.current = Date.now();
      rrIntervalsRef.current = [];
      greenValuesRef.current = [];
      lastPeakTimeRef.current = 0;

      const interval = setInterval(extractGreenChannel, 33); // ~30 FPS
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  if (!isScanning) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-lg border border-red-500/20">
      <div className={`transition-transform ${isPulsing ? 'scale-110' : 'scale-100'}`}>
        <Heart className={`h-6 w-6 ${isPulsing ? 'text-red-500 fill-red-500' : 'text-red-400'}`} />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-red-500">{heartRate}</span>
          <span className="text-xs text-muted-foreground">bpm</span>
          <span className="text-sm text-muted-foreground mx-2">•</span>
          <span className="text-lg font-semibold text-pink-500">{hrv}</span>
          <span className="text-xs text-muted-foreground">ms HRV</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Monitoramento via rPPG (MIT) • Olhe para câmera
        </p>
      </div>
    </div>
  );
}
