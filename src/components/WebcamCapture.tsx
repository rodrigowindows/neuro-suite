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
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
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
    if (!videoRef.current || !canvasRef.current || !faceLandmarker || !isScanning) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar vídeo
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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

      // Desenhar landmarks dos olhos
      ctx.fillStyle = '#4CAF8C';
      const eyeIndices = [33, 133, 362, 263];
      eyeIndices.forEach((idx) => {
        const point = landmarks[idx];
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Verificar tempo de scan
      if (scanStartTimeRef.current === 0) {
        scanStartTimeRef.current = Date.now();
      }

      const elapsedTime = (Date.now() - scanStartTimeRef.current) / 1000;
      if (elapsedTime >= 60) {
        const blinkRate = blinkCount / (elapsedTime / 60);
        onBlinkDetected(blinkRate);
        onScanComplete();
        return;
      }
    } else {
      // Nenhuma face detectada
      ctx.fillStyle = 'rgba(255, 87, 87, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FF5757';
      ctx.font = '24px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Posicione seu rosto na câmera', canvas.width / 2, canvas.height / 2);
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
      <div className="relative rounded-lg overflow-hidden shadow-medium">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="hidden"
        />
        <canvas
          ref={canvasRef}
          className="w-full h-auto bg-muted"
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