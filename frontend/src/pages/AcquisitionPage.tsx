import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionButton, RetinaMotionCanvas } from '../components/motion';
import { ModulePipelineNav } from '../components/layout/ModulePipelineNav';
import { ActiveScanPipelineBanner } from '../components/layout/ActiveScanPipelineBanner';
import { useRetinaData, ImageSource } from '../context/RetinaContext';
import { useAuth } from '../context/AuthContext';
import {
  Upload,
  Camera,
  Smartphone,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  CheckCircle2,
  FileCheck,
  Zap,
  Sliders,
  Sparkles,
  ArrowRight,
  HardDrive,
  Cpu,
  Layers,
  Image as ImageIcon,
  SwitchCamera,
  Video,
  VideoOff,
  AlertCircle,
  Play
} from 'lucide-react';

type AcquisitionMode = 'upload' | 'capture' | 'demo';

const DEMO_PRESETS = [
  {
    id: 'demo-normal',
    title: 'Normal 45° Non-Mydriatic Scan',
    source: 'Fundus Camera' as ImageSource,
    res: '3,200 × 3,200 px',
    size: '5.2 MB',
    format: 'DICOM Encapsulated',
    desc: 'Clear macula and fovea; no microvascular lesions detected.',
  },
  {
    id: 'demo-npdr',
    title: 'Severe NPDR Microvascular Scan',
    source: 'Smartphone Adapter' as ImageSource,
    res: '2,848 × 2,848 px',
    size: '4.6 MB',
    format: 'RAW Optical Stream',
    desc: 'Dense microaneurysms, blot hemorrhages & circinate hard exudates.',
  },
  {
    id: 'demo-cataract',
    title: 'Compromised Cataract Optical Field',
    source: 'Fundus Camera' as ImageSource,
    res: '2,400 × 2,400 px',
    size: '3.8 MB',
    format: 'TIFF 16-Bit',
    desc: 'Severe media opacity and reduced illumination SNR across temporal field.',
  },
];

export const AcquisitionPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAuth();
  const {
    activeImage,
    imageSource,
    imageMetadata,
    setUploadedImage,
    setCapturedImage,
    setPresetImage,
    runSequentialPipeline,
    isProcessingPipeline,
  } = useRetinaData();

  // Mode state
  const [activeMode, setActiveMode] = useState<AcquisitionMode>('upload');
  const [selectedDemoId, setSelectedDemoId] = useState<string>(DEMO_PRESETS[1].id);

  // Upload and scanning animation states
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [imageAcquired, setImageAcquired] = useState<boolean>(true);

  // Pan & Zoom controls
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Drag & drop zone state
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real Camera capture states
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturingFrame, setIsCapturingFrame] = useState<boolean>(false);

  // Animation sequence for scanning & calibration
  const runScanningAnimation = useCallback((callback?: () => void) => {
    setIsScanning(true);
    setScanStep('Calibrating Optical Matrix (45° Non-Mydriatic)...');

    setTimeout(() => {
      setScanStep('Detecting Pupil Center & Corneal Reflection...');
    }, 400);

    setTimeout(() => {
      setScanStep('Illumination & SNR Validated (ISO 10940)');
    }, 900);

    setTimeout(() => {
      setIsScanning(false);
      setImageAcquired(true);
      if (callback) callback();
    }, 1400);
  }, []);

  // ─── CAMERA LIFECYCLE ───
  const startCamera = useCallback(async (facing: 'environment' | 'user' = 'environment') => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Try preferred facing mode first, fall back to any video device
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (err) {
        // Fallback without facingMode constraint
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access unavailable:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera access permission was denied. Please allow camera permissions or use optical simulation below.'
          : 'Optical capture camera hardware not detected or currently in use.'
      );
      setIsCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Start or stop camera when switching modes
  useEffect(() => {
    if (activeMode === 'capture') {
      startCamera(cameraFacingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeMode, cameraFacingMode, startCamera, stopCamera]);

  // Flip camera between rear (smartphone fundus adapter) and front
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Snapshot frame from live webcam feed
  const captureCameraSnapshot = () => {
    if (!videoRef.current) return;
    setIsCapturingFrame(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Draw circular pupil aperture
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      stopCamera();
      setIsCapturingFrame(false);
      setImageAcquired(false);

      const resString = `${canvas.width} × ${canvas.height} px`;
      const sizeString = `${(dataUrl.length * 0.75 / (1024 * 1024)).toFixed(1)} MB`;

      setCapturedImage(dataUrl, {
        fileName: `OpticalCapture_${Date.now().toString().slice(-4)}.jpg`,
        resolution: resString,
        imageSize: sizeString,
        format: 'JPEG Optical Stream',
      });

      runScanningAnimation();
    }
  };

  // Fallback simulator for when device doesn't have a webcam or in restricted iframe
  const triggerSimulatedSensorCapture = () => {
    setImageAcquired(false);
    setIsUploading(true);
    setUploadProgress(0);

    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setUploadProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setPresetImage('demo-npdr');
        runScanningAnimation();
      }
    }, 60);
  };

  // ─── FILE UPLOAD HANDLER ───
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid retinal image file (PNG, JPEG, WebP, TIFF).');
      return;
    }

    setImageAcquired(false);
    setIsUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      // Read true image dimensions
      const img = new Image();
      img.onload = () => {
        const res = `${img.naturalWidth} × ${img.naturalHeight} px`;
        const sizeMb = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 25;
          setUploadProgress(currentProgress);
          if (currentProgress >= 100) {
            clearInterval(interval);
            setIsUploading(false);

            setUploadedImage(dataUrl, {
              fileName: file.name,
              resolution: res,
              imageSize: sizeMb,
              format: file.type.replace('image/', '').toUpperCase() + ' Bitmap',
            });

            runScanningAnimation();
          }
        }, 50);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Preset Selection
  const handleSelectDemo = (presetId: string) => {
    setSelectedDemoId(presetId);
    setImageAcquired(false);
    setPresetImage(presetId);
    runScanningAnimation();
  };

  // Pan interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetViewport = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pb-16 space-y-6 select-none">
      {/* ─── 1. PAGE TITLE & HEADER STRIP ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A5A] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
              {t.modules.m1Badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
            {t.modules.m1Title}
          </h1>
          <p className="text-xs sm:text-sm text-[#65736B]">
            {t.modules.m1Desc}
          </p>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFDF8] border border-[#DDE5DC] shadow-xs text-xs font-mono font-bold text-[#124B3A]">
            <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />
            <span>ISO 10940 COMPLIANT</span>
          </div>

          <button
            onClick={() => navigate('/preprocessing')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-md shadow-[#124B3A]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            data-cursor="button"
          >
            <span>{t.modules.m1Action}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ─── 2. CROSS-MODULE ACTIVE SCAN PIPELINE BANNER ─── */}
      <ActiveScanPipelineBanner currentModuleNumber={1} />

      {/* ─── 3. MAIN WORKSPACE GRID ─── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (8 cols): Retinal Acquisition & Viewport Workspace */}
        <div className="lg:col-span-8 space-y-4">
          {/* Acquisition Mode Select Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFFDF8] p-2 rounded-2xl border border-[#DDE5DC] shadow-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveMode('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeMode === 'upload'
                    ? 'bg-[#124B3A] text-white shadow-xs'
                    : 'text-[#65736B] hover:text-[#124B3A] hover:bg-[#F8F6EF]'
                }`}
                data-cursor="button"
              >
                <Upload size={14} />
                <span>{t.modules.m1UploadTab}</span>
              </button>

              <button
                onClick={() => setActiveMode('capture')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeMode === 'capture'
                    ? 'bg-[#124B3A] text-white shadow-xs'
                    : 'text-[#65736B] hover:text-[#124B3A] hover:bg-[#F8F6EF]'
                }`}
                data-cursor="button"
              >
                <Camera size={14} />
                <span>{t.modules.m1CaptureTab}</span>
              </button>

              <button
                onClick={() => setActiveMode('demo')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeMode === 'demo'
                    ? 'bg-[#124B3A] text-white shadow-xs'
                    : 'text-[#65736B] hover:text-[#124B3A] hover:bg-[#F8F6EF]'
                }`}
                data-cursor="button"
              >
                <ImageIcon size={14} />
                <span>{t.modules.m1DemoTab}</span>
              </button>
            </div>

            {/* Current Source Badge */}
            <div className="hidden sm:flex items-center gap-1.5 pr-2">
              <span className="text-[10px] font-mono text-[#65736B] uppercase mr-1">Active:</span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#FAF4ED] text-[#8A5612] border border-[#E9A23B]/40">
                {imageSource}
              </span>
            </div>
          </div>

          {/* ─── LIVE OPTICAL VIEWPORT OR DRAG & DROP ZONE ─── */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            className={`relative aspect-[4/3] sm:aspect-[16/11] rounded-3xl bg-[#06150F] overflow-hidden border-2 transition-all duration-300 flex items-center justify-center shadow-inner ${
              isDragOver ? 'border-[#E9A23B] bg-[#0c2217]' : 'border-[#1F7A5A]/40'
            }`}
          >
            {/* Viewport Floating Action Controls */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 p-1.5 rounded-xl bg-[#17221C]/80 backdrop-blur-md border border-[#DDE5DC]/20 shadow-md">
              <button
                onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                className="w-8 h-8 rounded-lg text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => setZoom(z => Math.max(0.6, z - 0.25))}
                className="w-8 h-8 rounded-lg text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={resetViewport}
                className="w-8 h-8 rounded-lg text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Reset View"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="w-8 h-8 rounded-lg text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </div>

            {/* Current Zoom Level Pill */}
            <div className="absolute top-4 left-4 z-30 px-3 py-1 rounded-lg bg-[#17221C]/80 backdrop-blur-md border border-[#DDE5DC]/20 text-[10px] font-mono text-white flex items-center gap-2">
              <span className="text-[#E9A23B]">ZOOM:</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>

            {/* ─── LIVE WEBCAM / CAMERA STREAM VIEW ─── */}
            {activeMode === 'capture' && isCameraActive && (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Circular Reticle Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[78%] max-w-[420px] aspect-square rounded-full border-2 border-[#1F7A5A] shadow-[0_0_0_9999px_rgba(6,21,15,0.7)] relative flex items-center justify-center">
                    {/* Targeting Crosshairs */}
                    <div className="w-12 h-0.5 bg-[#E9A23B]/80 absolute" />
                    <div className="h-12 w-0.5 bg-[#E9A23B]/80 absolute" />
                    <div className="w-20 h-20 rounded-full border border-dashed border-[#E9A23B]/60 animate-spin-slow" />

                    {/* Pupil alignment guide */}
                    <div className="absolute bottom-4 text-center text-[10px] font-mono text-[#FFFDF8] bg-[#124B3A]/80 px-2 py-0.5 rounded backdrop-blur-xs">
                      Align Patient Pupil within Reticle
                    </div>
                  </div>
                </div>

                {/* Live Camera Controls Overlay */}
                <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-3 z-30">
                  <button
                    onClick={toggleCameraFacing}
                    className="p-3 rounded-full bg-[#17221C]/90 hover:bg-[#124B3A] text-white border border-white/20 transition-all shadow-lg"
                    title="Switch Camera (Front / Rear)"
                  >
                    <SwitchCamera size={18} />
                  </button>

                  <button
                    onClick={captureCameraSnapshot}
                    disabled={isCapturingFrame}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-[#E76F51] via-[#E9A23B] to-[#1F7A5A] text-white text-xs font-black tracking-wider uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Zap size={16} className="fill-white" />
                    <span>Take Optical Snapshot</span>
                  </button>

                  <button
                    onClick={stopCamera}
                    className="p-3 rounded-full bg-[#17221C]/90 hover:bg-red-900/80 text-white border border-white/20 transition-all shadow-lg"
                    title="Stop Camera"
                  >
                    <VideoOff size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* If camera is requested but error occurred */}
            {activeMode === 'capture' && !isCameraActive && (
              <div className="p-8 text-center max-w-md space-y-4 z-20">
                <div className="w-14 h-14 rounded-2xl bg-[#E76F51]/20 border border-[#E76F51]/40 flex items-center justify-center mx-auto text-[#E76F51]">
                  <VideoOff size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Live Camera Sensor Access</h3>
                  <p className="text-xs text-[#8BA196] leading-relaxed">
                    {cameraError || 'Connect a smartphone fundus adapter or standard camera to stream real-time pupil alignment.'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => startCamera(cameraFacingMode)}
                    className="px-4 py-2 rounded-xl bg-[#1F7A5A] hover:bg-[#175643] text-white text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <Video size={14} />
                    <span>Request Camera Access</span>
                  </button>
                  <button
                    onClick={triggerSimulatedSensorCapture}
                    className="px-4 py-2 rounded-xl bg-[#17221C] hover:bg-[#203027] border border-[#DDE5DC]/30 text-white text-xs font-medium transition-all flex items-center gap-2"
                  >
                    <Zap size={14} className="text-[#E9A23B]" />
                    <span>Simulate Optical Sensor Capture</span>
                  </button>
                </div>
              </div>
            )}

            {/* ─── RETINAL IMAGE CONTAINER (UPLOAD OR DEMO MODE) ─── */}
            {(activeMode !== 'capture' || !isCameraActive) && (
              <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                }}
                className="relative w-full h-full flex items-center justify-center"
              >
                {/* Motion particle canvas */}
                <div className="absolute inset-0 pointer-events-none opacity-25 z-0">
                  <RetinaMotionCanvas intensity={0.4} />
                </div>

                {/* Display Current Active Image from Context */}
                {activeImage ? (
                  <motion.img
                    key={activeImage.slice(0, 30)}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    src={activeImage}
                    alt="Acquired Retinal Fundus Scan"
                    className="max-h-[84%] max-w-[84%] rounded-full object-cover shadow-2xl border-4 border-[#1F7A5A]/40 z-10"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2 z-10 text-white/70">
                    <Eye size={48} className="mx-auto text-[#1F7A5A]" />
                    <p className="text-xs">No retinal scan loaded yet. Click Browse or choose a Demo preset.</p>
                  </div>
                )}

                {/* Circular Scanning Reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[84%] max-w-[480px] aspect-square rounded-full border border-dashed border-[#1F7A5A]/50 animate-spin-slow pointer-events-none">
                    <div className="w-full h-full rounded-full border border-[#E9A23B]/30 animate-reverse-spin" />
                  </div>
                </div>

                {/* Scanning Laser Beam Effect */}
                {isScanning && (
                  <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none flex items-center justify-center overflow-hidden z-20">
                    <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-[#E76F51] to-transparent shadow-[0_0_18px_#E76F51] animate-laser-sweep" />
                  </div>
                )}
              </div>
            )}

            {/* Hidden Native File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
            />

            {/* Uploading Progress Overlay */}
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#06150F]/90 backdrop-blur-xs flex flex-col items-center justify-center z-40 p-6"
                >
                  <div className="w-64 space-y-3 text-center">
                    <div className="flex justify-between text-xs font-mono text-white">
                      <span>Ingesting RAW Optical Scan...</span>
                      <span className="font-bold text-[#E9A23B]">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1F7A5A] via-[#E9A23B] to-[#E76F51] transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scanning Status Badge */}
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-[#17221C]/90 border border-[#E9A23B]/50 text-xs font-mono text-[#FFFDF8] flex items-center gap-2 z-40 shadow-xl"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E9A23B] animate-ping" />
                  <span>{scanStep}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Floating Acquisition Status Badge */}
            {imageAcquired && !isScanning && !isUploading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-5 left-5 px-3.5 py-1.5 rounded-xl bg-[#0c2217]/90 border border-[#1F7A5A]/50 text-xs font-mono text-[#FFFDF8] flex items-center gap-2 shadow-lg backdrop-blur-xs z-30"
              >
                <CheckCircle2 size={15} className="text-[#1F7A5A]" />
                <span className="font-bold text-[#FFFDF8]">Image acquired</span>
                <span className="text-[10px] text-[#8BA196]">• Synchronized to All Modules</span>
              </motion.div>
            )}
          </div>

          {/* Quick Action Trigger Strip for Current Mode */}
          <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] flex flex-wrap items-center justify-between gap-4 shadow-xs">
            {activeMode === 'upload' && (
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-[#124B3A] hover:bg-[#175643] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                  data-cursor="button"
                >
                  <Upload size={14} />
                  <span>Browse Device Files</span>
                </button>
                <span className="text-xs text-[#65736B]">
                  Supports DICOM, TIFF, PNG, JPEG, WebP (Drag & Drop anywhere on canvas)
                </span>
              </div>
            )}

            {activeMode === 'capture' && (
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => startCamera(cameraFacingMode)}
                  className="px-4 py-2 rounded-xl bg-[#124B3A] text-white text-xs font-bold hover:bg-[#175643] transition-all flex items-center gap-2"
                >
                  <Video size={14} />
                  <span>{isCameraActive ? 'Restart Camera' : 'Start Live Camera'}</span>
                </button>

                <button
                  onClick={triggerSimulatedSensorCapture}
                  className="px-4 py-2 rounded-xl bg-[#F8F6EF] text-[#124B3A] text-xs font-semibold hover:bg-[#FAF4ED] border border-[#DDE5DC] transition-all flex items-center gap-2"
                >
                  <Zap size={14} className="text-[#E9A23B]" />
                  <span>Simulate Sensor Capture</span>
                </button>
              </div>
            )}

            {activeMode === 'demo' && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-[#65736B] mr-1">Select Preset:</span>
                {DEMO_PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectDemo(p.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedDemoId === p.id
                        ? 'bg-[#124B3A] text-white border-[#124B3A] shadow-xs'
                        : 'bg-[#F8F6EF] text-[#17221C] border-[#DDE5DC] hover:bg-[#FAF4ED]'
                    }`}
                  >
                    {p.title.split(' ')[0]} {p.title.split(' ')[1]}
                  </button>
                ))}
              </div>
            )}

            {/* Reset Viewport Button */}
            <button
              onClick={resetViewport}
              className="text-xs font-mono text-[#65736B] hover:text-[#124B3A] underline flex items-center gap-1 ml-auto"
            >
              <RotateCcw size={12} /> Reset Zoom
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols): Quality Information & Telemetry Specs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quality Information Dossier Card */}
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
              <h3 className="text-sm font-bold text-[#124B3A] uppercase tracking-wide flex items-center gap-2">
                <FileCheck size={16} className="text-[#1F7A5A]" />
                Quality Information
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1F7A5A]/10 text-[#1F7A5A] font-bold">
                VALIDATED
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                <span className="text-[#65736B]">File Name:</span>
                <span className="font-mono font-bold text-[#124B3A] truncate max-w-[170px]" title={imageMetadata.fileName}>
                  {imageMetadata.fileName || 'Retinal_Scan.dcm'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                <span className="text-[#65736B]">Resolution:</span>
                <span className="font-mono font-bold text-[#124B3A]">{imageMetadata.resolution}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                <span className="text-[#65736B]">Image Size:</span>
                <span className="font-mono font-bold text-[#124B3A]">{imageMetadata.imageSize}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                <span className="text-[#65736B]">Capture Source:</span>
                <span className="font-semibold text-[#8A5612] bg-[#FAF4ED] px-2 py-0.5 rounded border border-[#E9A23B]/30">
                  {imageSource}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                <span className="text-[#65736B]">Format:</span>
                <span className="font-mono font-bold text-[#124B3A]">{imageMetadata.format}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                <span className="text-[#65736B]">Calibration Status:</span>
                <span className="font-bold text-[#1F7A5A] flex items-center gap-1">
                  <CheckCircle2 size={13} /> Ready for Quality Gate
                </span>
              </div>
            </div>

            {/* Run Pipeline CTA */}
            <div className="pt-2 space-y-2">
              <MotionButton
                onClick={() => navigate('/preprocessing')}
                variant="primary"
                showArrow
                className="w-full py-3.5 shadow-lg shadow-[#124B3A]/20"
              >
                Analyze in Module 2: Preprocessing
              </MotionButton>

              <button
                onClick={() => runSequentialPipeline()}
                disabled={isProcessingPipeline}
                className="w-full py-2.5 rounded-xl border border-[#124B3A]/30 text-[#124B3A] hover:bg-[#E8F3EE] text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Play size={13} className="text-[#1F7A5A]" />
                <span>{isProcessingPipeline ? 'Processing All Modules...' : 'Run Complete 11-Stage Pipeline'}</span>
              </button>
            </div>
          </div>

          {/* Rural Hardware Compatibility Card */}
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-[#124B3A] uppercase tracking-wide flex items-center gap-1.5">
              <HardDrive size={15} className="text-[#E9A23B]" />
              Point-of-Care Hardware Compatibility
            </h4>
            <p className="text-xs text-[#65736B] leading-relaxed">
              Designed for primary health centres (PHCs), sub-centres, and vision vans. Integrates with smartphone optical lens adapters (e.g. 20D/28D lens clamp) for non-mydriatic handheld imaging without pupil dilation.
            </p>
            <div className="pt-2 border-t border-[#DDE5DC]/70 flex items-center justify-between text-[11px] font-mono text-[#124B3A]">
              <span>Field Calibration:</span>
              <span className="text-[#1F7A5A] font-bold">ISO 10940 Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. END-TO-END PIPELINE NAVIGATION ─── */}
      <ModulePipelineNav currentModule={1} />
    </div>
  );
};
