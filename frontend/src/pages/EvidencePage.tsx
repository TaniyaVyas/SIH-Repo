import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ModulePipelineNav } from '../components/layout/ModulePipelineNav';
import { ActiveScanPipelineBanner } from '../components/layout/ActiveScanPipelineBanner';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Layers,
  Network,
  Crosshair,
  Eye,
  UserCheck,
  Check,
  XCircle,
  HelpCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

export type ScenarioState = 'supported' | 'borderline' | 'mismatch';
export type EvidenceStrength = 'HIGH' | 'MEDIUM' | 'LOW';

interface PipelineStage {
  id: string;
  name: string;
  category: string;
  supportedDetail: string;
  mismatchDetail: string;
  statusSupported: 'VERIFIED' | 'CONFIRMED';
  statusMismatch: 'VERIFIED' | 'DISCORDANT' | 'CONFIRMED';
  metricsSupported: string;
  metricsMismatch: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'stage-1',
    name: '1. PREDICTION',
    category: 'Proposed Model Classification',
    supportedDetail: 'Model proposes Grade 3 (Severe NPDR) with 96.4% calibrated Softmax confidence.',
    mismatchDetail: 'Model proposes Grade 2 (Moderate DR) with 89.2% confidence from raw visual texture.',
    statusSupported: 'CONFIRMED',
    statusMismatch: 'CONFIRMED',
    metricsSupported: 'Proposed: Grade 3 (96.4%)',
    metricsMismatch: 'Proposed: Moderate DR (89.2%)',
  },
  {
    id: 'stage-2',
    name: '2. LESION EVIDENCE',
    category: 'Microvascular Lesion Census',
    supportedDetail: 'Detected 26 true pathology markers: 7 Microaneurysms, 3 Hemorrhages, 12 Hard Exudates, 4 Soft Exudates.',
    mismatchDetail: 'Lesion extractor detects 0 Microaneurysms and 0 Hemorrhages. Saliency was triggered by lens dust artifact.',
    statusSupported: 'VERIFIED',
    statusMismatch: 'DISCORDANT',
    metricsSupported: '26 Verified Lesions',
    metricsMismatch: '0 Verified Lesions (Artifact)',
  },
  {
    id: 'stage-3',
    name: '3. ANATOMICAL EVIDENCE',
    category: 'Structural Landmark Verification',
    supportedDetail: 'Arteriolar-to-Venular Ratio (AVR: 0.68), Disc CDR (0.32), and FAZ boundary validated by vessel segmentation.',
    mismatchDetail: 'Vascular calibers normal (AVR: 0.70). Zero vessel tortuosity or focal constriction detected.',
    statusSupported: 'VERIFIED',
    statusMismatch: 'VERIFIED',
    metricsSupported: 'Normal Landmarks • AVR 0.68',
    metricsMismatch: 'Normal Landmarks • AVR 0.70',
  },
  {
    id: 'stage-4',
    name: '4. GRAPH EVIDENCE',
    category: 'Topological Geodesic & Murray Law',
    supportedDetail: '18 GNN nodes connected by 27 edges. Circinate hard exudate cluster lies 420μm from Fovea along feeder arteriole.',
    mismatchDetail: 'Topological graph contains no lesion nodes. Peripheral artifact does not connect to any vascular tree manifold.',
    statusSupported: 'VERIFIED',
    statusMismatch: 'DISCORDANT',
    metricsSupported: '420μm to FAZ (Threat Zone)',
    metricsMismatch: 'No Graph Lesion Nodes',
  },
  {
    id: 'stage-5',
    name: '5. CLINICAL EVIDENCE MATCH',
    category: 'Deterministic ETDRS / ICDR Rule Engine',
    supportedDetail: 'Full concordance with ETDRS 4-2-1 criteria. Hemorrhages in 2 quadrants + CSME hard exudates near fovea.',
    mismatchDetail: 'Rule violation: Cannot establish Moderate NPDR in the complete absence of microaneurysms.',
    statusSupported: 'VERIFIED',
    statusMismatch: 'DISCORDANT',
    metricsSupported: 'ETDRS 4-2-1 Rule Matched',
    metricsMismatch: 'Rule Check Failed',
  },
  {
    id: 'stage-6',
    name: '6. EVIDENCE STRENGTH',
    category: 'Synthesized Verification Verdict',
    supportedDetail: 'High evidence concordance across visual, structural, and guideline layers. Prediction fully substantiated.',
    mismatchDetail: 'Evidence is weak and contradictory. Guard rail prevents autonomous finalization; escalates to clinician.',
    statusSupported: 'CONFIRMED',
    statusMismatch: 'DISCORDANT',
    metricsSupported: 'HIGH (94.8% Concordance)',
    metricsMismatch: 'LOW (21.4% Concordance)',
  },
];

export const EvidencePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAuth();

  // Active Clinical Scenario: 'supported' (High Evidence) vs 'mismatch' (Low Evidence)
  const [scenario, setScenario] = useState<ScenarioState>('supported');

  // Sequential verification animation state
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  // Sequential pipeline execution
  const runVerificationSequence = () => {
    setIsVerifying(true);
    setActiveStageIndex(0);

    PIPELINE_STAGES.forEach((_, idx) => {
      setTimeout(() => {
        setActiveStageIndex(idx + 1);
      }, (idx + 1) * 450);
    });

    setTimeout(() => {
      setIsVerifying(false);
      setActiveStageIndex(PIPELINE_STAGES.length);
    }, PIPELINE_STAGES.length * 450 + 200);
  };

  useEffect(() => {
    runVerificationSequence();
  }, [scenario]);

  const isSupported = scenario === 'supported';
  const evidenceStrength: EvidenceStrength =
    scenario === 'supported' ? 'HIGH' : scenario === 'borderline' ? 'MEDIUM' : 'LOW';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pb-16 space-y-8 select-none">
      {/* ─── 1. PAGE HEADER & TITLE ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
              {t.modules.m8Badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
            {t.modules.m8Title}
          </h1>
          <p className="text-xs sm:text-sm text-[#65736B]">
            {t.modules.m8Desc}
          </p>
        </div>

        {/* Action button to proceed */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/self-aware')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-md shadow-[#124B3A]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            data-cursor="button"
          >
            <span>{t.modules.m8Action}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ─── ACTIVE SCAN PIPELINE RUNNER ─── */}
      <ActiveScanPipelineBanner currentModule="evidence" />

      {/* ─── 2. KEY MESSAGE & SCENARIO TOGGLE BAR ─── */}
      <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Key Message */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8F3EE] flex items-center justify-center text-[#124B3A] shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#65736B] block">
              CORE TRUST PRINCIPLE
            </span>
            <span className="font-serif italic font-black text-base text-[#124B3A]">
              "Don't just predict. Verify."
            </span>
          </div>
        </div>

        {/* Interactive Scenario Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F8F6EF] p-1.5 rounded-2xl border border-[#DDE5DC]">
          <button
            onClick={() => setScenario('supported')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              scenario === 'supported'
                ? 'bg-[#124B3A] text-white shadow-xs'
                : 'text-[#65736B] hover:text-[#17221C]'
            }`}
            data-cursor="button"
          >
            <CheckCircle2 size={13} className={scenario === 'supported' ? 'text-[#FFFDF8]' : 'text-[#1F7A5A]'} />
            <span>Supported (High)</span>
          </button>

          <button
            onClick={() => setScenario('borderline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              scenario === 'borderline'
                ? 'bg-[#E9A23B] text-[#17221C] shadow-xs'
                : 'text-[#65736B] hover:text-[#17221C]'
            }`}
            data-cursor="button"
          >
            <AlertTriangle size={13} className={scenario === 'borderline' ? 'text-[#17221C]' : 'text-[#E9A23B]'} />
            <span>Borderline (Medium)</span>
          </button>

          <button
            onClick={() => setScenario('mismatch')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              scenario === 'mismatch'
                ? 'bg-[#E76F51] text-white shadow-xs'
                : 'text-[#65736B] hover:text-[#17221C]'
            }`}
            data-cursor="button"
          >
            <XCircle size={13} className={scenario === 'mismatch' ? 'text-white' : 'text-[#E76F51]'} />
            <span>Mismatch (Low / Weak)</span>
          </button>

          <button
            onClick={runVerificationSequence}
            className="p-1.5 rounded-xl text-[#65736B] hover:text-[#124B3A] hover:bg-[#FAF4ED] transition-colors ml-1"
            title="Re-run Verification Pipeline"
          >
            <RotateCcw size={14} className={isVerifying ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ─── 3. MAIN WORKSPACE GRID ─── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: 6-Stage Animated Verification Pipeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#DDE5DC]">
            <h3 className="text-xs font-bold font-mono text-[#124B3A] uppercase tracking-wide flex items-center gap-2">
              <Activity size={15} className="text-[#1F7A5A]" />
              <span>Deterministic Verification Pipeline Sequence</span>
            </h3>
            <span className="text-[10px] font-mono text-[#65736B]">
              Stage {Math.min(activeStageIndex, 6)} of 6
            </span>
          </div>

          {/* Sequential Pipeline Cards Stack */}
          <div className="space-y-3 relative">
            {PIPELINE_STAGES.map((stage, idx) => {
              const isActivated = idx < activeStageIndex;
              const isCurrent = idx === activeStageIndex - 1 && isVerifying;
              const isDiscordant = !isSupported && stage.statusMismatch === 'DISCORDANT';

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0.5, y: 5 }}
                  animate={{
                    opacity: isActivated ? 1 : 0.45,
                    scale: isCurrent ? 1.01 : 1,
                    y: 0,
                  }}
                  transition={{ duration: 0.25 }}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                    !isActivated
                      ? 'bg-[#F8F6EF] border-[#DDE5DC]'
                      : isDiscordant
                      ? 'bg-[#FFFDF8] border-[#E76F51] shadow-xs'
                      : 'bg-[#FFFDF8] border-[#1F7A5A]/40 shadow-xs'
                  }`}
                >
                  {/* Scanning Line Animation on active verification stage */}
                  {isCurrent && (
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#E9A23B] to-transparent shadow-[0_0_8px_#E9A23B] animate-laser-sweep" />
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#124B3A] text-white">
                          {stage.name}
                        </span>
                        <span className="text-xs font-bold text-[#124B3A]">
                          {stage.category}
                        </span>
                      </div>

                      <p className="text-xs text-[#17221C] leading-relaxed pt-1">
                        {isSupported ? stage.supportedDetail : stage.mismatchDetail}
                      </p>
                    </div>

                    {/* Stage Status Badge */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      {isActivated ? (
                        isDiscordant ? (
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                            className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#E76F51]/10 text-[#E76F51] border border-[#E76F51]/30 flex items-center gap-1"
                          >
                            <XCircle size={12} />
                            <span>DISCORDANT</span>
                          </motion.span>
                        ) : (
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                            className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#1F7A5A]/10 text-[#1F7A5A] border border-[#1F7A5A]/30 flex items-center gap-1"
                          >
                            <CheckCircle2 size={12} />
                            <span>VERIFIED</span>
                          </motion.span>
                        )
                      ) : (
                        <span className="text-[10px] font-mono text-[#65736B] px-2 py-0.5 rounded bg-[#F8F6EF]">
                          PENDING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantitative Metric readout */}
                  <div className="mt-2.5 pt-2.5 border-t border-[#DDE5DC]/70 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#65736B]">Audited Quantitative Signal:</span>
                    <span
                      className={`font-bold ${
                        isDiscordant ? 'text-[#E76F51]' : 'text-[#1F7A5A]'
                      }`}
                    >
                      {isSupported ? stage.metricsSupported : stage.metricsMismatch}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Evidence Strength, Verdict & Escalation (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Evidence Strength Gauge (HIGH, MEDIUM, LOW) */}
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-4 motion-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-[#124B3A]" />
                <h4 className="text-xs font-bold text-[#124B3A] uppercase tracking-wide">
                  Synthesized Evidence Strength
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8F6EF] text-[#65736B]">
                Concordance Metric
              </span>
            </div>

            {/* Continuous Animated Strength Fill Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#65736B]">Verification Concordance:</span>
                <span className="font-bold text-[#124B3A]">
                  {isSupported ? '94.8%' : '21.4%'}
                </span>
              </div>
              <div className="h-3 rounded-full bg-[#F8F6EF] border border-[#DDE5DC] p-0.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isSupported ? '94.8%' : '21.4%' }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  className={`h-full rounded-full ${
                    isSupported
                      ? 'bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] shadow-xs shadow-[#1F7A5A]/50'
                      : 'bg-gradient-to-r from-[#E9A23B] to-[#E76F51] shadow-xs shadow-[#E76F51]/50'
                  }`}
                />
              </div>
            </div>

            {/* Three Level Segment Gauge */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
                {/* LOW: Coral */}
                <div
                  className={`p-2.5 rounded-xl border transition-all ${
                    evidenceStrength === 'LOW'
                      ? 'bg-[#E76F51] text-white border-[#E76F51] shadow-sm'
                      : 'bg-[#F8F6EF] text-[#65736B] border-[#DDE5DC] opacity-60'
                  }`}
                >
                  <div className="text-[10px]">CORAL</div>
                  <div className="text-sm font-black">LOW</div>
                  <div className="text-[9px] opacity-80">&lt; 40% Match</div>
                </div>

                {/* MEDIUM: Saffron */}
                <div
                  className={`p-2.5 rounded-xl border transition-all ${
                    evidenceStrength === 'MEDIUM'
                      ? 'bg-[#E9A23B] text-[#17221C] border-[#E9A23B] shadow-sm'
                      : 'bg-[#F8F6EF] text-[#65736B] border-[#DDE5DC] opacity-60'
                  }`}
                >
                  <div className="text-[10px]">SAFFRON</div>
                  <div className="text-sm font-black">MEDIUM</div>
                  <div className="text-[9px] opacity-80">40%–80% Match</div>
                </div>

                {/* HIGH: Green */}
                <div
                  className={`p-2.5 rounded-xl border transition-all ${
                    evidenceStrength === 'HIGH'
                      ? 'bg-[#1F7A5A] text-white border-[#1F7A5A] shadow-sm'
                      : 'bg-[#F8F6EF] text-[#65736B] border-[#DDE5DC] opacity-60'
                  }`}
                >
                  <div className="text-[10px]">GREEN</div>
                  <div className="text-sm font-black">HIGH</div>
                  <div className="text-[9px] opacity-80">&gt; 80% Match</div>
                </div>
              </div>
            </div>

            {/* Evidence Strength Narrative */}
            <div className="p-3.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC] text-xs text-[#17221C] leading-relaxed">
              {isSupported ? (
                <p>
                  <strong>Level: HIGH (94.8%).</strong> The model's proposed diagnosis aligns with deterministic ETDRS gold standard criteria. The patient has confirmed anatomical evidence for Grade 3 referral.
                </p>
              ) : (
                <p>
                  <strong>Level: LOW (21.4%).</strong> Visual texture alone suggested Moderate DR, but lesion verification detected 0 microaneurysms. The evidence does not substantiate the prediction.
                </p>
              )}
            </div>
          </div>

          {/* 2. Verdict Card: SUPPORTED STATE vs MISMATCH STATE */}
          <AnimatePresence mode="wait">
            {isSupported ? (
              /* SUPPORTED STATE */
              <motion.div
                key="supported-card"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-[#FFFDF8] rounded-3xl border-2 border-[#1F7A5A] p-6 shadow-md space-y-4"
              >
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#DDE5DC]">
                  <div className="w-8 h-8 rounded-full bg-[#1F7A5A] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Check size={18} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#124B3A]">
                      ✓ Prediction Supported
                    </h4>
                    <span className="text-[10px] font-mono text-[#1F7A5A] font-bold">
                      VERIFIED WITH RETINAL EVIDENCE
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#17221C]">
                  <div className="p-3 rounded-xl bg-[#E8F3EE] border border-[#C8D4C7] flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#1F7A5A] shrink-0 mt-0.5" />
                    <div>
                      <strong>26 Verified Lesions:</strong> Dense circinate Hard Exudates located 420μm from the foveal avascular center.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#E8F3EE] border border-[#C8D4C7] flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#1F7A5A] shrink-0 mt-0.5" />
                    <div>
                      <strong>ETDRS 4-2-1 Rule Concordance:</strong> Blot hemorrhages in 2 quadrants confirm Severe NPDR classification.
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('/self-aware')}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-lg shadow-[#124B3A]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                    data-cursor="button"
                  >
                    <span>Check AI Uncertainty (Self-Aware Engine)</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ) : (
              /* MISMATCH STATE */
              <motion.div
                key="mismatch-card"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-[#FFFDF8] rounded-3xl border-2 border-[#E76F51] p-6 shadow-md space-y-4"
              >
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#E76F51]/30">
                  <div className="w-8 h-8 rounded-full bg-[#E76F51] text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                    <AlertTriangle size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#B9381E]">
                      Evidence Mismatch Detected
                    </h4>
                    <span className="text-[10px] font-mono text-[#E76F51] font-bold">
                      PREDICTION: MODERATE DR • EVIDENCE: WEAK
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#17221C]">
                  <div className="p-3 rounded-xl bg-[#FAF4ED] border border-[#E9A23B]/40 space-y-1">
                    <span className="font-bold text-[#8A5612] block">DISCORDANCE SUMMARY:</span>
                    <p className="text-[#17221C] leading-relaxed">
                      The visual backbone proposed <em>Moderate DR</em> based on diffuse peripheral illumination artifacts, but the lesion extractor verified <strong>0 microaneurysms</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FDF0EC] border border-[#E76F51]/40 flex items-start gap-2.5">
                    <UserCheck size={18} className="text-[#E76F51] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#9A3B24] block">Mandatory Clinician Triage:</span>
                      <p className="text-[11px] text-[#65736B] leading-relaxed mt-0.5">
                        Autonomous staging is blocked. This case is automatically routed to an accredited ophthalmologist for tele-retinal secondary review.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => navigate('/self-aware')}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#B9381E] to-[#E76F51] hover:from-[#a02f17] hover:to-[#d65f42] text-white text-xs font-bold shadow-lg shadow-[#E76F51]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                    data-cursor="button"
                  >
                    <span>Inspect Uncertainty & Human Review Protocol</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <p className="text-[10px] text-center text-[#65736B]">
                    Preventing false positive panic and ensuring complete patient safety.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── END-TO-END PIPELINE NAVIGATION ─── */}
      <ModulePipelineNav currentModule={8} />
    </div>
  );
};
