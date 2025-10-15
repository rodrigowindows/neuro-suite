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
  const [error, setError] = useState<string>('');
  const animationFrameRef = useRef<number>();
  const scanStartTimeRef = useRef<number>(0);
  const lastEARRef = useRef<number>(1);

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

    // Detectar face
    const results = faceLandmarker.detectForVideo(video, Date.now());

    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];
      const currentEAR = calculateEAR(landmarks);

      // Detectar piscada (limiar 0.15)
      if (lastEARRef.current > 0.15 && currentEAR <= 0.15) {
        setBlinkCount((prev) => prev + 1);
      }

      lastEARRef.current = currentEAR;

      // Verificar tempo de scan
      if (scanStartTimeRef.current === 0) {
        scanStartTimeRef.current = Date.now();
      }

      const elapsedTime = (Date.now() - scanStartTimeRef.current) / 1000;
      if (elapsedTime >= 60) {
        const blinkRate = blinkCount / (elapsedTime / 60);
        onBlinkDetected(blinkRate);
        stopWebcam(); // Parar câmera ao finalizar
        onScanComplete();
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  // Controlar scan
  useEffect(() => {
    if (isScanning && faceLandmarker) {
      setBlinkCount(0);
      scanStartTimeRef.current = 0;
      lastEARRef.current = 1;
      processFrame();
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
          <p className="text-sm text-muted-foreground">
            Piscadas detectadas: <span className="font-bold text-primary">{blinkCount}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Olhe para a câmera e pisque naturalmente por 60 segundos
          </p>
        </div>
      )}
    </div>
  );
}