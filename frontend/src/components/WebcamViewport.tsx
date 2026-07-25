import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Eye, EyeOff, Sparkles, Check, RotateCcw, Crosshair, Hand } from 'lucide-react';
import type { AIFilter, PoseRecommendation } from '../types/photobooth';

interface WebcamViewportProps {
  activeFilter: AIFilter;
  activePose?: PoseRecommendation;
  onCapture: (capturedDataUrl: string) => void;
  isProcessingAI: boolean;
}

export const WebcamViewport: React.FC<WebcamViewportProps> = ({
  activeFilter,
  activePose,
  onCapture,
  isProcessingAI
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [showPoseReference, setShowPoseReference] = useState<boolean>(true);
  
  // Gesture & Motion Trigger States
  const [isGestureTriggerOn, setIsGestureTriggerOn] = useState<boolean>(false);
  const [gestureEnergy, setGestureEnergy] = useState<number>(0);
  const isCountingDownRef = useRef<boolean>(false);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Initialize Camera Stream once or when facingMode changes
  const initCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: facingMode
        },
        audio: false
      });

      setStream(mediaStream);
      setHasCameraAccess(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setHasCameraAccess(false);
    }
  }, [facingMode]);

  useEffect(() => {
    initCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Ensure videoRef stays connected whenever element is mounted
  useEffect(() => {
    if (videoRef.current && stream && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, capturedPreview]);

  const takePhotoSnapshot = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedPreview(dataUrl);
    }
  }, [facingMode]);

  const startCountdownAndCapture = useCallback(() => {
    if (isCountingDownRef.current || isProcessingAI) return;

    isCountingDownRef.current = true;
    setCapturedPreview(null);
    let count = 3;
    setCountdown(count);

    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(timer);
        setCountdown(null);
        takePhotoSnapshot();
        // Turn off gesture trigger upon photo capture to prevent auto-repeating loops
        setIsGestureTriggerOn(false);
        // Release countdown lock after 1.5 seconds cooldown
        setTimeout(() => {
          isCountingDownRef.current = false;
        }, 1500);
      }
    }, 1000);
  }, [isProcessingAI, takePhotoSnapshot]);

  // Calibrated High-Sensitivity Wave & Motion Gesture Detector
  useEffect(() => {
    if (!isGestureTriggerOn || capturedPreview || isCountingDownRef.current) {
      setGestureEnergy(0);
      return;
    }

    let prevPixels: Uint8ClampedArray | null = null;
    let energyVal = 0;
    let animFrame: number;

    const analyzeFrame = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && !isCountingDownRef.current && !capturedPreview) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 80;
        tempCanvas.height = 60;
        const ctx = tempCanvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(video, 0, 0, 80, 60);
          const currentPixels = ctx.getImageData(0, 0, 80, 60).data;

          if (prevPixels) {
            let diffSum = 0;
            for (let i = 0; i < currentPixels.length; i += 4) {
              const currentLum = currentPixels[i] * 0.299 + currentPixels[i + 1] * 0.587 + currentPixels[i + 2] * 0.114;
              const prevLum = prevPixels[i] * 0.299 + prevPixels[i + 1] * 0.587 + prevPixels[i + 2] * 0.114;
              diffSum += Math.abs(currentLum - prevLum);
            }

            const frameDelta = diffSum / (80 * 60);

            if (frameDelta > 1.2) {
              energyVal = Math.min(100, energyVal + frameDelta * 7);
            } else {
              energyVal = Math.max(0, energyVal * 0.85);
            }

            setGestureEnergy(Math.round(energyVal));

            if (energyVal >= 60 && !isCountingDownRef.current) {
              energyVal = 0;
              setGestureEnergy(0);
              startCountdownAndCapture();
            }
          }
          prevPixels = currentPixels;
        }
      }
      animFrame = requestAnimationFrame(analyzeFrame);
    };

    animFrame = requestAnimationFrame(analyzeFrame);
    return () => cancelAnimationFrame(animFrame);
  }, [isGestureTriggerOn, capturedPreview, startCountdownAndCapture]);

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleConfirmPhoto = () => {
    if (capturedPreview) {
      onCapture(capturedPreview);
      setCapturedPreview(null);
      isCountingDownRef.current = false;
    }
  };

  const handleRetakePhoto = () => {
    setCapturedPreview(null);
    isCountingDownRef.current = false;
  };

  return (
    <div className="relative w-full aspect-4/3 max-h-145 bg-[#090a0f] rounded-2xl overflow-hidden border border-[#2e3447] shadow-xl group font-mono">
      {/* Flash Screen */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-300 pointer-events-none" />
      )}

      {/* Hidden Snapshot Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Studio Viewfinder Corner Crosshairs */}
      <div className="absolute top-3 left-3 text-slate-600 font-mono text-[10px] z-20 pointer-events-none select-none">+ CORNER_TL</div>
      <div className="absolute top-3 right-3 text-slate-600 font-mono text-[10px] z-20 pointer-events-none select-none">+ CORNER_TR</div>
      <div className="absolute bottom-3 left-3 text-slate-600 font-mono text-[10px] z-20 pointer-events-none select-none">+ CORNER_BL</div>
      <div className="absolute bottom-3 right-3 text-slate-600 font-mono text-[10px] z-20 pointer-events-none select-none">+ CORNER_BR</div>

      {/* Picture-In-Picture Pose Reference Guide */}
      {showPoseReference && activePose && !capturedPreview && (
        <div className="absolute top-10 left-3 z-30 w-28 bg-[#090a0f]/90 border border-[#2e3447] rounded-lg p-1.5 shadow-xl">
          <div className="text-[9px] font-bold text-cyan-400 mb-1 flex items-center justify-between">
            <span>POSE REF</span>
            <button onClick={() => setShowPoseReference(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>
          <img src={activePose.visualUrl} alt={activePose.title} className="w-full h-24 object-cover rounded border border-[#1e2333]" />
          <p className="text-[9px] text-slate-300 truncate mt-1">{activePose.title}</p>
        </div>
      )}

      {/* Gesture Shutter Energy Meter Indicator Bar */}
      {isGestureTriggerOn && !capturedPreview && (
        <div className="absolute top-10 right-3 z-30 w-48 bg-black/90 border border-emerald-500/60 rounded p-2 shadow-lg">
          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 mb-1">
            <span className="flex items-center gap-1">
              <Hand className="w-3 h-3 animate-bounce" />
              WAVE HAND / MOVE
            </span>
            <span>{gestureEnergy}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded overflow-hidden border border-emerald-950">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-75"
              style={{ width: `${gestureEnergy}%` }}
            />
          </div>
          <p className="text-[8px] text-slate-400 mt-1">Wave hand in front of camera to trigger shutter!</p>
        </div>
      )}

      {/* Live Stream Video Element (PERMANENTLY MOUNTED IN DOM) */}
      <div className="relative w-full h-full flex items-center justify-center bg-[#090a0f]">
        {hasCameraAccess === false ? (
          <div className="p-8 text-center max-w-sm font-mono">
            <Camera className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-bold text-sm mb-1">CAMERA ACCESS REQUIRED</p>
            <p className="text-xs text-slate-500 mb-4">Please enable webcam permissions to enter the studio.</p>
            <button
              onClick={initCamera}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded"
            >
              RE-INITIALIZE WEBCAM
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            }`}
            style={{ filter: activeFilter.cssFilter }}
          />
        )}

        {/* Captured Photo Overlay */}
        {capturedPreview && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
            <img
              src={capturedPreview}
              alt="Captured Preview"
              className="w-full h-full object-cover"
              style={{ filter: activeFilter.cssFilter }}
            />
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/80 border border-[#2e3447] rounded text-xs text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>SHOT REVIEW MODE</span>
            </div>
          </div>
        )}

        {/* SVG Pose Silhouette Guide */}
        {showOverlay && activePose && hasCameraAccess && !capturedPreview && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <svg viewBox="0 0 400 300" className="w-full h-full opacity-60">
              <path
                d={activePose.svgOverlayPath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="5 5"
              />
            </svg>
            <div className="absolute bottom-16 px-3 py-1 bg-black/80 border border-cyan-500/40 rounded text-xs text-cyan-300 flex items-center gap-2">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>POSE GUIDE: <strong>{activePose.title}</strong></span>
            </div>
          </div>
        )}

        {/* Countdown Numbers Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <span className="text-8xl font-black text-cyan-400 tracking-tighter animate-pulse">
              0{countdown}
            </span>
          </div>
        )}
      </div>

      {/* Top Camera Action Bar */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
        {!capturedPreview && (
          <button
            onClick={() => setIsGestureTriggerOn(!isGestureTriggerOn)}
            className={`px-2.5 py-1 rounded border text-xs flex items-center gap-1.5 transition-colors ${
              isGestureTriggerOn
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 font-bold'
                : 'bg-black/70 border-[#2e3447] text-slate-400 hover:text-white'
            }`}
            title="Auto Wave & Gesture Shutter Trigger"
          >
            <Hand className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GESTURE SHUTTER</span>
          </button>
        )}
        {activePose && !capturedPreview && (
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`p-2 rounded bg-black/70 border text-xs transition-colors ${
              showOverlay
                ? 'border-cyan-500/60 text-cyan-400'
                : 'border-[#2e3447] text-slate-400 hover:text-white'
            }`}
            title="Toggle Silhouette Overlay"
          >
            {showOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        )}
        {!capturedPreview && (
          <button
            onClick={toggleCameraFacing}
            className="p-2 rounded bg-black/70 border border-[#2e3447] text-slate-400 hover:text-white text-xs transition-colors"
            title="Flip Camera Facing"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Bottom Shutter Controls Dock */}
      <div className="absolute bottom-4 inset-x-4 flex items-center justify-center z-30">
        {capturedPreview ? (
          <div className="flex items-center gap-3 bg-[#090a0f]/90 p-2 rounded-xl border border-[#2e3447] text-xs">
            <button
              onClick={handleRetakePhoto}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#181c28] hover:bg-[#222738] text-slate-300 font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RETAKE</span>
            </button>
            <button
              onClick={handleConfirmPhoto}
              className="flex items-center gap-2 px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>CONFIRM SHOT</span>
            </button>
          </div>
        ) : (
          <button
            onClick={startCountdownAndCapture}
            disabled={!hasCameraAccess || countdown !== null || isProcessingAI}
            className="relative px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            <span>CAPTURE SHOT</span>
          </button>
        )}
      </div>
    </div>
  );
};
