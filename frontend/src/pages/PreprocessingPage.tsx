import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ModulePipelineNav } from '../components/layout/ModulePipelineNav';
import { ActiveScanPipelineBanner } from '../components/layout/ActiveScanPipelineBanner';
import { useRetinaData } from '../context/RetinaContext';
import { useAuth } from '../context/AuthContext';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Sparkles,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Eye,
  RefreshCw,
  Info,
  ChevronRight,
  Sun
} from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  desc: string;
  gradableVal: string;
  warningVal: string;
  state: 'completed' | 'processing' | 'pending';
}

export const PreprocessingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAuth();
  const { activeImage, pipelineResults } = useRetinaData();

  // Mode: 'gradable' or 'warning'
  const [qualityMode, setQualityMode] = useState<'gradable' | 'warning'>('gradable');
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100%
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(5); // all completed
  const [retakeModalOpen, setRetakeModalOpen] = useState<boolean>(false);

  const isGradable = qualityMode === 'gradable';
  const targetScore = isGradable ? pipelineResults.preprocessing.overallQualityScore : 38;

  // Pipeline stages required by prompt
  const [stages, setStages] = useState<PipelineStage[]>([
    {
      id: 'stage-1',
      name: 'Noise Removal',
      desc: '2D Bilateral Filter (Gaussian σ=1.8)',
      gradableVal: 'Suppressed (-14 dB)',
      warningVal: 'Noise High (8.2 dB)',
      state: 'completed',
    },
    {
      id: 'stage-2',
      name: 'Blur Detection',
      desc: 'Sobel Tenengrad Focus Gradient Measure',
      gradableVal: 'Score: 184 (Sharp Focus)',
      warningVal: 'Score: 42 (Motion Blur)',
      state: 'completed',
    },
    {
      id: 'stage-3',
      name: 'Artifact Detection',
      desc: 'Corneal Glare, Specular Reflection & Eyelash Masking',
      gradableVal: '< 0.4% FOV Impact',
      warningVal: '24.8% FOV Obstructed',
      state: 'completed',
    },
    {
      id: 'stage-4',
      name: 'Illumination Normalization',
      desc: 'Surface Spline Background Flattening & Vignette Correction',
      gradableVal: 'Gradient Flattened',
      warningVal: 'Vignetting Severe',
      state: 'completed',
    },
    {
      id: 'stage-5',
      name: 'Contrast Enhancement',
      desc: 'Dynamic Range Stretching [0–255] on Green Channel',
      gradableVal: 'Dynamic Range: 98%',
      warningVal: 'Dynamic Range: 41%',
      state: 'completed',
    },
    {
      id: 'stage-6',
      name: 'CLAHE',
      desc: 'Contrast-Limited Adaptive Histogram Equalization',
      gradableVal: 'ClipLimit=2.4 (Active)',
      warningVal: 'Contrast Fail (Unresolved)',
      state: 'completed',
    },
  ]);

  // Sequential stage simulation whenever pipeline is re-run or mode changes
  const runSequentialStages = () => {
    setIsScanning(true);
    setActiveStageIdx(0);
    setAnimatedScore(0);

    stages.forEach((_, idx) => {
      setTimeout(() => {
        setActiveStageIdx(idx);
        setStages(prev =>
          prev.map((s, i) => {
            if (i < idx) return { ...s, state: 'completed' };
            if (i === idx) return { ...s, state: 'processing' };
            return { ...s, state: 'pending' };
          })
        );
      }, idx * 280);
    });

    setTimeout(() => {
      setActiveStageIdx(6);
      setStages(prev => prev.map(s => ({ ...s, state: 'completed' })));
      setIsScanning(false);

      // Score count animation
      let current = 0;
      const step = targetScore / 25;
      const interval = setInterval(() => {
        current += step;
        if (current >= targetScore) {
          setAnimatedScore(targetScore);
          clearInterval(interval);
        } else {
          setAnimatedScore(Math.round(current));
        }
      }, 20);
    }, 6 * 280 + 100);
  };

  useEffect(() => {
    runSequentialStages();
  }, [qualityMode]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pb-16 space-y-8 select-none">
      {/* ─── 1. HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A5A] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
              {t.modules.m2Badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
            {t.modules.m2Title}
          </h1>
          <p className="text-xs sm:text-sm text-[#65736B]">
            {t.modules.m2Desc}
          </p>
        </div>

        {/* Quality Mode Switcher & Re-run */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-xs">
            <button
              onClick={() => setQualityMode('gradable')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isGradable
                  ? 'bg-[#124B3A] text-white shadow-xs'
                  : 'text-[#65736B] hover:text-[#124B3A]'
              }`}
              data-cursor="button"
            >
              High Quality (94%)
            </button>
            <button
              onClick={() => setQualityMode('warning')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isGradable
                  ? 'bg-[#E76F51] text-white shadow-xs'
                  : 'text-[#65736B] hover:text-[#E76F51]'
              }`}
              data-cursor="button"
            >
              Low Quality Warning (38%)
            </button>
          </div>

          <button
            onClick={() => navigate('/anatomy')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-md shadow-[#124B3A]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            data-cursor="button"
          >
            <span>{t.modules.m2Action}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Active Scan Pipeline Banner */}
      <ActiveScanPipelineBanner currentModuleNumber={2} />

      {/* ─── 2. ARCHITECTURAL FLOW STRIP ─── */}
      <div className="flex items-center justify-center gap-3 text-xs font-mono font-bold text-[#65736B] py-2 px-4 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-2xs">
        <span className="text-[#124B3A] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#124B3A]" /> ORIGINAL RAW SCAN
        </span>
        <span className="text-[#E9A23B]">➔</span>
        <span className="text-[#E9A23B] flex items-center gap-1.5">
          <Zap size={13} className="text-[#E9A23B]" /> 2D BILATERAL & CLAHE ENGINE
        </span>
        <span className="text-[#1F7A5A]">➔</span>
        <span className="text-[#1F7A5A] flex items-center gap-1.5">
          <Sparkles size={13} className="text-[#1F7A5A]" /> NORMALIZED RETINAL FIELD
        </span>
      </div>

      {/* ─── 3. MAIN WORKSPACE GRID ─── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Large Before/After Retinal Viewer with Draggable Split Slider (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-[#124B3A]" />
              <h2 className="text-sm font-bold text-[#124B3A] uppercase tracking-wide">
                Interactive Before / After Optical Split Viewer
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#F8F6EF] text-[#124B3A] border border-[#DDE5DC]">
              Split: {sliderPos}%
            </span>
          </div>

          {/* Interactive Split Viewport */}
          <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl bg-[#08170F] overflow-hidden border-2 border-[#1F7A5A]/30 shadow-inner flex items-center justify-center">
            {/* Viewport displaying the actual activeImage */}
            <div className="relative w-[84%] h-[84%] max-w-[460px] aspect-square rounded-full overflow-hidden shadow-2xl bg-[#08170F]">
              {/* 1. ORIGINAL IMAGE (Left Side of Split) */}
              {activeImage ? (
                <img
                  src={activeImage}
                  alt="Original Retinal Input"
                  className="absolute inset-0 w-full h-full object-cover filter contrast-[0.9] brightness-[0.92]"
                />
              ) : (
                <div className="w-full h-full bg-[#180503]" />
              )}

              {/* Simulated Optical Noise & Vignetting if low quality */}
              {!isGradable && (
                <div className="absolute inset-0 bg-[#b08552]/40 backdrop-blur-[6px] pointer-events-none" />
              )}

              {/* 2. ENHANCED IMAGE (Right Side of Split, Clipped Dynamically) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
              >
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt="CLAHE & Contrast Enhanced Retinal Scan"
                    className="w-full h-full object-cover filter contrast-[1.4] saturate-[1.3] brightness-[1.08] hue-rotate-[-4deg]"
                  />
                ) : (
                  <div className="w-full h-full bg-[#4a170e]" />
                )}

                {/* Microvascular Boost Glow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1F7A5A]/15 via-transparent to-[#E9A23B]/10 mix-blend-overlay pointer-events-none" />
              </div>
            </div>

              {/* Vertical Divider Line with handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-[#FFFDF8] shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#124B3A] border-2 border-[#FFFDF8] text-white flex items-center justify-center shadow-lg text-[10px] font-bold">
                  ↔
                </div>
              </div>

              {/* Orbiting Circular Scanner Ring */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-dashed border-[#1F7A5A]/50 animate-spin-slow pointer-events-none" />
              </div>

              {/* Laser Scanning Line Sweep (When active) */}
              {isScanning && (
                <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none flex items-center justify-center overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#E9A23B] to-transparent shadow-[0_0_15px_#E9A23B] animate-laser-sweep" />
                </div>
              )}

              {/* Corner Labels: Original vs Enhanced */}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/60 text-white font-mono text-[10px] backdrop-blur-xs">
                ORIGINAL (RAW)
              </div>
              <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-[#124B3A]/90 text-white font-mono text-[10px] backdrop-blur-xs">
                ENHANCED (CLAHE)
              </div>
            </div>

          {/* Draggable Split Slider Control */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-[#65736B]">
              <span>◀ Show More Original</span>
              <span className="font-mono font-bold text-[#124B3A]">Drag to Compare</span>
              <span>Show More Enhanced ▶</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="w-full accent-[#1F7A5A] cursor-ew-resize"
              data-cursor="button"
            />
          </div>
        </div>

        {/* RIGHT: Quality Score Card & Animated Sequential Stages (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quality Score Hero Card */}
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
              <span className="text-xs font-mono font-bold text-[#65736B] uppercase tracking-wider">
                QUALITY SCORE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF4ED] text-[#8A5612] font-bold border border-[#E9A23B]/30">
                SIMULATED ASSESSMENT
              </span>
            </div>

            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="text-xs font-bold text-[#65736B] uppercase tracking-wider mb-1">
                  IMAGE QUALITY
                </div>
                <div
                  className="text-5xl font-black font-mono tracking-tight"
                  style={{ color: isGradable ? '#1F7A5A' : '#E76F51' }}
                >
                  {animatedScore}%
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-block text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                      isGradable
                        ? 'bg-[#1F7A5A]/10 text-[#1F7A5A] border-[#1F7A5A]/30'
                        : 'bg-[#E76F51]/10 text-[#E76F51] border-[#E76F51]/30'
                    }`}
                  >
                    {isGradable ? 'GRADABLE (LEVEL A)' : 'NON-GRADABLE (REJECT)'}
                  </span>
                </div>
              </div>

              {/* Circular Gauge Graphic */}
              <div className="w-24 h-24 relative flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#F8F6EF]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    strokeWidth="3.5"
                    strokeDasharray={`${animatedScore}, 100`}
                    strokeLinecap="round"
                    stroke={isGradable ? '#1F7A5A' : '#E76F51'}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center font-mono font-bold text-xs" style={{ color: isGradable ? '#1F7A5A' : '#E76F51' }}>
                  {animatedScore}%
                </div>
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              <div className="p-2.5 rounded-xl bg-[#F8F6EF]">
                <span className="text-[10px] text-[#65736B] block">GRADABILITY</span>
                <span className="font-bold text-[#124B3A]">{isGradable ? 'High (Level A)' : 'Failed (< 0.72)'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F6EF]">
                <span className="text-[10px] text-[#65736B] block">BRIGHTNESS</span>
                <span className="font-bold text-[#124B3A]">{isGradable ? 'Optimal (2.8 SNR)' : 'Dim / Vignetted'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F6EF]">
                <span className="text-[10px] text-[#65736B] block">SHARPNESS</span>
                <span className="font-bold text-[#124B3A]">{isGradable ? '184 (Tenengrad)' : '42 (Severe Blur)'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F6EF]">
                <span className="text-[10px] text-[#65736B] block">ARTIFACTS</span>
                <span className="font-bold text-[#124B3A]">{isGradable ? '< 0.4% FOV' : '24.8% Glare'}</span>
              </div>
            </div>
          </div>

          {/* ─── WARNING STATE INTERACTIVE EXAMPLE ─── */}
          {!isGradable && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-3xl bg-[#FDF0EC] border-2 border-[#F48C71] space-y-3"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-[#E76F51]" />
                <h4 className="font-bold text-xs text-[#9A3B24] uppercase tracking-wide">
                  Image quality may affect analysis.
                </h4>
              </div>
              <p className="text-xs text-[#65736B] leading-relaxed">
                Dense cataract opacity and camera motion blur exceed acceptable diagnostic tolerance (Score 38% &lt; 72% minimum threshold).
              </p>
              <button
                onClick={() => setRetakeModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-[#E76F51] hover:bg-[#c9583d] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                data-cursor="button"
              >
                <RefreshCw size={14} />
                <span>Request Retake</span>
              </button>
            </motion.div>
          )}

          {/* ─── 4. SEQUENTIAL PROCESSING PIPELINE STAGES ─── */}
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[#124B3A]" />
                <h3 className="text-sm font-bold text-[#124B3A] uppercase tracking-wide">
                  Sequential Processing Engine
                </h3>
              </div>
              <button
                onClick={runSequentialStages}
                className="text-xs font-mono text-[#1F7A5A] hover:underline flex items-center gap-1"
              >
                <RefreshCw size={12} /> Re-run
              </button>
            </div>

            <div className="space-y-2.5">
              {stages.map((stage) => {
                const isCompleted = stage.state === 'completed';
                const isProcessing = stage.state === 'processing';
                const isPending = stage.state === 'pending';

                return (
                  <div
                    key={stage.id}
                    className={`p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      isProcessing
                        ? 'bg-[#FAF4ED] border-[#E9A23B] shadow-xs'
                        : isCompleted
                        ? 'bg-[#FFFDF8] border-[#DDE5DC]'
                        : 'bg-[#F8F6EF]/60 border-[#DDE5DC]/40 opacity-60'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-[#124B3A] flex items-center gap-2">
                        <span>{stage.name}</span>
                        <span className="text-[10px] font-mono text-[#65736B] font-normal">
                          ({stage.desc.split('(')[0]})
                        </span>
                      </div>
                      <div className="text-[11px] font-mono" style={{ color: isGradable ? '#1F7A5A' : '#E76F51' }}>
                        {isGradable ? stage.gradableVal : stage.warningVal}
                      </div>
                    </div>

                    {/* Stage Status Icon Badge */}
                    <div className="flex-shrink-0 font-mono text-xs font-bold">
                      {isCompleted && (
                        <span className="text-[#1F7A5A] flex items-center gap-1">
                          ✓ Completed
                        </span>
                      )}
                      {isProcessing && (
                        <span className="text-[#E9A23B] flex items-center gap-1 animate-pulse">
                          ● Processing
                        </span>
                      )}
                      {isPending && (
                        <span className="text-[#65736B] flex items-center gap-1">
                          ○ Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── END-TO-END PIPELINE NAVIGATION ─── */}
      <ModulePipelineNav currentModule={2} />

      {/* ─── RETAKE INSTRUCTIONS MODAL (FOR ASHA HEALTH WORKERS) ─── */}
      <AnimatePresence>
        {retakeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-2 text-[#E76F51]">
                <AlertTriangle size={20} />
                <h3 className="font-bold text-base text-[#124B3A]">ASHA Field Retake Protocol</h3>
              </div>

              <div className="text-xs text-[#65736B] space-y-2 leading-relaxed">
                <p>The current scan cannot be safely graded by the AI model. To prevent a false negative, follow these instructions:</p>
                <div className="p-3.5 rounded-xl bg-[#F8F6EF] space-y-1.5 font-medium text-[#124B3A]">
                  <div>1. Darken room to allow natural physiological pupil dilation.</div>
                  <div>2. Instruct patient to fixate steadily on the internal camera target.</div>
                  <div>3. Clean front optical lens with microfiber cloth.</div>
                  <div>4. If cataract is dense, refer patient for cataract surgical evaluation.</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setRetakeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#124B3A] text-white text-xs font-bold"
                  data-cursor="button"
                >
                  Understood — Return to Workflow
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
