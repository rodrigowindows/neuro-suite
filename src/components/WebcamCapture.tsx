import { useRef, useEffect, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

interface WebcamCaptureProps {
  onBlinkDetected: (blinkRate: number) => void;
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
  const animationFrameRef = useRef<number>();
  const scanStartTimeRef = useRef<number>(0);
  const lastEARRef = useRef<number>(1);
  const blinkCountRef = useRef<number>(0);

  // Inicializar MediaPipe
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
        });
        
        setFaceLandmarker(landmarker);
      } catch (err) {
        setError('Erro ao inicializar detecção facial');
        console.error(err);
      }
    };

    initMediaPipe();
  }, []);

  // Função para parar câmera
  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Iniciar webcam
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
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

  // Processar frame
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
      // Detectar face
      const results = faceLandmarker.detectForVideo(video, Date.now());
      console.log('Face detection results:', results.faceLandmarks?.length || 0, 'faces');

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        const currentEAR = calculateEAR(landmarks);
        console.log('Current EAR:', currentEAR, 'Last EAR:', lastEARRef.current);

        // Detectar piscada - com MediaPipe valores altos (~1.5) = olhos abertos, baixos (~1.0) = piscada
        const EAR_THRESHOLD = 1.3; // Limiar ajustado para MediaPipe
        if (lastEARRef.current > EAR_THRESHOLD && currentEAR <= EAR_THRESHOLD) {
          blinkCountRef.current += 1;
          setBlinkCount(blinkCountRef.current);
          console.log('Blink detected! Total:', blinkCountRef.current, 'EAR dropped from', lastEARRef.current, 'to', currentEAR);
        }

        lastEARRef.current = currentEAR;

        // Verificar tempo de scan
        if (scanStartTimeRef.current === 0) {
          scanStartTimeRef.current = Date.now();
          console.log('Scan started at:', scanStartTimeRef.current);
        }

        const elapsedTime = (Date.now() - scanStartTimeRef.current) / 1000;
        
        // Atualizar taxa de piscadas em tempo real
        if (elapsedTime > 0) {
          const currentRate = (blinkCountRef.current / elapsedTime) * 60;
          setCurrentBlinkRate(Math.round(currentRate * 10) / 10);
        }

        if (elapsedTime >= 60) {
          const blinkRate = blinkCountRef.current / (elapsedTime / 60);
          console.log('Scan complete! Total blinks:', blinkCountRef.current, 'Rate:', blinkRate);
          onBlinkDetected(blinkRate);
          stopWebcam();
          onScanComplete();
          return;
        }
      } else {
        console.log('No face detected in frame');
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

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
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
      </div>
      {isScanning && (
        <div className="text-center space-y-2">
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
          <p className="text-xs text-muted-foreground">
            Olhe para a câmera e pisque naturalmente por 60 segundos
          </p>
        </div>
      )}
    </div>
  );
}