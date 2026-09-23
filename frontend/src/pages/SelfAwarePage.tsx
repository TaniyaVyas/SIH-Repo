import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ModulePipelineNav } from '../components/layout/ModulePipelineNav';
import { ActiveScanPipelineBanner } from '../components/layout/ActiveScanPipelineBanner';
import { SpeedometerGauge } from '../components/SpeedometerGauge';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  Activity,
  ShieldAlert,
  Gauge,
  HelpCircle,
  Sparkles,
  Sliders,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  Zap,
  Info,
  Layers,
  Cpu,
  RefreshCw,
  AlertOctagon,
  GitBranch,
  Radio,
  FileCheck,
  EyeOff
} from 'lucide-react';

export const SelfAwarePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAuth();

  // ─── INTERACTIVE USER CONTROLS ───
  const [confidence, setConfidence] = useState<number>(94); // 10-100%
  const [imageQuality, setImageQuality] = useState<number>(88); // 10-100%
  const [evidenceStrength, setEvidenceStrength] = useState<number>(92); // 10-100%
  const [uncertainty, setUncertainty] = useState<number>(14); // 0-100%

  // Active simulated safety gate state
  const [activeScenario, setActiveScenario] = useState<'nominal' | 'borderline' | 'high-risk'>('nominal');

  // ─── DYNAMIC RISK CALCULATION ───
  // Composite Prediction Error Risk (0.0 to 1.0)
  const unscaledRisk =
    (uncertainty / 100) * 0.40 +
    ((100 - imageQuality) / 100) * 0.25 +
    ((100 - evidenceStrength) / 100) * 0.20 +
    ((100 - confidence) / 100) * 0.15;

  const errorRisk = Math.min(1.0, Math.max(0.0, parseFloat(unscaledRisk.toFixed(2))));

  // Risk Classification
  const isHighRisk = errorRisk >= 0.60;
  const isMediumRisk = errorRisk >= 0.30 && errorRisk < 0.60;
  const isLowRisk = errorRisk < 0.30;

  const riskTier = isLowRisk ? 'LOW' : isMediumRisk ? 'MEDIUM' : 'HIGH';
  const riskColor = isLowRisk ? '#1F7A5A' : isMediumRisk ? '#E9A23B' : '#E76F51';

  // Needle Angle: -120deg (0.0) to +120deg (1.0)
  const needleAngle = -120 + errorRisk * 240;

  // Preset Configurations
  const applyPreset = (preset: 'nominal' | 'borderline' | 'high-risk') => {
    setActiveScenario(preset);
    if (preset === 'nominal') {
      setConfidence(96);
      setImageQuality(94);
      setEvidenceStrength(95);
      setUncertainty(12);
    } else if (preset === 'borderline') {
      setConfidence(82);
      setImageQuality(66);
      setEvidenceStrength(64);
      setUncertainty(46);
    } else {
      setConfidence(56);
      setImageQuality(32);
      setEvidenceStrength(26);
      setUncertainty(86);
    }
  };

  // Safety Gate Triage Verdict
  const gateVerdict = isLowRisk
    ? {
        title: 'AUTOMATED CLINICAL CLEARANCE',
        desc: 'Prediction error risk is below safety tripwire. High epistemic confidence & high image quality allow direct straight-through triage.',
        badge: 'AUTOMATED APPROVAL',
        badgeBg: 'bg-[#1F7A5A]/10 text-[#1F7A5A] border-[#1F7A5A]/30',
        route: 'Direct to e-Sanjeevani Tele-OPD',
        icon: ShieldCheck,
      }
    : isMediumRisk
    ? {
        title: 'FLAGGED FOR HUMAN SPECIALIST REVIEW',
        desc: 'Elevated epistemic uncertainty detected. The AI refuses to make an autonomous decision without secondary sign-off by a certified vitreo-retina ophthalmologist.',
        badge: 'HUMAN-IN-THE-LOOP',
        badgeBg: 'bg-[#E9A23B]/10 text-[#8A5612] border-[#E9A23B]/30',
        route: 'Secondary Specialist Clinical Queue',
        icon: UserCheck,
      }
    : {
        title: 'SAFETY INTERCEPT • AUTONOMOUS REJECTION',
        desc: 'Critical prediction error risk! Compromised optical clarity or out-of-distribution anomaly detected. The model refuses to guess, preventing potentially catastrophic misdiagnosis.',
        badge: 'SCAN REJECTED (RECAPTURE)',
        badgeBg: 'bg-[#E76F51]/10 text-[#B9381E] border-[#E76F51]/30',
        route: 'ASHA Recapture Protocol Order',
        icon: AlertOctagon,
      };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pb-16 space-y-8 select-none">
      {/* ─── 1. PAGE HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
              {t.modules.m9Badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
            {t.modules.m9Title}
          </h1>
          <p className="text-xs sm:text-sm text-[#65736B]">
            {t.modules.m9Desc}
          </p>
        </div>

        {/* Action button to proceed */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/trust')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-md shadow-[#124B3A]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            data-cursor="button"
          >
            <span>{t.modules.m9Action}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Active Scan Pipeline Banner */}
      <ActiveScanPipelineBanner currentModuleNumber={9} />

      {/* ─── 2. CLINICAL SAFETY BANNER & PRESET SWITCHER ─── */}
      <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Core Dictum */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#124B3A] to-[#1F7A5A] flex items-center justify-center text-[#FFFDF8] shadow-sm shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#65736B] block">
              FUNDAMENTAL SAFETY DOCTRINE
            </span>
            <span className="font-serif italic font-black text-sm sm:text-base text-[#124B3A]">
              "Safe AI must know the limits of its own competence."
            </span>
          </div>
        </div>

        {/* Quick-Switch Interactive Presets */}
        <div className="flex flex-wrap items-center gap-2 bg-[#F8F6EF] p-1.5 rounded-2xl border border-[#DDE5DC]">
          <span className="text-[10px] font-mono font-bold text-[#65736B] px-2 hidden sm:inline">
            TEST STRESS CASES:
          </span>
          <button
            onClick={() => applyPreset('nominal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeScenario === 'nominal'
                ? 'bg-[#124B3A] text-white shadow-xs'
                : 'bg-white text-[#65736B] hover:text-[#124B3A]'
            }`}
          >
            <CheckCircle2 size={12} className={activeScenario === 'nominal' ? 'text-[#E9A23B]' : ''} />
            <span>Nominal (Low Risk)</span>
          </button>
          <button
            onClick={() => applyPreset('borderline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeScenario === 'borderline'
                ? 'bg-[#E9A23B] text-[#0A261D] shadow-xs'
                : 'bg-white text-[#8A5612] hover:bg-[#FAF4ED]'
            }`}
          >
            <AlertTriangle size={12} />
            <span>Borderline (Hazy)</span>
          </button>
          <button
            onClick={() => applyPreset('high-risk')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeScenario === 'high-risk'
                ? 'bg-[#E76F51] text-white shadow-xs'
                : 'bg-white text-[#B9381E] hover:bg-[#FDF0EC]'
            }`}
          >
            <AlertOctagon size={12} />
            <span>OOD Anomaly (Reject)</span>
          </button>
        </div>
      </div>

      {/* ─── 3. MAIN WORKSPACE GRID ─── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Large Animated Radial Gauge & Factor Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Circular Gauge Card */}
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-6 flex flex-col items-center relative overflow-hidden">
            <div className="w-full flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-[#124B3A]" />
                <h3 className="text-xs font-bold font-mono text-[#124B3A] uppercase tracking-wide">
                  Meta-Cognitive Calibration Gauge
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8F6EF] text-[#1F7A5A] font-bold border border-[#DDE5DC]">
                Monte Carlo Dropout (N=20 Passes)
              </span>
            </div>

            {/* RADIAL SPEEDOMETER GAUGE WITH ENGINE IGNITION SWEEP (0 to 100% and Settle) */}
            <SpeedometerGauge
              targetRisk={errorRisk}
              riskTier={riskTier}
              riskColor={riskColor}
              isLowRisk={isLowRisk}
              isMediumRisk={isMediumRisk}
              isHighRisk={isHighRisk}
            />

            {/* Dynamic Status Verdict Pill */}
            <div
              className={`w-full p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                isLowRisk
                  ? 'bg-[#E8F3EE] border-[#C8D4C7] text-[#124B3A]'
                  : isMediumRisk
                  ? 'bg-[#FAF4ED] border-[#E9A23B]/40 text-[#8A5612]'
                  : 'bg-[#FDF0EC] border-[#E76F51]/40 text-[#B9381E]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: riskColor }}
                >
                  {isLowRisk ? <ShieldCheck size={18} /> : isMediumRisk ? <UserCheck size={18} /> : <AlertOctagon size={18} />}
                </div>
                <div>
                  <span className="text-xs font-mono font-bold tracking-wide uppercase block">
                    {riskTier} ERROR PROBABILITY
                  </span>
                  <span className="text-xs font-semibold">
                    {isLowRisk
                      ? 'AI confidence calibrated • Nominal diagnostic reliability'
                      : isMediumRisk
                      ? 'Elevated dispersion • Flagged for human clinical sign-off'
                      : 'Severe ambiguity / OOD • Autonomous rejection triggered'}
                  </span>
                </div>
              </div>

              <span
                className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider text-white shrink-0"
                style={{ backgroundColor: riskColor }}
              >
                {riskTier} RISK
              </span>
            </div>

            {/* Interactive Factor Sliders */}
            <div className="w-full space-y-4 pt-2 border-t border-[#DDE5DC]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#124B3A] font-mono uppercase">
                  SIMULATE MULTI-MODAL FACTORS:
                </span>
                <span className="text-[10px] font-mono text-[#65736B]">
                  Live Dynamic Recalibration
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* 1. Model Uncertainty Slider */}
                <div className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#124B3A]">Epistemic Uncertainty</span>
                    <span className="font-mono font-bold text-[#E76F51]">{uncertainty}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={uncertainty}
                    onChange={e => setUncertainty(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#DDE5DC] rounded-lg appearance-none cursor-pointer accent-[#E76F51]"
                  />
                  <div className="text-[10px] text-[#65736B] leading-tight">
                    Monte Carlo dropout variance across deep feature representations.
                  </div>
                </div>

                {/* 2. Image Quality Slider */}
                <div className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#124B3A]">Optical Image Quality</span>
                    <span className="font-mono font-bold text-[#1F7A5A]">{imageQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={imageQuality}
                    onChange={e => setImageQuality(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#DDE5DC] rounded-lg appearance-none cursor-pointer accent-[#1F7A5A]"
                  />
                  <div className="text-[10px] text-[#65736B] leading-tight">
                    ISO 10940 clarity, cataract haze index, and illumination uniformity.
                  </div>
                </div>

                {/* 3. Physical Evidence Strength */}
                <div className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#124B3A]">Evidence Concordance</span>
                    <span className="font-mono font-bold text-[#1F7A5A]">{evidenceStrength}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={evidenceStrength}
                    onChange={e => setEvidenceStrength(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#DDE5DC] rounded-lg appearance-none cursor-pointer accent-[#1F7A5A]"
                  />
                  <div className="text-[10px] text-[#65736B] leading-tight">
                    Concordance with physical lesion count (ETDRS 4-2-1 rules).
                  </div>
                </div>

                {/* 4. Model Confidence */}
                <div className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#124B3A]">Primary Model Confidence</span>
                    <span className="font-mono font-bold text-[#E9A23B]">{confidence}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={confidence}
                    onChange={e => setConfidence(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#DDE5DC] rounded-lg appearance-none cursor-pointer accent-[#E9A23B]"
                  />
                  <div className="text-[10px] text-[#65736B] leading-tight">
                    Dual ResNet-50 & Vision Transformer consensus score.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tri-State Safety Gate & Uncertainty Decomposition (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. TRI-STATE CLINICAL SAFETY GATE */}
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
              <div className="flex items-center gap-2">
                <GitBranch size={16} className="text-[#1F7A5A]" />
                <h3 className="text-xs font-bold font-mono text-[#124B3A] uppercase tracking-wide">
                  Tri-State Safety Decision Gate
                </h3>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${gateVerdict.badgeBg}`}>
                {gateVerdict.badge}
              </span>
            </div>

            {/* Tri-State Visual Pathways */}
            <div className="space-y-3">
              {[
                {
                  id: 'state-1',
                  name: 'State 1: Automated Clearance',
                  condition: 'Error Risk < 30%',
                  action: 'Direct referral to e-Sanjeevani Tele-OPD',
                  active: isLowRisk,
                  color: '#1F7A5A',
                  icon: ShieldCheck,
                },
                {
                  id: 'state-2',
                  name: 'State 2: Human-in-the-Loop Review',
                  condition: 'Error Risk 30% - 60%',
                  action: 'Requires District Vitreo-Retinal specialist sign-off',
                  active: isMediumRisk,
                  color: '#E9A23B',
                  icon: UserCheck,
                },
                {
                  id: 'state-3',
                  name: 'State 3: Autonomous Rejection',
                  condition: 'Error Risk > 60%',
                  action: 'AI refuses to guess • Mandates scan recapture',
                  active: isHighRisk,
                  color: '#E76F51',
                  icon: AlertOctagon,
                },
              ].map((state) => {
                const Icon = state.icon;
                return (
                  <div
                    key={state.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3 ${
                      state.active
                        ? 'bg-white shadow-md border-2'
                        : 'bg-[#F8F6EF]/60 border-[#DDE5DC] opacity-60'
                    }`}
                    style={{
                      borderColor: state.active ? state.color : undefined,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5"
                      style={{ backgroundColor: state.color }}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-[#124B3A]">{state.name}</span>
                        <span className="text-[10px] font-mono font-bold text-[#65736B]">
                          {state.condition}
                        </span>
                      </div>
                      <p className="text-xs text-[#65736B] leading-relaxed">
                        {state.action}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed Verdict Explanation */}
            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#124B3A] uppercase block">
                GATE VERDICT RATIONALE:
              </span>
              <p className="text-xs text-[#17221C] leading-relaxed">
                {gateVerdict.desc}
              </p>
              <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#124B3A] border-t border-[#DDE5DC]/70">
                <span>Triage Destination:</span>
                <span className="font-mono text-[#1F7A5A]">{gateVerdict.route}</span>
              </div>
            </div>
          </div>

          {/* 2. BAYESIAN UNCERTAINTY DECOMPOSITION */}
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-[#124B3A]" />
                <h4 className="text-xs font-bold font-mono text-[#124B3A] uppercase tracking-wide">
                  Uncertainty Decomposition
                </h4>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1F7A5A]/10 text-[#1F7A5A]">
                EPISTEMIC + ALEATORIC
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#124B3A]">Epistemic (Model) Variance</div>
                  <div className="text-[10px] text-[#65736B]">Lack of knowledge in parameter space</div>
                </div>
                <div className="font-mono font-bold text-sm text-[#E76F51]">
                  {(uncertainty * 0.012).toFixed(3)} σ²
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#124B3A]">Aleatoric (Data) Uncertainty</div>
                  <div className="text-[10px] text-[#65736B]">Inherent noise & blur in retinal photonics</div>
                </div>
                <div className="font-mono font-bold text-sm text-[#E9A23B]">
                  {((100 - imageQuality) * 0.015).toFixed(3)} σ²
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#124B3A]">Mahalanobis OOD Distance</div>
                  <div className="text-[10px] text-[#65736B]">Feature distance from rural training cohort</div>
                </div>
                <div className="font-mono font-bold text-sm text-[#1F7A5A]">
                  {(2.14 + uncertainty * 0.04).toFixed(2)} D_M
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-2">
              <button
                onClick={() => navigate('/care')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-lg shadow-[#124B3A]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                data-cursor="button"
              >
                <span>Proceed to Screening Cockpit</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── END-TO-END PIPELINE NAVIGATION ─── */}
      <ModulePipelineNav currentModule={9} />
    </div>
  );
};
