import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ModulePipelineNav } from '../components/layout/ModulePipelineNav';
import { ActiveScanPipelineBanner } from '../components/layout/ActiveScanPipelineBanner';
import { useRetinaData } from '../context/RetinaContext';
import { useAuth } from '../context/AuthContext';
import {
  BrainCircuit,
  Activity,
  Layers,
  Network,
  Crosshair,
  Eye,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Cpu,
  BarChart3,
  GitCommit,
  Check,
  HelpCircle
} from 'lucide-react';

interface DRGradeConfig {
  grade: number;
  code: string;
  name: string;
  confidence: number;
  probDistribution: [number, number, number, number, number];
  urgency: 'Low Risk' | 'Moderate Risk' | 'Sight-Threatening' | 'Ophthalmic Emergency';
  evidenceSummary: string;
  etdrsRule: string;
  followUp: string;
  color: string;
}

const DR_GRADES: DRGradeConfig[] = [
  {
    grade: 0,
    code: 'ICDR-0',
    name: 'No Apparent DR',
    confidence: 98.6,
    probDistribution: [0.986, 0.010, 0.003, 0.001, 0.000],
    urgency: 'Low Risk',
    evidenceSummary: 'Clear vascular arcades. Zero microaneurysms, hemorrhages or exudates detected across all 4 quadrants.',
    etdrsRule: 'ICDR Normal Baseline • Negative for diabetic retinopathy microvascular lesions.',
    followUp: 'Annual routine screening (12 months) at rural primary health center.',
    color: '#1F7A5A',
  },
  {
    grade: 1,
    code: 'ICDR-1',
    name: 'Mild NPDR',
    confidence: 94.2,
    probDistribution: [0.035, 0.942, 0.018, 0.004, 0.001],
    urgency: 'Low Risk',
    evidenceSummary: 'Microaneurysms only. 2 isolated capillary outpouchings in temporal periphery (>2,500μm from FAZ).',
    etdrsRule: 'Microaneurysms present without hard exudates, venous beading or intraretinal hemorrhages.',
    followUp: 'Repeat fundus examination in 6–9 months. Glycemic & BP optimization.',
    color: '#1F7A5A',
  },
  {
    grade: 2,
    code: 'ICDR-2',
    name: 'Moderate NPDR',
    confidence: 93.8,
    probDistribution: [0.012, 0.038, 0.938, 0.010, 0.002],
    urgency: 'Moderate Risk',
    evidenceSummary: '8 Microaneurysms + 4 dot hemorrhages in 2 quadrants. Hard exudates >1,500μm from foveal center.',
    etdrsRule: 'More than microaneurysms alone, but less than Severe NPDR (does not meet 4-2-1 criteria).',
    followUp: 'Ophthalmologist consultation within 8–12 weeks. Optical Coherence Tomography (OCT) recommended.',
    color: '#E9A23B',
  },
  {
    grade: 3,
    code: 'ICDR-3',
    name: 'Severe NPDR',
    confidence: 96.4,
    probDistribution: [0.002, 0.008, 0.021, 0.964, 0.005],
    urgency: 'Sight-Threatening',
    evidenceSummary: '26 Verified Lesion Markers. Dense circinate hard exudates at 420μm to FAZ + blot hemorrhages in 2 quadrants.',
    etdrsRule: 'Meets ETDRS 4-2-1 criteria (Hemorrhages in >2 quadrants & Macular Hard Exudate threat).',
    followUp: 'Urgent tele-ophthalmology referral within 7 days. Anti-VEGF / Focal Laser evaluation.',
    color: '#E76F51',
  },
  {
    grade: 4,
    code: 'ICDR-4',
    name: 'Proliferative DR (PDR)',
    confidence: 97.9,
    probDistribution: [0.001, 0.003, 0.006, 0.011, 0.979],
    urgency: 'Ophthalmic Emergency',
    evidenceSummary: 'Neovascularization of the Optic Disc (NVD) and retina (NVE). Preretinal vitreous traction bands.',
    etdrsRule: 'High-risk Proliferative DR. Severe neovascular proliferation threatening catastrophic vision loss.',
    followUp: 'Immediate tertiary hospital admission within 24–48 hours for Pan-Retinal Photocoagulation (PRP).',
    color: '#B9381E',
  },
];

const PROCESSING_STAGES = [
  'Analyzing image...',
  'Analyzing lesions...',
  'Analyzing anatomy...',
  'Analyzing graph...',
  'Combining features...',
  'Generating prediction...',
];

export const ClassificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAuth();
  const { activeImage, imageMetadata, pipelineResults } = useRetinaData();

  // Active Grade Selection (Default to active grade from context)
  const [selectedGradeIndex, setSelectedGradeIndex] = useState<number>(() => {
    return Math.min(4, Math.max(0, pipelineResults.classification.icdrGrade));
  });
  const currentGrade = DR_GRADES[selectedGradeIndex];

  // Processing Animation State
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [activeModelLayer, setActiveModelLayer] = useState<number>(0);

  // Sequential inference pipeline animation
  const runInferenceSequence = () => {
    setIsProcessing(true);
    setActiveStageIdx(0);
    setActiveModelLayer(0);

    PROCESSING_STAGES.forEach((_, idx) => {
      setTimeout(() => {
        setActiveStageIdx(idx);
        setActiveModelLayer(Math.min(3, Math.floor((idx / PROCESSING_STAGES.length) * 4)));
      }, idx * 450);
    });

    // Complete inference
    setTimeout(() => {
      setIsProcessing(false);
      setActiveModelLayer(3);
    }, PROCESSING_STAGES.length * 450 + 200);
  };

  useEffect(() => {
    runInferenceSequence();
  }, [selectedGradeIndex]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pb-16 space-y-8 select-none">
      {/* ─── 1. PAGE TITLE & HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A5A] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
              {t.modules.m6Badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
            {t.modules.m6Title}
          </h1>
          <p className="text-xs sm:text-sm text-[#65736B]">
            {t.modules.m6Desc}
          </p>
        </div>

        {/* Header Badges & Actions */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-[#FAF4ED] text-[#8A5612] border border-[#E9A23B]/40 flex items-center gap-1.5 shadow-2xs">
            <AlertTriangle size={12} className="text-[#E9A23B]" />
            <span>DEMO / SIMULATED RESULT</span>
          </span>

          <button
            onClick={() => navigate('/explainability')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-md shadow-[#124B3A]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            data-cursor="button"
          >
            <span>{t.modules.m6Action}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Active Scan Pipeline Banner */}
      <ActiveScanPipelineBanner currentModuleNumber={6} />

      {/* ─── 2. SIMULATION PRESET BAR ─── */}
      <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#65736B] uppercase">
            SIMULATE PATIENT STAGE:
          </span>
          <span className="text-[10px] text-[#65736B] hidden sm:inline">
            (Select clinical grade to trigger multimodal inference)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {DR_GRADES.map((g, idx) => (
            <button
              key={g.grade}
              onClick={() => setSelectedGradeIndex(idx)}
              disabled={isProcessing}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                selectedGradeIndex === idx
                  ? 'bg-[#124B3A] text-white border-[#124B3A] shadow-2xs'
                  : 'bg-[#F8F6EF] text-[#17221C] border-[#DDE5DC] hover:bg-[#FAF4ED]'
              } disabled:opacity-60`}
              data-cursor="button"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: g.color }}
              />
              <span className="font-bold">Grade {g.grade}</span>
              <span className="text-[10px] opacity-75 hidden md:inline">({g.name})</span>
            </button>
          ))}

          <button
            onClick={runInferenceSequence}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-[#65736B] hover:text-[#124B3A] hover:bg-[#F8F6EF] transition-colors ml-2 disabled:opacity-50"
            title="Re-run Multimodal Inference Sequence"
          >
            <RotateCcw size={14} className={isProcessing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ─── 3. MAIN WORKSPACE GRID ─── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: 4 Animated Inputs Flowing into Neural Model Engine (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Visualizer Container */}
          <div className="relative rounded-3xl bg-[#08170F] p-6 border-2 border-[#1F7A5A]/30 shadow-inner overflow-hidden min-h-[460px] flex flex-col justify-between">
            {/* Top HUD */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 z-20">
              <div className="flex items-center gap-2">
                <BrainCircuit size={16} className="text-[#E9A23B] animate-pulse" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wide">
                  Heterogeneous Multimodal Fusion Architecture
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17221C] text-[#DDE5DC] border border-white/10">
                ConvNeXt-V2 + GAT-v2 + Cross-Attention
              </span>
            </div>

            {/* Visual Engine Layout: 4 Inputs (Left) ➔ Flow Conduits (Middle) ➔ AI Model Blocks (Right) */}
            <div className="relative grid grid-cols-12 gap-3 my-auto py-4 items-center z-10">
              {/* ── FOUR INPUT STREAM NODES (4 cols) ── */}
              <div className="col-span-4 space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-[#DDE5DC] uppercase tracking-wider block mb-1">
                  1. INPUT STREAMS:
                </span>

                {/* Input 1: Retinal Image (Active Scan) */}
                <div className="p-2.5 rounded-xl bg-[#17221C]/90 border border-[#1F7A5A]/50 text-white flex items-center gap-2.5 shadow-sm">
                  {activeImage ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[#1F7A5A]/60 bg-[#06150F]">
                      <img src={activeImage} alt="Input Scan" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-[#124B3A] flex items-center justify-center text-[#FFFDF8] shrink-0">
                      <Eye size={14} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold truncate">Retinal Image</div>
                    <div className="text-[9px] font-mono text-[#DDE5DC] opacity-75 truncate">
                      {imageMetadata.resolution}
                    </div>
                  </div>
                </div>

                {/* Input 2: Lesion Features */}
                <div className="p-2.5 rounded-xl bg-[#17221C]/90 border border-[#E76F51]/50 text-white flex items-center gap-2.5 shadow-sm">
                  <div className="w-7 h-7 rounded-lg bg-[#E76F51] flex items-center justify-center text-white shrink-0">
                    <Crosshair size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold truncate">Lesion Features</div>
                    <div className="text-[9px] font-mono text-[#DDE5DC] opacity-75">
                      26 Microvascular Sites
                    </div>
                  </div>
                </div>

                {/* Input 3: Anatomical Features */}
                <div className="p-2.5 rounded-xl bg-[#17221C]/90 border border-[#1F7A5A]/50 text-white flex items-center gap-2.5 shadow-sm">
                  <div className="w-7 h-7 rounded-lg bg-[#1F7A5A] flex items-center justify-center text-white shrink-0">
                    <Layers size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold truncate">Anatomical Features</div>
                    <div className="text-[9px] font-mono text-[#DDE5DC] opacity-75">
                      AVR, CDR, FAZ Radius
                    </div>
                  </div>
                </div>

                {/* Input 4: Retinal Graph */}
                <div className="p-2.5 rounded-xl bg-[#17221C]/90 border border-[#E9A23B]/50 text-white flex items-center gap-2.5 shadow-sm">
                  <div className="w-7 h-7 rounded-lg bg-[#E9A23B] flex items-center justify-center text-[#17221C] shrink-0">
                    <Network size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold truncate">Retinal Graph</div>
                    <div className="text-[9px] font-mono text-[#DDE5DC] opacity-75">
                      18 Nodes • 27 Edges
                    </div>
                  </div>
                </div>
              </div>

              {/* ── FLOWING CONDUITS WITH TRAVELING PARTICLES (2 cols) ── */}
              <div className="col-span-2 relative h-56 flex items-center justify-center">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 80 200">
                  {/* Conduits converging to Model */}
                  <path d="M 0 30 C 40 30, 40 85, 80 85" fill="none" stroke="#1F7A5A" strokeWidth="2" opacity="0.6" />
                  <path d="M 0 80 C 40 80, 40 95, 80 95" fill="none" stroke="#E76F51" strokeWidth="2" opacity="0.6" />
                  <path d="M 0 130 C 40 130, 40 105, 80 105" fill="none" stroke="#1F7A5A" strokeWidth="2" opacity="0.6" />
                  <path d="M 0 175 C 40 175, 40 115, 80 115" fill="none" stroke="#E9A23B" strokeWidth="2" opacity="0.6" />

                  {/* Flowing animated pulse beads */}
                  <circle cx="40" cy="57" r="3" fill="#FFFDF8" className="animate-pulse" />
                  <circle cx="40" cy="87" r="3" fill="#E76F51" className="animate-pulse" />
                  <circle cx="40" cy="117" r="3" fill="#1F7A5A" className="animate-pulse" />
                  <circle cx="40" cy="145" r="3" fill="#E9A23B" className="animate-pulse" />
                </svg>
              </div>

              {/* ── ELEGANT AI MODEL VISUALIZATION (6 cols) ── */}
              <div className="col-span-6 space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-[#DDE5DC] uppercase tracking-wider block mb-1">
                  2. DEEP LEARNING MODEL STAGES:
                </span>

                {/* Stage A: CNN / Transformer Backbone */}
                <div
                  className={`p-3 rounded-2xl border transition-all duration-300 ${
                    activeModelLayer >= 1
                      ? 'bg-[#124B3A]/80 border-[#1F7A5A] text-white shadow-md'
                      : 'bg-[#17221C]/60 border-white/10 text-[#65736B]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <Cpu size={13} className="text-[#1F7A5A]" />
                      <span>CNN / Transformer Backbone</span>
                    </span>
                    <span className="text-[9px] font-mono font-normal opacity-80">
                      ConvNeXt-V2 (2048-dim)
                    </span>
                  </div>
                  <p className="text-[10px] text-[#DDE5DC] leading-tight">
                    Multi-scale spatial feature maps extracting texture, colorimetry, and lesion patches.
                  </p>
                </div>

                {/* Stage B: Graph Neural Network (GNN) Stream */}
                <div
                  className={`p-3 rounded-2xl border transition-all duration-300 ${
                    activeModelLayer >= 2
                      ? 'bg-[#124B3A]/80 border-[#E9A23B] text-white shadow-md'
                      : 'bg-[#17221C]/60 border-white/10 text-[#65736B]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <Network size={13} className="text-[#E9A23B]" />
                      <span>Graph Features (GNN Manifold)</span>
                    </span>
                    <span className="text-[9px] font-mono font-normal opacity-80">
                      GAT-v2 (512-dim)
                    </span>
                  </div>
                  <p className="text-[10px] text-[#DDE5DC] leading-tight">
                    Topological message-passing across vascular bifurcations & lesion-fovea geodesics.
                  </p>
                </div>

                {/* Stage C: Multimodal Fusion Engine */}
                <div
                  className={`p-3 rounded-2xl border transition-all duration-300 ${
                    activeModelLayer >= 3
                      ? 'bg-gradient-to-r from-[#175643] to-[#1F7A5A] border-[#FFFDF8]/40 text-white shadow-lg'
                      : 'bg-[#17221C]/60 border-white/10 text-[#65736B]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#E9A23B]" />
                      <span>Multimodal Cross-Attention Fusion</span>
                    </span>
                    <span className="text-[9px] font-mono font-normal text-[#E9A23B]">
                      Attention Matrix (α_uv)
                    </span>
                  </div>
                  <p className="text-[10px] text-[#DDE5DC] leading-tight">
                    Fuses spatial vision tokens with relational graph topology into a joint clinical representation.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom HUD: Animated Processing Stepper */}
            <div className="p-3 rounded-2xl bg-[#17221C]/90 border border-white/10 z-20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E9A23B] animate-ping" />
                <span className="font-mono text-[#FFFDF8] font-bold">
                  {isProcessing ? PROCESSING_STAGES[activeStageIdx] : 'Inference Complete • Decision Calibrated'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#DDE5DC]">
                {PROCESSING_STAGES.map((s, idx) => (
                  <span
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx < activeStageIdx
                        ? 'bg-[#1F7A5A]'
                        : idx === activeStageIdx
                        ? 'bg-[#E9A23B] scale-125'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Model Architecture Transparency Note */}
          <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] text-xs text-[#65736B] flex items-start gap-3">
            <Info size={16} className="text-[#1F7A5A] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#124B3A]">Why Multimodal Graph Fusion Matters:</span>
              <p className="leading-relaxed">
                Standard convolutional models examine pixel grids in isolation and often mistake peripheral artifacts for sight-threatening maculopathy. By binding vision representations to a biological graph, RETINA-FUSION 360 models <em>where</em> lesions sit relative to the optic disc and fovea, achieving an Indian-cohort Quadratic Weighted Kappa of <strong>0.942</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Spring-Animated Result & Prediction Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedGradeIndex}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-5"
            >
              {/* Header: Result Verdict */}
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#65736B] uppercase block">
                    CONSENSUS DIAGNOSTIC RESULT
                  </span>
                  <h3 className="text-xl font-black text-[#124B3A] tracking-tight">
                    Grade {currentGrade.grade}: {currentGrade.name}
                  </h3>
                </div>
                <span
                  className="text-xs font-mono font-bold px-3 py-1 rounded-full border"
                  style={{
                    color: currentGrade.color,
                    borderColor: `${currentGrade.color}50`,
                    backgroundColor: `${currentGrade.color}15`,
                  }}
                >
                  {currentGrade.urgency}
                </span>
              </div>

              {/* Five-Tier Grade Step Indicator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#65736B]">
                  <span>Grade 0 (None)</span>
                  <span>Grade 2 (Mod)</span>
                  <span>Grade 4 (PDR)</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[0, 1, 2, 3, 4].map(g => (
                    <button
                      key={g}
                      onClick={() => setSelectedGradeIndex(g)}
                      className={`h-3 rounded-full transition-all ${
                        g === currentGrade.grade
                          ? 'ring-2 ring-offset-2 ring-[#124B3A]'
                          : 'opacity-40 hover:opacity-75'
                      }`}
                      style={{
                        backgroundColor:
                          g <= 1 ? '#1F7A5A' : g === 2 ? '#E9A23B' : g === 3 ? '#E76F51' : '#B9381E',
                      }}
                      title={`Switch to Grade ${g}`}
                    />
                  ))}
                </div>
              </div>

              {/* Confidence & Evidence Calibration Card */}
              <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#124B3A] flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-[#1F7A5A]" />
                    <span>Model Confidence:</span>
                  </span>
                  <span className="font-mono font-black text-sm text-[#1F7A5A]">
                    {currentGrade.confidence}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#124B3A] flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-[#124B3A]" />
                    <span>Evidence Status:</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#8A5612] bg-[#FAF4ED] px-2 py-0.5 rounded border border-[#E9A23B]/30">
                    VERIFIED EVIDENCE
                  </span>
                </div>

                <p className="text-xs text-[#17221C] leading-relaxed pt-1 border-t border-[#DDE5DC]/80">
                  {currentGrade.evidenceSummary}
                </p>
              </div>

              {/* Calibrated Softmax Probability Vector */}
              <div className="space-y-2 text-xs">
                <span className="font-mono text-[10px] font-bold text-[#65736B] uppercase block">
                  CALIBRATED SOFTMAX PROBABILITY VECTOR (T=1.2)
                </span>

                <div className="space-y-1.5">
                  {DR_GRADES.map((g, i) => {
                    const prob = currentGrade.probDistribution[i];
                    const pct = Math.round(prob * 100);
                    const isWinner = i === currentGrade.grade;

                    return (
                      <div key={g.grade} className="flex items-center gap-2">
                        <span className="w-14 text-[10px] font-mono text-[#65736B]">
                          Grade {g.grade}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-[#F8F6EF] overflow-hidden border border-[#DDE5DC]/70">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: g.color,
                            }}
                          />
                        </div>
                        <span
                          className={`w-10 text-right font-mono text-[11px] font-bold ${
                            isWinner ? 'text-[#124B3A]' : 'text-[#65736B]'
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ETDRS Benchmark Definition */}
              <div className="p-3.5 rounded-2xl bg-[#FAF4ED] border border-[#E9A23B]/30 space-y-1 text-xs">
                <span className="text-[10px] font-mono font-bold text-[#8A5612] uppercase block">
                  CLINICAL BENCHMARK CRITERIA
                </span>
                <p className="text-[#17221C] leading-relaxed">
                  {currentGrade.etdrsRule}
                </p>
              </div>

              {/* Action Plan & Primary CTA */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => navigate('/explainability')}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-lg shadow-[#124B3A]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                  data-cursor="button"
                >
                  <span>Understand Why (Explainability)</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[10px] text-center text-[#65736B]">
                  Examine attention heatmaps, foveal distance vectors, and counterfactuals.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ─── END-TO-END PIPELINE NAVIGATION ─── */}
      <ModulePipelineNav currentModule={6} />
    </div>
  );
};
