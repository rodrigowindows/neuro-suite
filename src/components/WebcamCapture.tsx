import { useRef, useEffect, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { AlertCircle, ArrowDown } from 'lucide-react';
import HRVMonitor from './HRVMonitor';

interface WebcamCaptureProps {
  onBlinkDetected: (blinkRate: number, hrvValue?: number) => void;
  isScanning: boolean;
  onScanComplete: () => void;
}

export default function WebcamCapture({ onBlinkDetected, isScanning, onScanComplete }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [blinkCount, setBlinkCount] = useState(0);
  const [currentBlinkRate, setCurrentBlinkRate] = useState(0);
  const [error, setError] = useState<string>('');
  const [hrvValue, setHRVValue] = useState<number | undefined>(undefined);
  const [faceDetected, setFaceDetected] = useState(true);
  const [lowLightWarning, setLowLightWarning] = useState(false);
  const [isBackgroundMode, setIsBackgroundMode] = useState(false);
  const animationFrameRef = useRef<number>();
  const scanStartTimeRef = useRef<number>(0);
  const lastEARRef = useRef<number>(1);
  const blinkCountRef = useRef<number>(0);
  const noFaceFramesRef = useRef<number>(0);
  const backgroundDataRef = useRef<{ blinks: number[], timestamps: number[] }>({ blinks: [], timestamps: [] });

  // Inicializar MediaPipe com configuração robusta
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          numFaces: 1,
          runningMode: 'VIDEO',
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
          minFaceDetectionConfidence: 0.3, // Mais tolerante para ângulos
          minFacePresenceConfidence: 0.3,
        });
        
        setFaceLandmarker(landmarker);
      } catch (err) {
        setError('Erro ao inicializar detecção facial');
        console.error(err);
      }
    };

    initMediaPipe();
  }, []);

  // Detectar visibilidade da página (background mode)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsBackgroundMode(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Função para parar câmera
  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Iniciar webcam com configurações otimizadas
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
            frameRate: { ideal: 30 }
          },
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Erro ao acessar câmera. Permita o acesso.');
        console.error(err);
      }
    };

    startWebcam();

    return () => {
      stopWebcam();
    };
  }, []);

  // Calcular EAR (Eye Aspect Ratio)
  const calculateEAR = (landmarks: any) => {
    // Índices dos landmarks dos olhos
    const leftEye = [33, 160, 158, 133, 153, 144];
    const rightEye = [362, 385, 387, 263, 373, 380];

    const getEAR = (eye: number[]) => {
      const p1 = landmarks[eye[1]];
      const p2 = landmarks[eye[2]];
      const p3 = landmarks[eye[3]];
      const p4 = landmarks[eye[4]];
      const p5 = landmarks[eye[5]];
      const p6 = landmarks[eye[0]];

      const vertical1 = Math.sqrt(Math.pow(p2.x - p6.x, 2) + Math.pow(p2.y - p6.y, 2));
      const vertical2 = Math.sqrt(Math.pow(p3.x - p5.x, 2) + Math.pow(p3.y - p5.y, 2));
      const horizontal = Math.sqrt(Math.pow(p1.x - p4.x, 2) + Math.pow(p1.y - p4.y, 2));

      return (vertical1 + vertical2) / (2.0 * horizontal);
    };

    const leftEAR = getEAR(leftEye);
    const rightEAR = getEAR(rightEye);
    
    return (leftEAR + rightEAR) / 2.0;
  };

  // Processar frame com detecção robusta
  const processFrame = () => {
    if (!videoRef.current || !faceLandmarker || !isScanning) {
      return;
    }

    const video = videoRef.current;

    if (video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    try {
      // Detectar face com configuração robusta
      const results = faceLandmarker.detectForVideo(video, Date.now());

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        const currentEAR = calculateEAR(landmarks);

        // Reset contador de frames sem face
        noFaceFramesRef.current = 0;
        setFaceDetected(true);
        setLowLightWarning(false);

        // Detectar piscada com threshold mais tolerante para ângulos
        const EAR_THRESHOLD = 1.25; // Mais tolerante
        if (lastEARRef.current > EAR_THRESHOLD && currentEAR <= EAR_THRESHOLD) {
          blinkCountRef.current += 1;
          setBlinkCount(blinkCountRef.current);
          
          // Salvar timestamp em background mode
          if (isBackgroundMode) {
            backgroundDataRef.current.blinks.push(blinkCountRef.current);
            backgroundDataRef.current.timestamps.push(Date.now());
          }
        }

        lastEARRef.current = currentEAR;

        // Verificar tempo de scan
        if (scanStartTimeRef.current === 0) {
          scanStartTimeRef.current = Date.now();
        }

        const elapsedTime = (Date.now() - scanStartTimeRef.current) / 1000;
        
        // Atualizar taxa de piscadas em tempo real
        if (elapsedTime > 0) {
          const currentRate = (blinkCountRef.current / elapsedTime) * 60;
          setCurrentBlinkRate(Math.round(currentRate * 10) / 10);
        }

        if (elapsedTime >= 60) {
          const blinkRate = blinkCountRef.current / (elapsedTime / 60);
          onBlinkDetected(blinkRate, hrvValue);
          stopWebcam();
          onScanComplete();
          return;
        }
      } else {
        // Incrementar contador de frames sem face
        noFaceFramesRef.current += 1;

        // Alertas progressivos
        if (noFaceFramesRef.current > 30) { // ~1 segundo sem face
          setFaceDetected(false);
        }
        if (noFaceFramesRef.current > 90) { // ~3 segundos sem face
          setLowLightWarning(true);
        }
      }
    } catch (error) {
      console.error('Error processing frame:', error);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  // Controlar scan
  useEffect(() => {
    if (isScanning && faceLandmarker) {
      console.log('Starting scan with faceLandmarker:', !!faceLandmarker);
      blinkCountRef.current = 0;
      setBlinkCount(0);
      setCurrentBlinkRate(0);
      scanStartTimeRef.current = 0;
      lastEARRef.current = 1;
      
      // Garantir que processFrame seja chamado
      const startProcessing = () => {
        console.log('processFrame iniciado');
        processFrame();
      };
      startProcessing();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScanning, faceLandmarker]);

  const handleHRVDetected = (hrv: number, heartRate: number) => {
    console.log('HRV detectado:', hrv, 'ms, HR:', heartRate, 'bpm');
    setHRVValue(hrv);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      
      <div className="relative rounded-lg overflow-hidden shadow-medium bg-muted">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto"
        />
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        
        {/* Feedback visual overlay */}
        {isScanning && (
          <>
            {/* Background mode indicator */}
            {isBackgroundMode && (
              <div className="absolute top-2 right-2 px-3 py-1 bg-blue-500/90 text-white text-xs rounded-full flex items-center gap-1 animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full" />
                Rodando em background
              </div>
            )}
            
            {/* Face not detected warning */}
            {!faceDetected && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="text-center space-y-2 p-4">
                  <ArrowDown className="h-8 w-8 text-yellow-400 mx-auto animate-bounce" />
                  <p className="text-white text-sm font-medium">Ajuste sua posição</p>
                  <p className="text-white/70 text-xs">Posicione seu rosto na câmera</p>
                </div>
              </div>
            )}
            
            {/* Low light warning */}
            {lowLightWarning && (
              <div className="absolute bottom-2 left-2 right-2 px-3 py-2 bg-orange-500/90 text-white text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>Iluminação baixa? Aproxime-se da luz!</span>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* HRV Monitor via rPPG */}
      <HRVMonitor
        videoRef={videoRef}
        canvasRef={canvasRef}
        isScanning={isScanning}
        onHRVDetected={handleHRVDetected}
      />
      
      {isScanning && (
        <div className="text-center space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Piscadas</p>
              <p className="text-2xl font-bold text-primary">{blinkCount}</p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Taxa atual</p>
              <p className="text-2xl font-bold text-secondary">{currentBlinkRate}/min</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-green-500' : 'bg-red-500'}`} />
            {faceDetected ? 'Face detectada • ' : 'Posicione seu rosto • '}
            {isBackgroundMode ? 'Pode minimizar janela' : 'Trabalhe normalmente'}
          </div>
        </div>
      )}
    </div>
  );
}