import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionButton } from '../components/motion';
import { ModulePipelineNav } from '../components/layout/ModulePipelineNav';
import { ActiveScanPipelineBanner } from '../components/layout/ActiveScanPipelineBanner';
import { useRetinaData } from '../context/RetinaContext';
import { useAuth } from '../context/AuthContext';
import {
  Hospital,
  Smartphone,
  Cpu,
  ShieldCheck,
  Share2,
  PhoneCall,
  ArrowRight,
  RotateCcw,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  WifiOff,
  Clock,
  HeartPulse,
  Compass,
  Building2,
  Check,
  MapPin,
  Stethoscope,
  Send
} from 'lucide-react';

export type PathwayType = 'routine' | 'specialist' | 'urgent' | 'human-review';

interface PathwayOption {
  id: PathwayType;
  title: string;
  badge: string;
  indication: string;
  recommendedTimeframe: string;
  provider: string;
  clinicalAction: string;
  color: string;
  bgColor: string;
}

const PATHWAYS: PathwayOption[] = [
  {
    id: 'routine',
    title: 'Routine Monitoring',
    badge: 'ANNUAL SCREENING',
    indication: 'Grade 0 (No DR) or stable Grade 1 with peripheral microaneurysms only.',
    recommendedTimeframe: '12 Months',
    provider: 'ASHA Worker / Sub-Health Centre (Village)',
    clinicalAction: 'Routine visual acuity assessment, glycemic control reinforcement, and scheduled annual fundus re-scan.',
    color: '#1F7A5A',
    bgColor: '#E8F3EE',
  },
  {
    id: 'specialist',
    title: 'Specialist Consultation',
    badge: 'NON-URGENT REFERRAL',
    indication: 'Grade 2 (Moderate NPDR) or early macular exudates >1,500μm from FAZ.',
    recommendedTimeframe: '8–12 Weeks',
    provider: 'Sub-Divisional Hospital / Comprehensive Tele-OPD',
    clinicalAction: 'Slit-lamp biomicroscopy, Optical Coherence Tomography (OCT) scan, and personalized diabetic care plan.',
    color: '#E9A23B',
    bgColor: '#FAF4ED',
  },
  {
    id: 'urgent',
    title: 'Urgent Referral',
    badge: 'SIGHT-THREATENING PRIORITY',
    indication: 'Grade 3 (Severe NPDR) or Grade 4 (PDR) with dense circinate exudates within 500μm of FAZ.',
    recommendedTimeframe: '24–48 Hours (Direct Hospital Dispatch)',
    provider: 'District Eye Hospital / Retinal Surgeon',
    clinicalAction: 'Immediate Anti-VEGF intravitreal injection or Pan-Retinal Photocoagulation (PRP) laser to prevent retinal detachment.',
    color: '#E76F51',
    bgColor: '#FDF0EC',
  },
  {
    id: 'human-review',
    title: 'Human Review',
    badge: 'SAFETY INTERCEPTION',
    indication: 'High uncertainty, ungradable media blur, lens dust artifact, or evidence discordance.',
    recommendedTimeframe: 'Immediate Tele-Triage',
    provider: 'Government Tele-Ophthalmologist (e-Sanjeevani)',
    clinicalAction: 'Secondary human verification before patient notification. Autonomous diagnosis suppressed until clinician sign-off.',
    color: '#8A5612',
    bgColor: '#FCF5E9',
  },
];

const JOURNEY_STAGES = [
  { id: 'screen', title: '1. SCREENING', role: 'ASHA Doorstep Scan', desc: '45° non-mydriatic camera' },
  { id: 'risk', title: '2. RISK ASSESSMENT', role: 'Edge AI Staging', desc: '11-module multimodal pipeline' },
  { id: 'rec', title: '3. RECOMMENDATION', role: 'Clinical Protocol', desc: 'ICDR / ETDRS rule engine' },
  { id: 'ref', title: '4. REFERRAL', role: 'ABDM Health Stack', desc: 'Cryptographic ABHA ticket' },
  { id: 'consult', title: '5. SPECIALIST CONSULT', role: 'Tele-Ophthalmology', desc: 'e-Sanjeevani clinical review' },
  { id: 'follow', title: '6. FOLLOW-UP', role: 'Closed-Loop Care', desc: 'Vernacular SMS & ASHA visit' },
];

export const CarePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeImage, imageMetadata, imageSource, pipelineResults } = useRetinaData();
  const { t } = useAuth();

  // Active Pathway Selection (Default to Urgent Referral matching our pipeline patient case)
  const [selectedPathway, setSelectedPathway] = useState<PathwayType>('urgent');

  // Animation Stage Tracking
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(true);

  // Auto-play journey animation on pathway change
  const runJourneyAnimation = () => {
    setIsAnimating(true);
    setActiveStageIdx(0);

    JOURNEY_STAGES.forEach((_, idx) => {
      setTimeout(() => {
        setActiveStageIdx(idx + 1);
      }, (idx + 1) * 350);
    });

    setTimeout(() => {
      setIsAnimating(false);
      setActiveStageIdx(JOURNEY_STAGES.length);
    }, JOURNEY_STAGES.length * 350 + 200);
  };

  useEffect(() => {
    runJourneyAnimation();
  }, [selectedPathway]);

  const activeOption = PATHWAYS.find(p => p.id === selectedPathway) || PATHWAYS[2];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pb-16 space-y-8 select-none">
      {/* ─── 1. PAGE HEADER & TITLE ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
              {t.modules.m11Badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
            {t.modules.m11Title}
          </h1>
          <p className="text-xs sm:text-sm text-[#65736B]">
            {t.modules.m11Desc}
          </p>
        </div>

        {/* Action button to proceed */}
        <div className="flex items-center gap-3">
          <MotionButton
            onClick={() => navigate('/reports')}
            showArrow
            variant="primary"
          >
            {t.modules.m11Action}
          </MotionButton>
        </div>
      </div>

      {/* Active Scan Pipeline Banner */}
      <ActiveScanPipelineBanner currentModuleNumber={11} />

      {/* ─── 2. FINAL MESSAGE & ETHICAL MEDICAL WORDING BANNER ─── */}
      <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Core Final Message */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8F3EE] flex items-center justify-center text-[#124B3A] shrink-0">
            <HeartPulse size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#65736B] block">
              FINAL MISSION STATEMENT
            </span>
            <span className="font-serif italic font-black text-base text-[#124B3A]">
              "From pixels to better lives."
            </span>
          </div>
        </div>

        {/* Ethical Medical Statement */}
        <div className="p-2.5 rounded-xl bg-[#FAF4ED] border border-[#E9A23B]/40 text-xs text-[#8A5612] max-w-xl">
          <strong>Important Medical Notice:</strong> RETINA-FUSION 360 is an <em>AI-assisted screening and decision support system</em>. It equips healthcare personnel with objective anatomical evidence and does <strong>not</strong> replace clinical judgment by certified medical practitioners.
        </div>
      </div>

      {/* ─── 3. RURAL HEALTHCARE TRACK (PHC ➔ AI ➔ EVIDENCE ➔ TRUST ➔ REFERRAL ➔ CARE) ─── */}
      <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-2">
        <span className="text-[10px] font-mono font-bold text-[#65736B] uppercase tracking-wider block">
          RURAL HEALTHCARE CONTINUUM PIPELINE
        </span>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-bold text-[#124B3A]">
          <span className="flex items-center gap-1.5 bg-[#FFFDF8] px-2.5 py-1 rounded-lg border border-[#DDE5DC]">
            <Building2 size={13} className="text-[#1F7A5A]" /> Primary Health Centre (PHC)
          </span>
          <span className="text-[#65736B]">➔</span>
          <span className="flex items-center gap-1.5 bg-[#FFFDF8] px-2.5 py-1 rounded-lg border border-[#DDE5DC]">
            <Cpu size={13} className="text-[#1F7A5A]" /> On-Device AI Screening
          </span>
          <span className="text-[#65736B]">➔</span>
          <span className="flex items-center gap-1.5 bg-[#FFFDF8] px-2.5 py-1 rounded-lg border border-[#DDE5DC]">
            <FileText size={13} className="text-[#E9A23B]" /> Retinal Evidence
          </span>
          <span className="text-[#65736B]">➔</span>
          <span className="flex items-center gap-1.5 bg-[#FFFDF8] px-2.5 py-1 rounded-lg border border-[#DDE5DC]">
            <ShieldCheck size={13} className="text-[#124B3A]" /> Trust Gate
          </span>
          <span className="text-[#65736B]">➔</span>
          <span className="flex items-center gap-1.5 bg-[#FFFDF8] px-2.5 py-1 rounded-lg border border-[#DDE5DC]">
            <Share2 size={13} className="text-[#E76F51]" /> ABDM Referral
          </span>
          <span className="text-[#65736B]">➔</span>
          <span className="flex items-center gap-1.5 bg-[#124B3A] text-white px-2.5 py-1 rounded-lg">
            <HeartPulse size={13} /> Tertiary Care
          </span>
        </div>
      </div>

      {/* ─── 4. ANIMATED HEALTHCARE PATIENT JOURNEY PATHWAY ─── */}
      <div className="bg-[#08170F] rounded-3xl border-2 border-[#1F7A5A]/30 p-6 shadow-inner space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-[#E9A23B] animate-pulse" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wide">
              Sequential Healthcare Pathway Execution
            </h3>
          </div>
          <button
            onClick={runJourneyAnimation}
            className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#DDE5DC] hover:text-white transition-colors"
          >
            <RotateCcw size={12} className={isAnimating ? 'animate-spin' : ''} />
            <span>Replay Journey</span>
          </button>
        </div>

        {/* 6 Sequential Journey Nodes with Connecting Path */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 relative">
          {JOURNEY_STAGES.map((st, idx) => {
            const isDone = idx < activeStageIdx;
            const isCurrent = idx === activeStageIdx - 1 && isAnimating;

            return (
              <motion.div
                key={st.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: isCurrent ? 1.03 : 1,
                }}
                transition={{
                  duration: 0.35,
                  delay: idx * 0.08,
                  ease: 'easeOut',
                }}
                className={`p-3.5 rounded-2xl border transition-all duration-300 relative ${
                  isDone
                    ? 'bg-[#124B3A]/80 border-[#1F7A5A] text-white shadow-md'
                    : 'bg-[#17221C]/60 border-white/10 text-[#65736B]'
                }`}
              >
                {/* Active laser sweep during execution */}
                {isCurrent && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#E9A23B] to-transparent shadow-[0_0_8px_#E9A23B] animate-laser-sweep" />
                )}

                <div className="flex items-center justify-between mb-1 text-[10px] font-mono">
                  <span className={isDone ? 'text-[#E9A23B] font-bold' : 'opacity-60'}>
                    PHASE 0{idx + 1}
                  </span>
                  {isDone && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    >
                      <Check size={12} className="text-[#1F7A5A]" />
                    </motion.span>
                  )}
                </div>

                <h4 className="text-xs font-bold font-mono tracking-tight text-white mb-0.5">
                  {st.title}
                </h4>
                <div className="text-[10px] font-semibold text-[#DDE5DC] mb-1">
                  {st.role}
                </div>
                <p className="text-[9px] text-[#DDE5DC] opacity-75 leading-tight">
                  {st.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Highlighted Pathway Active Indicator */}
        <div className="p-3 rounded-2xl bg-[#17221C]/90 border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeOption.color }}
            />
            <span className="font-mono text-white">
              ACTIVE CARE ACTION: <strong style={{ color: activeOption.color }}>{activeOption.title.toUpperCase()}</strong>
            </span>
          </div>

          <span className="text-[10px] font-mono text-[#DDE5DC]">
            Target Timeframe: <strong>{activeOption.recommendedTimeframe}</strong>
          </span>
        </div>
      </div>

      {/* ─── 5. PATHWAY OPTIONS & DECISION FACTORS GRID ─── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: 4 Interactive Pathway Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#DDE5DC]">
            <h3 className="text-xs font-bold font-mono text-[#124B3A] uppercase tracking-wide">
              Selectable Triage Pathway Options
            </h3>
            <span className="text-[10px] font-mono text-[#65736B]">Click card to simulate</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {PATHWAYS.map(p => {
              const isSelected = selectedPathway === p.id;

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPathway(p.id)}
                  className={`p-5 rounded-3xl border-2 text-left transition-all flex flex-col justify-between shadow-xs ${
                    isSelected
                      ? 'bg-[#FFFDF8] scale-[1.02] shadow-md'
                      : 'bg-[#F8F6EF] border-[#DDE5DC] hover:bg-[#FAF4ED]'
                  }`}
                  style={{
                    borderColor: isSelected ? p.color : undefined,
                  }}
                  data-cursor="button"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${p.color}20`,
                          color: p.color,
                        }}
                      >
                        {p.badge}
                      </span>
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                    </div>

                    <h4 className="text-sm font-black text-[#124B3A]">
                      {p.title}
                    </h4>

                    <p className="text-[11px] text-[#65736B] leading-relaxed">
                      {p.indication}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DDE5DC]/70 space-y-1 text-[10px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#65736B]">Timeframe:</span>
                      <span className="font-bold text-[#17221C]">{p.recommendedTimeframe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#65736B]">Provider:</span>
                      <span className="font-semibold text-[#124B3A] truncate max-w-[140px]">{p.provider.split('/')[0]}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Pathway Deep-Dive Card */}
          <div className="p-5 rounded-3xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DDE5DC]">
              <Stethoscope size={16} className="text-[#124B3A]" />
              <h4 className="text-xs font-bold text-[#124B3A] uppercase tracking-wide">
                Detailed Action Protocol: {activeOption.title}
              </h4>
            </div>

            <p className="text-xs text-[#17221C] leading-relaxed">
              {activeOption.clinicalAction}
            </p>

            <div className="grid sm:grid-cols-3 gap-2 pt-2 text-[11px] font-mono">
              <div className="p-2 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]">
                <span className="text-[9px] text-[#65736B] block">PRIMARY CARE LOCATION</span>
                <span className="font-bold text-[#124B3A]">{activeOption.provider}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]">
                <span className="text-[9px] text-[#65736B] block">ESCALATION WINDOW</span>
                <span className="font-bold text-[#E76F51]">{activeOption.recommendedTimeframe}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]">
                <span className="text-[9px] text-[#65736B] block">COMMUNICATION CHANNEL</span>
                <span className="font-bold text-[#1F7A5A]">ABHA & SMS Dispatch</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 6 Decision Factors & Rural Features (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 6 Decision Factors Card */}
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#124B3A]" />
                <h4 className="text-xs font-bold text-[#124B3A] uppercase tracking-wide">
                  Contextual Decision Factors
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF4ED] text-[#8A5612] border border-[#E9A23B]/30">
                TRIAGE TELEMETRY
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70 flex items-center justify-between">
                <span className="text-[#65736B]">1. Severity:</span>
                <span className="font-bold text-[#E76F51]">Grade 3 (Severe NPDR)</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70 flex items-center justify-between">
                <span className="text-[#65736B]">2. Risk Factors:</span>
                <span className="font-mono font-bold text-[#124B3A]">HbA1c &gt; 9.2% • HTN</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70 flex items-center justify-between">
                <span className="text-[#65736B]">3. Location:</span>
                <span className="font-semibold text-[#17221C]">Jamunahatu PHC (Rural)</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70 flex items-center justify-between">
                <span className="text-[#65736B]">4. Resources:</span>
                <span className="font-semibold text-[#17221C]">District Eye Hospital (42 km)</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70 flex items-center justify-between">
                <span className="text-[#65736B]">5. Model Confidence:</span>
                <span className="font-mono font-bold text-[#1F7A5A]">96.4% Calibrated</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70 flex items-center justify-between">
                <span className="text-[#65736B]">6. Evidence Strength:</span>
                <span className="font-mono font-bold text-[#1F7A5A]">94.8% ETDRS Matched</span>
              </div>
            </div>
          </div>

          {/* Rural Healthcare Ecosystem Features */}
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-[#124B3A] uppercase tracking-wide pb-2 border-b border-[#DDE5DC]">
              Rural Healthcare Infrastructure Features
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]/70">
                <WifiOff size={16} className="text-[#1F7A5A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#124B3A] block">100% Offline-Capable Workflow</span>
                  <p className="text-[11px] text-[#65736B] leading-tight mt-0.5">
                    Operates without cellular reception. Encrypted triage tickets queue locally and sync automatically when entering connectivity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]/70">
                <Hospital size={16} className="text-[#124B3A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#124B3A] block">e-Sanjeevani Tele-Ophthalmology</span>
                  <p className="text-[11px] text-[#65736B] leading-tight mt-0.5">
                    Pre-annotates lesion clusters and structural vectors for ophthalmologists, shrinking review time from 15 min to 90 sec.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]/70">
                <Calendar size={16} className="text-[#124B3A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#124B3A] block">Follow-Up Scheduling & Vernacular SMS</span>
                  <p className="text-[11px] text-[#65736B] leading-tight mt-0.5">
                    Dispatches multilingual SMS reminders (Hindi, Santali, Bengali) to patient and syncs with the ASHA worker's home visit roster.
                  </p>
                </div>
              </div>
            </div>

            {/* Final Return CTA */}
            <div className="pt-2">
              <MotionButton
                onClick={() => navigate('/dashboard')}
                variant="primary"
                showArrow
                className="w-full py-3.5 text-xs shadow-lg shadow-[#124B3A]/25"
              >
                Return to Dashboard (Complete Screening Loop)
              </MotionButton>
            </div>
          </div>
        </div>
      </div>

      {/* ─── END-TO-END PIPELINE NAVIGATION ─── */}
      <ModulePipelineNav currentModule={11} />
    </div>
  );
};
