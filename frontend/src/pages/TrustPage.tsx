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
  Sliders,
  Cpu,
  Hexagon,
  TrendingUp,
  Share2
} from 'lucide-react';

export const TrustPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAuth();

  // ─── INTERACTIVE CONTROLS ───
  const [drGrade, setDrGrade] = useState<number>(3); // Grade 0 to 4
  const [confidence, setConfidence] = useState<number>(94); // 10% - 100%
  const [evidenceStrength, setEvidenceStrength] = useState<number>(92); // 10% - 100%
  const [errorRisk, setErrorRisk] = useState<number>(0.22); // 0.0 - 1.0

  // ─── TRUST SCORE ENGINE CALCULATION ───
  // Trust formula weighing evidence highest (40%), confidence (35%), and inverted error risk (25%)
  const calculatedTrustScore = Math.round(
    confidence * 0.35 + evidenceStrength * 0.40 + (1.0 - errorRisk) * 100 * 0.25
  );

  // Decision Logic:
  // ACCEPT: Trust Score >= 70 AND Error Risk < 0.45
  // REJECT / ESCALATE: Trust Score < 70 OR Error Risk >= 0.45
  const isAccepted = calculatedTrustScore >= 70 && errorRisk < 0.45;
  const decisionPath = isAccepted ? 'ACCEPT' : 'REJECT';

  // Presets
  const applyPreset = (mode: 'accept' | 'borderline' | 'reject') => {
    if (mode === 'accept') {
      setDrGrade(3);
      setConfidence(96);
      setEvidenceStrength(94);
      setErrorRisk(0.18);
    } else if (mode === 'borderline') {
      setDrGrade(2);
      setConfidence(78);
      setEvidenceStrength(62);
      setErrorRisk(0.42);
    } else {
      setDrGrade(2);
      setConfidence(56);
      setEvidenceStrength(24);
      setErrorRisk(0.74);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pb-16 space-y-8 select-none">
      {/* ─── 1. PAGE HEADER & TITLE ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
              {t.modules.m10Badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
            {t.modules.m10Title}
          </h1>
          <p className="text-xs sm:text-sm text-[#65736B]">
            {t.modules.m10Desc}
          </p>
        </div>

        {/* Action button to proceed */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/care')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-md shadow-[#124B3A]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            data-cursor="button"
          >
            <span>{t.modules.m10Action}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ─── ACTIVE SCAN PIPELINE RUNNER ─── */}
      <ActiveScanPipelineBanner currentModule="trust" />

      {/* ─── 2. KEY MESSAGE & PRESET BANNER ─── */}
      <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Key Message */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8F3EE] flex items-center justify-center text-[#124B3A] shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#65736B] block">
              CORE TRUST CREED
            </span>
            <span className="font-serif italic font-black text-base text-[#124B3A]">
              "Trust is earned by evidence."
            </span>
          </div>
        </div>

        {/* Interactive Presets */}
        <div className="flex items-center gap-2 bg-[#F8F6EF] p-1.5 rounded-2xl border border-[#DDE5DC]">
          <span className="text-[10px] font-mono font-bold text-[#65736B] px-2 hidden sm:inline">
            PRESETS:
          </span>
          <button
            onClick={() => applyPreset('accept')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isAccepted
                ? 'bg-[#124B3A] text-white shadow-2xs'
                : 'text-[#65736B] hover:text-[#17221C]'
            }`}
            data-cursor="button"
          >
            <CheckCircle2 size={13} />
            <span>High Trust (Accept)</span>
          </button>

          <button
            onClick={() => applyPreset('borderline')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#65736B] hover:text-[#17221C] transition-all"
            data-cursor="button"
          >
            Borderline
          </button>

          <button
            onClick={() => applyPreset('reject')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              !isAccepted
                ? 'bg-[#E76F51] text-white shadow-2xs'
                : 'text-[#65736B] hover:text-[#17221C]'
            }`}
            data-cursor="button"
          >
            <AlertTriangle size={13} />
            <span>Low Trust (Reject)</span>
          </button>
        </div>
      </div>

      {/* ─── 3. MAIN WORKSPACE GRID ─── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Trust Engine Central Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#08170F] rounded-3xl border-2 border-[#1F7A5A]/30 p-6 shadow-inner relative overflow-hidden min-h-[480px] flex flex-col justify-between">
            {/* Top HUD */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 z-20">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-[#E9A23B] animate-pulse" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wide">
                  Triangulated Trust Gate Architecture
                </span>
              </div>
              <span
                className="text-[10px] font-mono px-2.5 py-1 rounded-full font-bold border"
                style={{
                  color: isAccepted ? '#1F7A5A' : '#E76F51',
                  borderColor: isAccepted ? '#1F7A5A40' : '#E76F5140',
                  backgroundColor: isAccepted ? '#1F7A5A20' : '#E76F5120',
                }}
              >
                GATE STATUS: {decisionPath}
              </span>
            </div>

            {/* FLOW VISUALIZATION: 4 INPUTS (Left) ➔ CENTRAL HEXAGONAL TRUST ENGINE (Center) ➔ 2 OUTPUT PATHS (Right) */}
            <div className="relative grid grid-cols-12 gap-2 my-auto py-6 items-center z-10">
              {/* ── 4 INPUT NODES (3 cols) ── */}
              <div className="col-span-3 space-y-2">
                <span className="text-[9px] font-mono font-bold text-[#DDE5DC] uppercase tracking-wider block mb-1">
                  1. INPUT SIGNALS:
                </span>

                {/* Input 1: DR Grade */}
                <div className="p-2 rounded-xl bg-[#17221C]/90 border border-white/15 text-white flex items-center gap-2 shadow-xs">
                  <div className="w-6 h-6 rounded-lg bg-[#124B3A] text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    {drGrade}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold truncate">DR Grade</div>
                    <div className="text-[8px] font-mono text-[#DDE5DC]">Grade {drGrade}</div>
                  </div>
                </div>

                {/* Input 2: Confidence */}
                <div className="p-2 rounded-xl bg-[#17221C]/90 border border-white/15 text-white flex items-center gap-2 shadow-xs">
                  <div className="w-6 h-6 rounded-lg bg-[#1F7A5A] text-white flex items-center justify-center shrink-0">
                    <Activity size={12} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold truncate">Confidence</div>
                    <div className="text-[8px] font-mono text-[#1F7A5A] font-bold">{confidence}%</div>
                  </div>
                </div>

                {/* Input 3: Evidence Strength */}
                <div className="p-2 rounded-xl bg-[#17221C]/90 border border-white/15 text-white flex items-center gap-2 shadow-xs">
                  <div className="w-6 h-6 rounded-lg bg-[#E9A23B] text-[#17221C] flex items-center justify-center shrink-0">
                    <ShieldCheck size={12} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold truncate">Evidence</div>
                    <div className="text-[8px] font-mono text-[#E9A23B] font-bold">{evidenceStrength}%</div>
                  </div>
                </div>

                {/* Input 4: Error Risk */}
                <div className="p-2 rounded-xl bg-[#17221C]/90 border border-white/15 text-white flex items-center gap-2 shadow-xs">
                  <div className="w-6 h-6 rounded-lg bg-[#E76F51] text-white flex items-center justify-center shrink-0">
                    <AlertTriangle size={12} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold truncate">Error Risk</div>
                    <div className="text-[8px] font-mono text-[#E76F51] font-bold">{errorRisk.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* ── CONDUITS TO TRUST ENGINE (2 cols) ── */}
              <div className="col-span-2 relative h-48 flex items-center justify-center">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 60 160">
                  <path d="M 0 20 C 30 20, 30 80, 60 80" fill="none" stroke="#124B3A" strokeWidth="2" opacity="0.6" />
                  <path d="M 0 60 C 30 60, 30 80, 60 80" fill="none" stroke="#1F7A5A" strokeWidth="2" opacity="0.6" />
                  <path d="M 0 100 C 30 100, 30 80, 60 80" fill="none" stroke="#E9A23B" strokeWidth="2" opacity="0.6" />
                  <path d="M 0 140 C 30 140, 30 80, 60 80" fill="none" stroke="#E76F51" strokeWidth="2" opacity="0.6" />

                  {/* Flowing animated pulse beads traveling into engine */}
                  <motion.circle
                    r="3.5"
                    fill="#1F7A5A"
                    animate={{
                      cx: [0, 20, 40, 60],
                      cy: [20, 35, 65, 80],
                      opacity: [0.2, 1, 1, 0.2],
                    }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
                  />
                  <motion.circle
                    r="3.5"
                    fill="#1F7A5A"
                    animate={{
                      cx: [0, 20, 40, 60],
                      cy: [60, 65, 75, 80],
                      opacity: [0.2, 1, 1, 0.2],
                    }}
                    transition={{ repeat: Infinity, duration: 1.6, delay: 0.4, ease: 'linear' }}
                  />
                  <motion.circle
                    r="3.5"
                    fill="#E9A23B"
                    animate={{
                      cx: [0, 20, 40, 60],
                      cy: [100, 95, 85, 80],
                      opacity: [0.2, 1, 1, 0.2],
                    }}
                    transition={{ repeat: Infinity, duration: 1.6, delay: 0.8, ease: 'linear' }}
                  />
                  <motion.circle
                    r="3.5"
                    fill="#E76F51"
                    animate={{
                      cx: [0, 20, 40, 60],
                      cy: [140, 125, 95, 80],
                      opacity: [0.2, 1, 1, 0.2],
                    }}
                    transition={{ repeat: Infinity, duration: 1.6, delay: 1.2, ease: 'linear' }}
                  />
                </svg>
              </div>

              {/* ── CENTRAL ANIMATED HEXAGONAL TRUST ENGINE (4 cols) ── */}
              <div className="col-span-4 flex flex-col items-center justify-center text-center relative py-2">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  {/* Outer spinning dash ring */}
                  <div
                    className="absolute inset-0 rounded-full border-2 border-dashed border-white/20 animate-spin-slow"
                  />

                  {/* Central Hexagon Body with Physiological Breathing Motion */}
                  <motion.div
                    animate={{
                      scale: [1, 1.03, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3.2,
                      ease: 'easeInOut',
                    }}
                    className={`w-28 h-28 rounded-3xl transition-all duration-500 border-2 flex flex-col items-center justify-center shadow-2xl relative ${
                      isAccepted
                        ? 'bg-[#124B3A]/90 border-[#1F7A5A] shadow-[0_0_30px_#1F7A5A]'
                        : 'bg-[#3d130a]/90 border-[#E76F51] shadow-[0_0_30px_#E76F51]'
                    }`}
                  >
                    <span className="text-[9px] font-mono font-bold text-[#DDE5DC] uppercase tracking-widest">
                      GATEWAY
                    </span>
                    <span className="text-xl font-black font-display tracking-wider text-white my-0.5">
                      TRUST
                    </span>
                    <span
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isAccepted ? '#1F7A5A' : '#E76F51',
                        color: '#FFFDF8',
                      }}
                    >
                      {calculatedTrustScore} / 100
                    </span>
                  </motion.div>
                </div>

                <span className="text-[10px] font-mono text-[#DDE5DC] mt-2">
                  Autonomous Gate τ = 70
                </span>
              </div>

              {/* ── DIVERGING CONDUITS TO DECISION PATHS (3 cols) ── */}
              <div className="col-span-3 space-y-4">
                <span className="text-[9px] font-mono font-bold text-[#DDE5DC] uppercase tracking-wider block mb-1">
                  2. DECISION PATHWAYS:
                </span>

                {/* PATH 1: ACCEPT (Use AI Result) */}
                <motion.div
                  animate={{
                    scale: isAccepted ? 1.04 : 0.98,
                    opacity: isAccepted ? 1 : 0.45,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`p-3 rounded-2xl border transition-all duration-300 relative ${
                    isAccepted
                      ? 'bg-[#1F7A5A] border-white/60 text-white shadow-lg'
                      : 'bg-[#17221C]/50 border-white/10 text-[#65736B]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-white text-[#1F7A5A] flex items-center justify-center font-bold">
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-wide">
                      ACCEPT
                    </span>
                  </div>
                  <div className="text-[11px] font-bold">"Use AI Result"</div>
                  <div className="text-[9px] opacity-80 mt-0.5">
                    AI result can proceed.
                  </div>
                </motion.div>

                {/* PATH 2: REJECT (Send for Human Review) */}
                <motion.div
                  animate={{
                    scale: !isAccepted ? 1.04 : 0.98,
                    opacity: !isAccepted ? 1 : 0.45,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`p-3 rounded-2xl border transition-all duration-300 relative ${
                    !isAccepted
                      ? 'bg-[#E76F51] border-white/60 text-white shadow-lg'
                      : 'bg-[#17221C]/50 border-white/10 text-[#65736B]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-white text-[#E76F51] flex items-center justify-center font-bold">
                      <UserCheck size={13} strokeWidth={2.5} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-wide">
                      REJECT
                    </span>
                  </div>
                  <div className="text-[11px] font-bold">"Send for Human Review"</div>
                  <div className="text-[9px] opacity-80 mt-0.5">
                    Additional review recommended.
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Bottom HUD: Live Decision Message */}
            <div className="p-3 rounded-2xl bg-[#17221C]/90 border border-white/10 z-20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {isAccepted ? (
                  <CheckCircle2 size={16} className="text-[#1F7A5A]" />
                ) : (
                  <AlertTriangle size={16} className="text-[#E76F51]" />
                )}
                <span className="font-mono text-white font-bold">
                  {isAccepted
                    ? 'AI result can proceed. Validated with high confidence & clinical evidence.'
                    : 'Additional human review recommended. Autonomous execution suppressed.'}
                </span>
              </div>

              <span className="text-[10px] font-mono text-[#DDE5DC]">
                {isAccepted ? 'AUTONOMOUS SIGN-OFF PERMITTED' : 'MANDATORY CLINICIAN DISPATCH'}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Demo Sliders & Clinical Impact (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Controls Card */}
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-[#124B3A]" />
                <h4 className="text-xs font-bold text-[#124B3A] uppercase tracking-wide">
                  Live Trust Decision Sliders
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF4ED] text-[#8A5612] border border-[#E9A23B]/30">
                DYNAMIC GATE
              </span>
            </div>

            <p className="text-xs text-[#65736B] leading-relaxed">
              Drag the sliders below to see how the Central Trust Engine continuously toggles between the <strong>ACCEPT</strong> and <strong>REJECT</strong> pathways:
            </p>

            {/* Slider 1: Confidence */}
            <div className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#124B3A]">Proposed Confidence:</span>
                <span className="font-mono font-bold text-[#124B3A]">{confidence}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={confidence}
                onChange={e => setConfidence(Number(e.target.value))}
                className="w-full accent-[#124B3A]"
                data-cursor="pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#65736B]">
                <span>10% (Low)</span>
                <span>100% (Certain)</span>
              </div>
            </div>

            {/* Slider 2: Evidence */}
            <div className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#124B3A]">Evidence Concordance:</span>
                <span className="font-mono font-bold text-[#1F7A5A]">{evidenceStrength}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={evidenceStrength}
                onChange={e => setEvidenceStrength(Number(e.target.value))}
                className="w-full accent-[#1F7A5A]"
                data-cursor="pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#65736B]">
                <span>10% (Weak)</span>
                <span>100% (Strong)</span>
              </div>
            </div>

            {/* Slider 3: Error Risk */}
            <div className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#124B3A]">Prediction Error Risk:</span>
                <span className="font-mono font-bold text-[#E76F51]">{errorRisk.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(errorRisk * 100)}
                onChange={e => setErrorRisk(Number(e.target.value) / 100)}
                className="w-full accent-[#E76F51]"
                data-cursor="pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#65736B]">
                <span>0.00 (Safe)</span>
                <span>1.00 (High Risk)</span>
              </div>
            </div>

            {/* Live Verdict Feedback Card */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isAccepted
                  ? 'bg-[#E8F3EE] border-[#C8D4C7] text-[#124B3A]'
                  : 'bg-[#FDF0EC] border-[#E76F51]/40 text-[#B9381E]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {isAccepted ? (
                  <CheckCircle2 size={16} className="text-[#1F7A5A]" />
                ) : (
                  <UserCheck size={16} className="text-[#E76F51]" />
                )}
                <span className="font-black text-xs uppercase tracking-wide">
                  {isAccepted ? 'ACCEPT PATHWAY ACTIVE' : 'REJECT / HUMAN ESCALATION ACTIVE'}
                </span>
              </div>
              <p className="text-xs leading-relaxed">
                {isAccepted
                  ? 'All 3 safety conditions are satisfied: High Confidence (>= 70%), Verified Evidence (> 60%), and Low Error Risk (< 0.45). The diagnosis is accepted autonomously.'
                  : 'Safety threshold violated: Elevated uncertainty or inadequate lesion backing detected. The case is safely intercepted and sent to human review.'}
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                onClick={() => navigate('/care')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-lg shadow-[#124B3A]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                data-cursor="button"
              >
                <span>Continue to Care Pathway</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── END-TO-END PIPELINE NAVIGATION ─── */}
      <ModulePipelineNav currentModule={10} />
    </div>
  );
};
